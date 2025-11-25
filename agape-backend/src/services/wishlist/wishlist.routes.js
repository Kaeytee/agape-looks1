/**
 * Wishlist Routes
 * @module services/wishlist/routes
 */

import express from 'express';
import Joi from 'joi';
import * as wishlistController from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams } from '../../middleware/validation.middleware.js';
import { uuidSchema } from '../../utils/validators.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(authenticate);

// Validation schemas
const addToWishlistSchema = Joi.object({
  productId: uuidSchema.required(),
  variantId: uuidSchema.optional(),
});

// Routes
router.get('/', wishlistController.getWishlist);
router.post('/', validateBody(addToWishlistSchema), wishlistController.addToWishlist);
router.delete('/', wishlistController.clearWishlist);
router.get('/check/:productId', validateParams(Joi.object({ productId: uuidSchema })), wishlistController.checkWishlist);
router.delete('/:id', validateParams(Joi.object({ id: uuidSchema })), wishlistController.removeFromWishlist);

export default router;
