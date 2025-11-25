/**
 * Wishlist Controller
 * Handles HTTP requests for wishlist operations
 * @module services/wishlist/controller
 */

import { asyncHandler } from '../../middleware/error.middleware.js';
import * as wishlistService from './wishlist.service.js';

/**
 * Get user's wishlist
 * GET /api/v1/wishlist
 */
export const getWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.getWishlist(req.user.id);

  res.json({
    status: 'success',
    data: { items, count: items.length },
  });
});

/**
 * Add item to wishlist
 * POST /api/v1/wishlist
 */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.body;

  const item = await wishlistService.addToWishlist(
    req.user.id,
    productId,
    variantId
  );

  res.status(201).json({
    status: 'success',
    message: 'Item added to wishlist',
    data: { item },
  });
});

/**
 * Remove item from wishlist
 * DELETE /api/v1/wishlist/:id
 */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await wishlistService.removeFromWishlist(req.user.id, id);

  res.json({
    status: 'success',
    message: 'Item removed from wishlist',
  });
});

/**
 * Clear entire wishlist
 * DELETE /api/v1/wishlist
 */
export const clearWishlist = asyncHandler(async (req, res) => {
  const count = await wishlistService.clearWishlist(req.user.id);

  res.json({
    status: 'success',
    message: 'Wishlist cleared',
    data: { itemsRemoved: count },
  });
});

/**
 * Check if product is in wishlist
 * GET /api/v1/wishlist/check/:productId
 */
export const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId } = req.query;

  const inWishlist = await wishlistService.isInWishlist(
    req.user.id,
    productId,
    variantId
  );

  res.json({
    status: 'success',
    data: { inWishlist },
  });
});
