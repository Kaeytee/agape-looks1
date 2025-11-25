/**
 * Cart Controller
 * @module services/cart/controller
 */

import * as cartService from './cart.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user?.id, req.sessionID);
  
  res.json({
    status: 'success',
    data: { cart },
  });
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  
  const cart = await cartService.addItem(req.user?.id, req.sessionID, {
    productId,
    variantId,
    quantity,
  });
  
  res.json({
    status: 'success',
    message: 'Item added to cart',
    data: { cart },
  });
});

export const updateItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  
  const cart = await cartService.updateItem(req.user?.id, req.sessionID, itemId, quantity);
  
  res.json({
    status: 'success',
    message: 'Cart updated',
    data: { cart },
  });
});

export const removeItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  
  const cart = await cartService.removeItem(req.user?.id, req.sessionID, itemId);
  
  res.json({
    status: 'success',
    message: 'Item removed',
    data: { cart },
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user?.id, req.sessionID);
  
  res.json({
    status: 'success',
    message: 'Cart cleared',
    data: { cart },
  });
});

export const mergeCart = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  
  const cart = await cartService.mergeCart(req.user.id, sessionId);
  
  res.json({
    status: 'success',
    message: 'Cart merged successfully',
    data: { cart },
  });
});

export const getCartTotals = asyncHandler(async (req, res) => {
  const totals = await cartService.calculateTotals(req.user?.id, req.sessionID);
  
  res.json({
    status: 'success',
    data: totals,
  });
});
