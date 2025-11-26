/**
 * Coupon Routes
 * @module services/coupons/routes
 */

import express from 'express';
import Joi from 'joi';
import * as couponController from './coupon.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import { uuidSchema } from '../../utils/validators.js';

const router = express.Router();

const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(50).uppercase().required(),
  type: Joi.string().valid('percentage', 'fixed', 'free_shipping').required(),
  amountOrPct: Joi.number().min(0).required(),
  minOrderAmount: Joi.number().min(0).default(0),
  expiresAt: Joi.date().iso().optional().allow(null),
  usageLimit: Joi.number().integer().min(1).optional().allow(null),
  perUserLimit: Joi.number().integer().min(1).default(1),
  description: Joi.string().max(500).allow('').default(''),
  isActive: Joi.boolean().default(true),
});

const updateCouponSchema = Joi.object({
  description: Joi.string().max(500).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
  expiresAt: Joi.date().iso().optional().allow(null),
  usageLimit: Joi.number().integer().min(1).optional().allow(null),
  perUserLimit: Joi.number().integer().min(1).optional(),
  isActive: Joi.boolean().optional(),
});

const applyCouponSchema = Joi.object({
  code: Joi.string().required(),
  cartSubtotal: Joi.number().min(0).required(),
  shippingFee: Joi.number().min(0).default(0),
});

const validateCouponSchema = Joi.object({
  cartSubtotal: Joi.number().min(0).required(),
});

const getCouponsQuerySchema = Joi.object({
  isActive: Joi.string().valid('true', 'false').optional(),
  type: Joi.string().valid('percentage', 'fixed', 'free_shipping').optional(),
  limit: Joi.number().integer().min(1).max(100).default(100),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().optional(),
});

// Admin routes (protected)
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateBody(createCouponSchema),
  couponController.createCoupon
);

router.get(
  '/',
  authenticate,
  requireAdmin,
  validateQuery(getCouponsQuerySchema),
  couponController.getCoupons
);

router.get(
  '/stats',
  authenticate,
  requireAdmin,
  couponController.getCouponStats
);

router.get(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(Joi.object({ id: uuidSchema })),
  couponController.getCouponById
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(Joi.object({ id: uuidSchema })),
  validateBody(updateCouponSchema),
  couponController.updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  validateParams(Joi.object({ id: uuidSchema })),
  couponController.deleteCoupon
);

router.get(
  '/:id/usage',
  authenticate,
  requireAdmin,
  validateParams(Joi.object({ id: uuidSchema })),
  couponController.getCouponUsageHistory
);

// Public routes (for cart/checkout)
router.post(
  '/apply',
  optionalAuth,
  validateBody(applyCouponSchema),
  couponController.applyCoupon
);

router.post(
  '/validate/:code',
  optionalAuth,
  validateParams(Joi.object({ code: Joi.string().required() })),
  validateBody(validateCouponSchema),
  couponController.validateCoupon
);

export default router;
