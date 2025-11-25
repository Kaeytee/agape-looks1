/**
 * Orders Routes
 * @module services/orders/routes
 */

import express from 'express';
import Joi from 'joi';
import * as ordersController from './orders.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import { uuidSchema, orderStatusSchema } from '../../utils/validators.js';

const router = express.Router();

// Validation schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: uuidSchema,
      variantId: uuidSchema.optional(),
      quantity: Joi.number().integer().min(1).required(),
      metadata: Joi.object().optional(),
    })
  ).min(1).required(),
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().optional(),
  }).required(),
  billingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().optional(),
  }).optional(),
  couponCode: Joi.string().optional(),
  metadata: Joi.object().optional(),
});

const updateStatusSchema = Joi.object({
  status: orderStatusSchema.required(),
});

const cancelSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});

const listQuerySchema = Joi.object({
  status: orderStatusSchema.optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const statsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

// Protected routes (customer orders)
router.post('/', authenticate, validateBody(createOrderSchema), ordersController.createOrder);
router.get('/stats', authenticate, validateQuery(statsQuerySchema), ordersController.getOrderStatistics);
router.get('/:id', authenticate, validateParams(Joi.object({ id: uuidSchema })), ordersController.getOrder);
router.get('/', authenticate, validateQuery(listQuerySchema), ordersController.listOrders);
router.post('/:id/cancel', authenticate, validateParams(Joi.object({ id: uuidSchema })), validateBody(cancelSchema), ordersController.cancelOrder);

// Note: Admin order routes are in /admin/orders (see admin.routes.js)

export default router;
