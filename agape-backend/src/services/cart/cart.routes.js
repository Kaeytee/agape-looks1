/**
 * Cart Routes
 * @module services/cart/routes
 */

import express from 'express';
import Joi from 'joi';
import * as cartController from './cart.controller.js';
import { optionalAuth, authenticate } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validation.middleware.js';
import { uuidSchema } from '../../utils/validators.js';

const router = express.Router();

const addItemSchema = Joi.object({
  productId: uuidSchema,
  variantId: uuidSchema.optional(),
  quantity: Joi.number().integer().min(1).required(),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
});

const mergeCartSchema = Joi.object({
  sessionId: Joi.string().required(),
});

router.get('/', optionalAuth, cartController.getCart);
router.get('/totals', optionalAuth, cartController.getCartTotals);
router.post('/items', optionalAuth, validateBody(addItemSchema), cartController.addItem);
router.patch('/items/:itemId', optionalAuth, validateParams(Joi.object({ itemId: uuidSchema })), validateBody(updateItemSchema), cartController.updateItem);
router.delete('/items/:itemId', optionalAuth, validateParams(Joi.object({ itemId: uuidSchema })), cartController.removeItem);
router.delete('/', optionalAuth, cartController.clearCart);
router.post('/merge', authenticate, validateBody(mergeCartSchema), cartController.mergeCart);

export default router;
