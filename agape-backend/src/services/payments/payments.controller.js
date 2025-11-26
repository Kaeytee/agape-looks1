/**
 * Payments Controller
 * @module services/payments/controller
 */

import * as paymentsService from './payments.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';
import logger from '../../utils/logger.js';

/**
 * Initialize payment
 * POST /api/v1/payments/initialize
 */
export const initializePayment = asyncHandler(async (req, res) => {
  // Validate user is authenticated
  if (!req.user || !req.user.id || !req.user.email) {
    logger.error('Payment initialization failed: User not authenticated', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email,
    });
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required. Please log in to complete your purchase.',
    });
  }

  const { orderId, amount, metadata } = req.body;

  logger.info('Initializing payment', {
    orderId,
    userId: req.user.id,
    amount,
  });

  const result = await paymentsService.initializePayment({
    orderId,
    userId: req.user.id,
    email: req.user.email,
    amount,
    metadata,
  });

  res.status(200).json({
    status: 'success',
    message: 'Payment initialized successfully',
    data: result,
  });
});

/**
 * Verify payment
 * GET /api/v1/payments/verify/:reference
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const result = await paymentsService.verifyPayment(reference);

  res.json({
    status: 'success',
    message: 'Payment verified successfully',
    data: result,
  });
});

/**
 * Paystack webhook handler
 * POST /api/v1/payments/webhook
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];

  const result = await paymentsService.processWebhook(req.body, signature);

  // Always return 200 to Paystack to prevent retries
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * Initiate refund (Admin only)
 * POST /api/v1/payments/:id/refund
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const result = await paymentsService.initiateRefund(
    id,
    amount,
    reason,
    req.user.id
  );

  res.json({
    status: 'success',
    message: 'Refund initiated successfully',
    data: result,
  });
});

/**
 * Get payment details
 * GET /api/v1/payments/:id
 */
export const getPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await paymentsService.getPayment(id);

  res.json({
    status: 'success',
    data: { payment },
  });
});

/**
 * List payments
 * GET /api/v1/payments
 */
export const listPayments = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;

  const payments = await paymentsService.listPayments({
    userId: req.user.role === 'customer' ? req.user.id : undefined,
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
  });

  res.json({
    status: 'success',
    data: { payments },
  });
});

/**
 * Payment callback handler - redirects to frontend after Paystack payment
 * GET /api/v1/payments/callback
 */
export const handleCallback = asyncHandler(async (req, res) => {
  const { reference, trxref } = req.query;
  const paymentReference = reference || trxref;

  logger.info('Payment callback received', { reference: paymentReference });

  // Redirect to frontend checkout success page with reference
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/checkout/success?reference=${paymentReference}`);
});
