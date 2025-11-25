/**
 * Payments Routes
 * @module services/payments/routes
 */

import express from 'express';
import Joi from 'joi';
import * as paymentsController from './payments.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import { uuidSchema } from '../../utils/validators.js';

const router = express.Router();

// Validation schemas
const initializeSchema = Joi.object({
  orderId: uuidSchema,
  amount: Joi.number().positive().required(),
  metadata: Joi.object().optional(),
});

const refundSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  reason: Joi.string().max(500).required(),
});

const listQuerySchema = Joi.object({
  status: Joi.string().valid('initialized', 'paid', 'failed', 'refunded').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Public webhook endpoint (no auth required)
router.post('/webhook', paymentsController.handleWebhook);

// Protected routes
router.post('/initialize', authenticate, validateBody(initializeSchema), paymentsController.initializePayment);
router.get('/verify/:reference', authenticate, paymentsController.verifyPayment);
router.get('/:id', authenticate, validateParams(Joi.object({ id: uuidSchema })), paymentsController.getPayment);
router.get('/', authenticate, validateQuery(listQuerySchema), paymentsController.listPayments);

// Admin routes
router.post('/:id/refund', authenticate, requireAdmin, validateParams(Joi.object({ id: uuidSchema })), validateBody(refundSchema), paymentsController.refundPayment);

export default router;
