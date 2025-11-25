/**
 * Paystack API Client
 * Abstraction layer for all Paystack payment gateway operations
 * @module integrations/paystack
 */

import axios from 'axios';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ExternalServiceError } from '../utils/errors.js';
import { createHmacSignature, verifyHmacSignature } from '../utils/crypto.js';

/**
 * Base Paystack HTTP client with retry logic
 */
const paystackClient = axios.create({
  baseURL: config.paystack.baseUrl,
  headers: {
    'Authorization': `Bearer ${config.paystack.secretKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
paystackClient.interceptors.request.use(
  (config) => {
    logger.debug('Paystack API request', {
      method: config.method,
      url: config.url,
      data: config.data,
    });
    return config;
  },
  (error) => {
    logger.error('Paystack request error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
paystackClient.interceptors.response.use(
  (response) => {
    logger.debug('Paystack API response', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    logger.error('Paystack API error', {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
    throw new ExternalServiceError('Paystack', errorMessage);
  }
);

/**
 * Initializes a payment transaction
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} - Transaction initialization response
 */
export async function initializeTransaction(params) {
  const { email, amount, reference, metadata = {}, callbackUrl } = params;
  
  try {
    const response = await paystackClient.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference,
      callback_url: callbackUrl || config.paystack.callbackUrl,
      metadata,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    });
    
    logger.info('Payment initialized', {
      reference,
      email,
      amount,
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Payment initialization failed', {
      reference,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Verifies a payment transaction
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} - Transaction verification response
 */
export async function verifyTransaction(reference) {
  try {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);
    
    const data = response.data.data;
    
    logger.info('Payment verified', {
      reference,
      status: data.status,
      amount: data.amount / 100,
      gateway_response: data.gateway_response,
    });
    
    return data;
  } catch (error) {
    logger.error('Payment verification failed', {
      reference,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Fetches transaction details
 * @param {number} transactionId - Paystack transaction ID
 * @returns {Promise<Object>} - Transaction details
 */
export async function fetchTransaction(transactionId) {
  try {
    const response = await paystackClient.get(`/transaction/${transactionId}`);
    return response.data.data;
  } catch (error) {
    logger.error('Transaction fetch failed', { transactionId, error: error.message });
    throw error;
  }
}

/**
 * Lists all transactions with optional filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} - List of transactions
 */
export async function listTransactions(filters = {}) {
  const { perPage = 50, page = 1, from, to, status } = filters;
  
  try {
    const response = await paystackClient.get('/transaction', {
      params: { perPage, page, from, to, status },
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Transaction list failed', { error: error.message });
    throw error;
  }
}

/**
 * Initiates a refund
 * @param {string} reference - Transaction reference
 * @param {number} amount - Refund amount in currency (not kobo)
 * @param {string} merchantNote - Internal note
 * @returns {Promise<Object>} - Refund response
 */
export async function refundTransaction(reference, amount = null, merchantNote = '') {
  try {
    const payload = {
      transaction: reference,
      merchant_note: merchantNote,
    };
    
    // If partial refund, include amount
    if (amount !== null) {
      payload.amount = Math.round(amount * 100); // Convert to kobo
    }
    
    const response = await paystackClient.post('/refund', payload);
    
    logger.info('Refund initiated', {
      reference,
      amount,
      refundId: response.data.data.id,
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Refund failed', {
      reference,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Fetches refund details
 * @param {string} reference - Refund reference
 * @returns {Promise<Object>} - Refund details
 */
export async function fetchRefund(reference) {
  try {
    const response = await paystackClient.get(`/refund/${reference}`);
    return response.data.data;
  } catch (error) {
    logger.error('Refund fetch failed', { reference, error: error.message });
    throw error;
  }
}

/**
 * Verifies webhook signature from Paystack
 * @param {string} payload - Raw request body
 * @param {string} signature - x-paystack-signature header value
 * @returns {boolean} - True if signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  try {
    const hash = createHmacSignature(payload, config.paystack.webhookSecret);
    return hash === signature;
  } catch (error) {
    logger.error('Webhook signature verification failed', { error: error.message });
    return false;
  }
}

/**
 * Parses webhook event data
 * @param {Object} event - Webhook event object
 * @returns {Object} - Parsed event data
 */
export function parseWebhookEvent(event) {
  return {
    event: event.event,
    data: {
      reference: event.data.reference,
      amount: event.data.amount / 100, // Convert from kobo to currency
      currency: event.data.currency,
      status: event.data.status,
      paidAt: event.data.paid_at,
      createdAt: event.data.created_at,
      channel: event.data.channel,
      customer: {
        email: event.data.customer.email,
        customerId: event.data.customer.id,
      },
      metadata: event.data.metadata,
      gatewayResponse: event.data.gateway_response,
    },
  };
}

/**
 * Generates transaction reference
 * @param {string} prefix - Reference prefix (e.g., order ID)
 * @returns {string} - Unique transaction reference
 */
export function generateTransactionReference(prefix = 'TXN') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Charges authorization (for recurring payments)
 * @param {Object} params - Charge parameters
 * @returns {Promise<Object>} - Charge response
 */
export async function chargeAuthorization(params) {
  const { authorizationCode, email, amount, reference, metadata = {} } = params;
  
  try {
    const response = await paystackClient.post('/transaction/charge_authorization', {
      authorization_code: authorizationCode,
      email,
      amount: Math.round(amount * 100),
      reference,
      metadata,
    });
    
    logger.info('Authorization charged', {
      reference,
      email,
      amount,
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Authorization charge failed', {
      reference,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Checks if transaction is successful
 * @param {Object} transaction - Transaction object from Paystack
 * @returns {boolean} - True if transaction was successful
 */
export function isTransactionSuccessful(transaction) {
  return transaction.status === 'success' && transaction.gateway_response === 'Successful';
}

/**
 * Exports payment summary for reconciliation
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} - List of transactions
 */
export async function exportTransactionsForReconciliation(from, to) {
  try {
    const transactions = await listTransactions({
      from,
      to,
      perPage: 100,
      status: 'success',
    });
    
    return transactions.map(txn => ({
      reference: txn.reference,
      amount: txn.amount / 100,
      currency: txn.currency,
      status: txn.status,
      paidAt: txn.paid_at,
      channel: txn.channel,
      customerEmail: txn.customer.email,
    }));
  } catch (error) {
    logger.error('Transaction export failed', { error: error.message });
    throw error;
  }
}

export default {
  initializeTransaction,
  verifyTransaction,
  fetchTransaction,
  listTransactions,
  refundTransaction,
  fetchRefund,
  verifyWebhookSignature,
  parseWebhookEvent,
  generateTransactionReference,
  chargeAuthorization,
  isTransactionSuccessful,
  exportTransactionsForReconciliation,
};
