/**
 * Admin Routes
 * @module services/admin/routes
 */

import express from 'express';
import Joi from 'joi';
import * as adminController from './admin.controller.js';
import * as ordersController from '../orders/orders.controller.js';
import * as usersController from '../users/users.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware.js';
import { uuidSchema, orderStatusSchema } from '../../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

const statsQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
});

const trendsQuerySchema = Joi.object({
  period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  limit: Joi.number().integer().min(1).max(365).default(30),
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  operation: Joi.string().valid('set', 'increment', 'decrement').default('set'),
});

const ordersListQuerySchema = Joi.object({
  status: orderStatusSchema.optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const updateOrderStatusSchema = Joi.object({
  status: orderStatusSchema.required(),
  notes: Joi.string().max(500).optional(),
});

const updateTrackingSchema = Joi.object({
  trackingNumber: Joi.string().required(),
});

const usersListQuerySchema = Joi.object({
  role: Joi.string().valid('customer', 'admin').optional(),
  search: Joi.string().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid('customer', 'admin').required(),
});

// Dashboard routes
router.get('/dashboard/stats', validateQuery(statsQuerySchema), adminController.getDashboardStats);
router.get('/dashboard/trends', validateQuery(trendsQuerySchema), adminController.getSalesTrends);
router.get('/dashboard/top-products', adminController.getTopProducts);

// Inventory routes
router.get('/inventory/low-stock', adminController.getLowStockAlerts);
router.get('/inventory/stats', adminController.getInventoryStats);
router.patch('/inventory/:variantId/stock', validateParams(Joi.object({ variantId: uuidSchema })), validateBody(updateStockSchema), adminController.updateStock);

// Orders management routes
router.get('/orders', validateQuery(ordersListQuerySchema), ordersController.listAllOrders);
router.patch('/orders/:id/status', validateParams(Joi.object({ id: uuidSchema })), validateBody(updateOrderStatusSchema), ordersController.updateOrderStatus);
router.patch('/orders/:id/tracking', validateParams(Joi.object({ id: uuidSchema })), validateBody(updateTrackingSchema), ordersController.updateTracking);

// Users/Customers management routes
router.get('/users/stats', usersController.getUserStats);
router.get('/users/:id', validateParams(Joi.object({ id: uuidSchema })), usersController.getUserById);
router.get('/users', validateQuery(usersListQuerySchema), usersController.getUsers);
router.patch('/users/:id/role', validateParams(Joi.object({ id: uuidSchema })), validateBody(updateUserRoleSchema), usersController.updateUserRole);

// Audit and reports routes
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports/sales/export', validateQuery(statsQuerySchema), adminController.exportSales);

export default router;
