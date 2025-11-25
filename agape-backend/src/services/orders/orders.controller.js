/**
 * Orders Controller
 * @module services/orders/controller
 */

import * as ordersService from './orders.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

/**
 * Create order
 * POST /api/v1/orders
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, billingAddress, couponCode, metadata } = req.body;
  
  const order = await ordersService.createOrder({
    userId: req.user.id,
    items,
    shippingAddress,
    billingAddress,
    couponCode,
    metadata,
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Order created successfully',
    data: { order },
  });
});

/**
 * Get order details
 * GET /api/v1/orders/:id
 */
export const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const order = await ordersService.getOrder(id, req.user.id, req.user.role);
  
  res.json({
    status: 'success',
    data: { order },
  });
});

/**
 * List orders
 * GET /api/v1/orders
 */
export const listOrders = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  
  const orders = await ordersService.listOrders({
    userId: req.user.role === 'customer' ? req.user.id : undefined,
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    role: req.user.role,
  });
  
  res.json({
    status: 'success',
    data: { orders },
  });
});

/**
 * Update order status (Admin)
 * PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const result = await ordersService.updateOrderStatus(id, status, req.user.id);
  
  res.json({
    status: 'success',
    message: 'Order status updated successfully',
    data: result,
  });
});

/**
 * Cancel order
 * POST /api/v1/orders/:id/cancel
 */
export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  const result = await ordersService.cancelOrder(id, req.user.id, reason);
  
  res.json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: result,
  });
});

/**
 * Get order statistics
 * GET /api/v1/orders/stats
 */
export const getOrderStatistics = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  
  const stats = await ordersService.getOrderStatistics({
    userId: req.user.role === 'customer' ? req.user.id : undefined,
    from,
    to,
  });
  
  res.json({
    status: 'success',
    data: { statistics: stats },
  });
});

/**
 * List all orders (Admin)
 * GET /api/v1/admin/orders
 */
export const listAllOrders = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  
  // Admin can see all orders
  const orders = await ordersService.listOrders({
    status,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    // No userId filter for admin
  });
  
  res.json({
    status: 'success',
    data: orders,
  });
});

/**
 * Update tracking number (Admin)
 * PATCH /api/v1/admin/orders/:id/tracking
 */
export const updateTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;
  
  const order = await ordersService.updateTracking(id, trackingNumber);
  
  res.json({
    status: 'success',
    message: 'Tracking number updated successfully',
    data: { order },
  });
});
