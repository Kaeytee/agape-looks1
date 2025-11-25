/**
 * Products Routes
 * @module services/products/routes
 */

import express from 'express';
import Joi from 'joi';
import * as productsController from './products.controller.js';
import { authenticate, requireAdmin, optionalAuth } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import { uuidSchema } from '../../utils/validators.js';

const router = express.Router();

const createProductSchema = Joi.object({
  sku: Joi.string().required(),
  title: Joi.string().min(3).max(500).required(),
  description: Joi.string().optional(),
  price: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('NGN'),
  categoryId: uuidSchema.optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object().optional(),
  variants: Joi.array().items(Joi.object({
    variantName: Joi.string().required(),
    sku: Joi.string().required(),
    priceDelta: Joi.number().default(0),
    stock: Joi.number().integer().min(0).default(0),
    metadata: Joi.object().optional(),
  })).optional(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    publicId: Joi.string().required(),
    altText: Joi.string().optional(),
  })).optional(),
  metadata: Joi.object().optional(),
});

const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(500).optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  weight: Joi.number().positive().optional(),
  dimensions: Joi.object().optional(),
  category_id: uuidSchema.optional(),
  is_active: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
});

const listQuerySchema = Joi.object({
  categoryId: uuidSchema.optional(),
  search: Joi.string().optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  isFeatured: Joi.boolean().optional(),
  tags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  colors: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  inStock: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('created_at', 'price', 'title').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

const searchQuerySchema = Joi.object({
  q: Joi.string().required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

// Public routes
router.get('/search', validateQuery(searchQuerySchema), productsController.searchProducts);
router.get('/categories', productsController.getCategories);
router.get('/:id', validateParams(Joi.object({ id: uuidSchema })), productsController.getProduct);
router.get('/', validateQuery(listQuerySchema), productsController.listProducts);

// Admin routes
router.post('/', authenticate, requireAdmin, validateBody(createProductSchema), productsController.createProduct);
router.patch('/:id', authenticate, requireAdmin, validateParams(Joi.object({ id: uuidSchema })), validateBody(updateProductSchema), productsController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, validateParams(Joi.object({ id: uuidSchema })), productsController.deleteProduct);

export default router;
