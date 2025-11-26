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
       w.id as wishlist_item_id,
       w.product_id,
       w.variant_id,
       w.created_at as added_at,
       p.*,
       (SELECT json_agg(pi.* ORDER BY pi.position) 
        FROM product_images pi 
        WHERE pi.product_id = p.id) as images,
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
    id: row.product_id, // Use Product ID as the main ID for frontend compatibility
    wishlistId: row.wishlist_item_id, // Keep track of wishlist item ID
    sku: row.sku,
    title: row.title,
    slug: row.slug,
    description: row.description,
    shortDescription: row.metadata?.short_description || '',
    fullStory: row.description,
    price: parseFloat(row.price),
    currency: row.currency,
    weight: row.weight,
    dimensions: row.dimensions,
    inventory: row.inventory,
    images: row.images || [],
    tags: row.tags || [],
    metadata: row.metadata || {},
    isFeatured: row.metadata?.is_featured || false,
    isLimited: row.metadata?.is_limited || false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Wishlist specific fields
    addedAt: row.added_at,
    selectedVariant: row.variant_id ? {
      id: row.variant_id,
      name: row.variant_name,
      priceDelta: parseFloat(row.price_delta || 0),
      sku: row.variant_sku,
      stock: row.variant_stock,
    } : null,
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
 * @param {string} productId - Product ID
 * @returns {Promise<void>}
 */
export async function removeFromWishlist(userId, productId) {
  const result = await query(
    'DELETE FROM wishlists WHERE product_id = $1 AND user_id = $2 RETURNING *',
    [productId, userId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Wishlist item not found');
  }

  logger.info('Item removed from wishlist', { userId, productId });
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
