/**
 * Wishlist Service
 * Handles wishlist operations for users
 * @module services/wishlist/service
 */

import { query } from '../../config/database.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

/**
 * Get user's wishlist
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Wishlist items
 */
export async function getWishlist(userId) {
  const result = await query(
    `SELECT 
       w.id,
       w.product_id,
       w.variant_id,
       w.created_at,
       p.title as product_title,
       p.sku as product_sku,
       p.price as product_price,
       p.currency,
       p.description,
       pv.variant_name,
       pv.price_delta,
       pv.sku as variant_sku,
       pv.stock as variant_stock
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     LEFT JOIN product_variants pv ON w.variant_id = pv.id
     WHERE w.user_id = $1
     ORDER BY w.created_at DESC`,
    [userId]
  );

  return result.rows.map(row => ({
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    product: {
      title: row.product_title,
      sku: row.product_sku,
      price: parseFloat(row.product_price),
      currency: row.currency,
      description: row.description,
    },
    variant: row.variant_id ? {
      name: row.variant_name,
      priceDelta: parseFloat(row.price_delta || 0),
      sku: row.variant_sku,
      stock: row.variant_stock,
    } : null,
    addedAt: row.created_at,
  }));
}

/**
 * Add item to wishlist
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {string} variantId - Variant ID (optional)
 * @returns {Promise<Object>} - Created wishlist item
 */
export async function addToWishlist(userId, productId, variantId = null) {
  // Check if product exists
  const productResult = await query(
    'SELECT id FROM products WHERE id = $1',
    [productId]
  );

  if (productResult.rows.length === 0) {
    throw new NotFoundError('Product not found');
  }

  // Check if variant exists if provided
  if (variantId) {
    const variantResult = await query(
      'SELECT id, stock FROM product_variants WHERE id = $1 AND product_id = $2',
      [variantId, productId]
    );

    if (variantResult.rows.length === 0) {
      throw new NotFoundError('Product variant not found');
    }
  }

  // Check if already in wishlist
  const existingResult = await query(
    `SELECT id FROM wishlists 
     WHERE user_id = $1 AND product_id = $2 
     AND ($3::uuid IS NULL OR variant_id = $3)`,
    [userId, productId, variantId]
  );

  if (existingResult.rows.length > 0) {
    throw new ConflictError('Item already in wishlist');
  }

  // Add to wishlist
  const result = await query(
    `INSERT INTO wishlists (user_id, product_id, variant_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, productId, variantId]
  );

  logger.info('Item added to wishlist', { 
    userId, 
    productId, 
    variantId,
    wishlistItemId: result.rows[0].id 
  });

  return result.rows[0];
}

/**
 * Remove item from wishlist
 * @param {string} userId - User ID
 * @param {string} wishlistItemId - Wishlist item ID
 * @returns {Promise<void>}
 */
export async function removeFromWishlist(userId, wishlistItemId) {
  const result = await query(
    'DELETE FROM wishlists WHERE id = $1 AND user_id = $2 RETURNING *',
    [wishlistItemId, userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Wishlist item not found');
  }

  logger.info('Item removed from wishlist', { userId, wishlistItemId });
}

/**
 * Clear user's entire wishlist
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of items removed
 */
export async function clearWishlist(userId) {
  const result = await query(
    'DELETE FROM wishlists WHERE user_id = $1 RETURNING id',
    [userId]
  );

  logger.info('Wishlist cleared', { userId, itemsRemoved: result.rows.length });

  return result.rows.length;
}

/**
 * Check if product is in user's wishlist
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {string} variantId - Variant ID (optional)
 * @returns {Promise<boolean>} - True if in wishlist
 */
export async function isInWishlist(userId, productId, variantId = null) {
  const result = await query(
    `SELECT id FROM wishlists 
     WHERE user_id = $1 AND product_id = $2 
     AND ($3::uuid IS NULL OR variant_id = $3)`,
    [userId, productId, variantId]
  );

  return result.rows.length > 0;
}

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
};
