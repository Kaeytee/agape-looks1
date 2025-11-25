/**
 * Payments Service
 * Handles payment initialization, verification, webhooks, refunds, and reconciliation
 * @module services/payments
 */

import { v4 as uuidv4 } from 'uuid';
import config from '../../config/index.js';
import { query, transaction } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import * as paystackClient from '../../integrations/paystack.client.js';
import logger from '../../utils/logger.js';
import { PaymentError, NotFoundError, ValidationError } from '../../utils/errors.js';

/**
 * Initializes payment for an order
 * @param {Object} params - Payment initialization parameters
 * @returns {Promise<Object>} - Payment initialization response with authorization URL
 */
export async function initializePayment(params) {
  const { orderId, userId, email, amount, metadata = {} } = params;
  
  // Generate unique payment reference
  const reference = paystackClient.generateTransactionReference(orderId);
  
  return await transaction(async (client) => {
    // Create payment record
    const paymentResult = await client.query(
      `INSERT INTO payments (id, order_id, gateway, gateway_ref, amount, currency, status, raw_response)
       VALUES ($1, $2, 'paystack', $3, $4, $5, 'initialized', '{}')
       RETURNING id, gateway_ref, amount, currency, status, created_at`,
      [uuidv4(), orderId, reference, amount, config.payment.currency]
    );
    
    const payment = paymentResult.rows[0];
    
    // Store payment intent in Redis with 20 minute TTL
    const redis = getRedisClient();
    await redis.setex(
      `payment:${reference}`,
      1200, // 20 minutes
      JSON.stringify({
        paymentId: payment.id,
        orderId,
        userId,
        amount,
        createdAt: new Date().toISOString(),
      })
    );
    
    // Initialize transaction with Paystack
    const paystackResponse = await paystackClient.initializeTransaction({
      email,
      amount,
      reference,
      metadata: {
        ...metadata,
        order_id: orderId,
        user_id: userId,
        payment_id: payment.id,
      },
      callbackUrl: `${config.paystack.callbackUrl}?reference=${reference}`,
    });
    
    // Update payment with Paystack response
    await client.query(
      `UPDATE payments SET raw_response = $1 WHERE id = $2`,
      [JSON.stringify(paystackResponse), payment.id]
    );
    
    logger.info('Payment initialized', {
      paymentId: payment.id,
      orderId,
      reference,
      amount,
      authUrl: paystackResponse.authorization_url,
    });
    
    return {
      paymentId: payment.id,
      reference,
      authorizationUrl: paystackResponse.authorization_url,
      accessCode: paystackResponse.access_code,
      amount: payment.amount,
      currency: payment.currency,
    };
  });
}

/**
 * Verifies payment after user completes checkout
 * @param {string} reference - Payment reference
 * @returns {Promise<Object>} - Verification result with order and payment status
 */
export async function verifyPayment(reference) {
  // Check Redis cache first
  const redis = getRedisClient();
  const cachedIntent = await redis.get(`payment:${reference}`);
  
  if (!cachedIntent) {
    logger.warn('Payment intent not found in cache', { reference });
  }
  
  // Verify with Paystack
  const paystackTransaction = await paystackClient.verifyTransaction(reference);
  
  // Check if transaction is successful
  if (!paystackClient.isTransactionSuccessful(paystackTransaction)) {
    throw new PaymentError(`Payment verification failed: ${paystackTransaction.gateway_response}`);
  }
  
  return await transaction(async (client) => {
    // Get payment record
    const paymentResult = await client.query(
      'SELECT id, order_id, status, amount FROM payments WHERE gateway_ref = $1',
      [reference]
    );
    
    if (paymentResult.rows.length === 0) {
      throw new NotFoundError('Payment');
    }
    
    const payment = paymentResult.rows[0];
    
    // Prevent double processing (idempotency)
    if (payment.status === 'paid' || payment.status === 'success') {
      logger.warn('Payment already processed', { reference, paymentId: payment.id });
      return {
        paymentId: payment.id,
        orderId: payment.order_id,
        status: 'already_processed',
        message: 'Payment has already been verified',
      };
    }
    
    // Verify amount matches
    const expectedAmount = Math.round(payment.amount * 100); // Convert to kobo
    if (paystackTransaction.amount !== expectedAmount) {
      logger.error('Payment amount mismatch', {
        reference,
        expected: expectedAmount,
        received: paystackTransaction.amount,
      });
      throw new PaymentError('Payment amount mismatch');
    }
    
    // Update payment status
    await client.query(
      `UPDATE payments 
       SET status = 'paid', 
           settled_at = NOW(), 
           raw_response = $1
       WHERE id = $2`,
      [JSON.stringify(paystackTransaction), payment.id]
    );
    
    // Update order status
    await client.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`,
      [payment.order_id]
    );
    
    // Clear Redis cache
    await redis.del(`payment:${reference}`);
    
    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, changes)
       VALUES ($1, 'payment_verified', 'payment', $2, $3)`,
      [
        null, // System action
        payment.id,
        JSON.stringify({
          reference,
          amount: paystackTransaction.amount / 100,
          gateway_response: paystackTransaction.gateway_response,
        }),
      ]
    );
    
    logger.info('Payment verified and order updated', {
      paymentId: payment.id,
      orderId: payment.order_id,
      reference,
      amount: paystackTransaction.amount / 100,
    });
    
    // TODO: Enqueue post-payment jobs (invoice generation, notifications)
    
    return {
      paymentId: payment.id,
      orderId: payment.order_id,
      status: 'success',
      amount: paystackTransaction.amount / 100,
      paidAt: paystackTransaction.paid_at,
    };
  });
}

/**
 * Processes Paystack webhook events
 * @param {Object} event - Webhook event payload
 * @param {string} signature - Webhook signature for verification
 * @returns {Promise<Object>} - Processing result
 */
export async function processWebhook(event, signature) {
  // Verify webhook signature
  const isValid = paystackClient.verifyWebhookSignature(JSON.stringify(event), signature);
  
  if (!isValid) {
    logger.error('Invalid webhook signature', { event: event.event });
    throw new ValidationError('Invalid webhook signature');
  }
  
  // Check for duplicate webhook events (idempotency)
  const eventId = `${event.event}_${event.data.reference}_${event.data.id}`;
  
  const existingEvent = await query(
    'SELECT id FROM webhook_events WHERE event_id = $1',
    [eventId]
  );
  
  if (existingEvent.rows.length > 0) {
    logger.warn('Duplicate webhook event', { eventId });
    return { status: 'duplicate', eventId };
  }
  
  return await transaction(async (client) => {
    // Store webhook event
    const webhookResult = await client.query(
      `INSERT INTO webhook_events (id, gateway, event_id, event_type, payload, status)
       VALUES ($1, 'paystack', $2, $3, $4, 'processing')
       RETURNING id`,
      [uuidv4(), eventId, event.event, JSON.stringify(event)]
    );
    
    const webhookId = webhookResult.rows[0].id;
    
    try {
      // Parse event data
      const parsedEvent = paystackClient.parseWebhookEvent(event);
      
      // Handle different event types
      let result;
      switch (event.event) {
        case 'charge.success':
          result = await handleChargeSuccess(client, parsedEvent);
          break;
        
        case 'charge.failed':
          result = await handleChargeFailed(client, parsedEvent);
          break;
        
        case 'transfer.success':
        case 'transfer.failed':
          result = await handleTransferEvent(client, parsedEvent);
          break;
        
        default:
          logger.info('Unhandled webhook event type', { eventType: event.event });
          result = { handled: false };
      }
      
      // Mark webhook as processed
      await client.query(
        `UPDATE webhook_events SET status = 'processed', processed_at = NOW() WHERE id = $1`,
        [webhookId]
      );
      
      logger.info('Webhook processed successfully', {
        webhookId,
        eventType: event.event,
        reference: parsedEvent.data.reference,
      });
      
      return {
        status: 'success',
        webhookId,
        result,
      };
    } catch (error) {
      // Mark webhook as failed
      await client.query(
        `UPDATE webhook_events 
         SET status = 'failed', 
             error_message = $1, 
             retry_count = retry_count + 1
         WHERE id = $2`,
        [error.message, webhookId]
      );
      
      logger.error('Webhook processing failed', {
        webhookId,
        error: error.message,
        stack: error.stack,
      });
      
      throw error;
    }
  });
}

/**
 * Handles successful charge webhook
 */
async function handleChargeSuccess(client, event) {
  const { reference, amount, status } = event.data;
  
  // Update payment if not already processed
  const result = await client.query(
    `UPDATE payments 
     SET status = 'paid', settled_at = NOW()
     WHERE gateway_ref = $1 AND status != 'paid'
     RETURNING id, order_id`,
    [reference]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    // Update order status
    await client.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`,
      [payment.order_id]
    );
    
    return { paymentId: payment.id, orderId: payment.order_id };
  }
  
  return { alreadyProcessed: true };
}

/**
 * Handles failed charge webhook
 */
async function handleChargeFailed(client, event) {
  const { reference, gatewayResponse } = event.data;
  
  const result = await client.query(
    `UPDATE payments 
     SET status = 'failed'
     WHERE gateway_ref = $1
     RETURNING id, order_id`,
    [reference]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    // Update order status
    await client.query(
      `UPDATE orders SET status = 'payment_failed', updated_at = NOW() WHERE id = $1`,
      [payment.order_id]
    );
    
    return { paymentId: payment.id, orderId: payment.order_id };
  }
  
  return { notFound: true };
}

/**
 * Handles transfer events (for refunds)
 */
async function handleTransferEvent(client, event) {
  // Implementation for refund tracking
  return { handled: true };
}

/**
 * Initiates refund for a payment
 * @param {string} paymentId - Payment ID to refund
 * @param {number} amount - Refund amount (null for full refund)
 * @param {string} reason - Refund reason
 * @param {string} adminId - Admin user ID initiating refund
 * @returns {Promise<Object>} - Refund result
 */
export async function initiateRefund(paymentId, amount = null, reason = '', adminId) {
  return await transaction(async (client) => {
    // Get payment details
    const paymentResult = await client.query(
      `SELECT id, order_id, gateway_ref, amount, status
       FROM payments WHERE id = $1`,
      [paymentId]
    );
    
    if (paymentResult.rows.length === 0) {
      throw new NotFoundError('Payment');
    }
    
    const payment = paymentResult.rows[0];
    
    if (payment.status !== 'paid') {
      throw new PaymentError('Only paid payments can be refunded');
    }
    
    const refundAmount = amount || payment.amount;
    
    // Initiate refund with Paystack
    const paystackRefund = await paystackClient.refundTransaction(
      payment.gateway_ref,
      refundAmount,
      reason
    );
    
    // Create refund record
    const refundResult = await client.query(
      `INSERT INTO refunds (id, payment_id, order_id, amount, gateway_ref, status, reason)
       VALUES ($1, $2, $3, $4, $5, 'requested', $6)
       RETURNING id, amount, status, created_at`,
      [uuidv4(), payment.id, payment.order_id, refundAmount, paystackRefund.id, reason]
    );
    
    const refund = refundResult.rows[0];
    
    // Update order status
    const newOrderStatus = refundAmount === payment.amount ? 'refunded' : 'partially_refunded';
    await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newOrderStatus, payment.order_id]
    );
    
    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'refund_initiated', 'payment', $2, $3)`,
      [adminId, payment.id, JSON.stringify({ amount: refundAmount, reason })]
    );
    
    logger.info('Refund initiated', {
      refundId: refund.id,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: refundAmount,
    });
    
    return {
      refundId: refund.id,
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: refundAmount,
      status: refund.status,
    };
  });
}

/**
 * Gets payment details
 */
export async function getPayment(paymentId) {
  const result = await query(
    `SELECT p.*, o.order_number 
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     WHERE p.id = $1`,
    [paymentId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Payment');
  }
  
  return result.rows[0];
}

/**
 * Lists payments with filters
 */
export async function listPayments(filters = {}) {
  const { userId, status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  const params = [];
  let paramIndex = 1;
  
  if (userId) {
    whereClause += ` WHERE o.user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  if (status) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` p.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  params.push(limit, offset);
  
  const result = await query(
    `SELECT p.*, o.order_number, o.total
     FROM payments p
     LEFT JOIN orders o ON o.id = p.order_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );
  
  return result.rows;
}

export default {
  initializePayment,
  verifyPayment,
  processWebhook,
  initiateRefund,
  getPayment,
  listPayments,
};
