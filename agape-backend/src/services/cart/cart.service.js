/**
 * Cart Service
 * Redis-backed cart with PostgreSQL persistence
 * @module services/cart
 */

import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { ValidationError, NotFoundError } from '../../utils/errors.js';

const CART_CACHE_TTL = config.cart.expiryHours * 3600;

/**
 * Gets cart key for Redis
 */
function getCartKey(userId, sessionId = null) {
  return userId ? `cart:user:${userId}` : `cart:session:${sessionId}`;
}

/**
 * Gets user cart (from Redis with DB fallback)
 */
export async function getCart(userId, sessionId = null) {
  const redis = getRedisClient();
  const cacheKey = getCartKey(userId, sessionId);
  
  try {
    // Try Redis first
    const cached = await redis.get(cacheKey);
    if (cached) {
      logger.debug('Cart cache hit', { userId, sessionId });
      return JSON.parse(cached);
    }
  } catch (error) {
    logger.warn('Redis cart read failed', { error: error.message });
  }
  
  // Fallback to database for authenticated users
  if (userId) {
    const result = await query(
      'SELECT * FROM carts WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length > 0) {
      const cart = result.rows[0];
      
      // Cache in Redis
      try {
        await redis.setex(cacheKey, CART_CACHE_TTL, JSON.stringify(cart));
      } catch (error) {
        logger.warn('Redis cart write failed', { error: error.message });
      }
      
      return cart;
    }
  }
  
  // Return empty cart
  return {
    id: uuidv4(),
    user_id: userId,
    items: [],
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Adds item to cart
 */
export async function addItem(userId, sessionId, itemData) {
  const { productId, variantId, quantity } = itemData;
  
  // Validate product exists and has stock
  const productCheck = await query(
    `SELECT p.id, p.title, p.price, p.is_active, pv.id as variant_id, pv.stock, pv.price_delta
     FROM products p
     LEFT JOIN product_variants pv ON p.id = pv.product_id AND pv.id = $2
     WHERE p.id = $1`,
    [productId, variantId]
  );
  
  if (productCheck.rows.length === 0) {
    throw new NotFoundError('Product');
  }
  
  const product = productCheck.rows[0];
  
  if (!product.is_active) {
    throw new ValidationError('Product is not available');
  }
  
  if (variantId && product.stock < quantity) {
    throw new ValidationError('Insufficient stock');
  }
  
  if (quantity > config.cart.itemMaxQuantity) {
    throw new ValidationError(`Maximum ${config.cart.itemMaxQuantity} items per product`);
  }
  
  // Get current cart
  const cart = await getCart(userId, sessionId);
  
  // Calculate price snapshot
  const itemPrice = product.price + (product.price_delta || 0);
  
  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    item => item.productId === productId && item.variantId === (variantId || null)
  );
  
  if (existingItemIndex >= 0) {
    // Update quantity
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].quantity = Math.min(
      cart.items[existingItemIndex].quantity,
      config.cart.itemMaxQuantity
    );
  } else {
    // Add new item
    cart.items.push({
      id: uuidv4(),
      productId,
      variantId: variantId || null,
      quantity,
      price: itemPrice,
      productTitle: product.title,
      addedAt: new Date(),
    });
  }
  
  cart.updated_at = new Date();
  
  // Save to Redis
  await saveCart(cart, userId, sessionId);
  
  logger.info('Item added to cart', { userId, sessionId, productId, quantity });
  
  return cart;
}

/**
 * Updates cart item quantity
 */
export async function updateItem(userId, sessionId, itemId, quantity) {
  if (quantity < 0) {
    throw new ValidationError('Quantity must be positive');
  }
  
  if (quantity > config.cart.itemMaxQuantity) {
    throw new ValidationError(`Maximum ${config.cart.itemMaxQuantity} items per product`);
  }
  
  const cart = await getCart(userId, sessionId);
  
  const itemIndex = cart.items.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    throw new NotFoundError('Cart item');
  }
  
  if (quantity === 0) {
    // Remove item
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
  }
  
  cart.updated_at = new Date();
  
  await saveCart(cart, userId, sessionId);
  
  logger.info('Cart item updated', { userId, sessionId, itemId, quantity });
  
  return cart;
}

/**
 * Removes item from cart
 */
export async function removeItem(userId, sessionId, itemId) {
  const cart = await getCart(userId, sessionId);
  
  cart.items = cart.items.filter(item => item.id !== itemId);
  cart.updated_at = new Date();
  
  await saveCart(cart, userId, sessionId);
  
  logger.info('Item removed from cart', { userId, sessionId, itemId });
  
  return cart;
}

/**
 * Clears cart
 */
export async function clearCart(userId, sessionId) {
  const cart = await getCart(userId, sessionId);
  
  cart.items = [];
  cart.updated_at = new Date();
  
  await saveCart(cart, userId, sessionId);
  
  logger.info('Cart cleared', { userId, sessionId });
  
  return cart;
}

/**
 * Merges guest cart with user cart on login
 */
export async function mergeCart(userId, sessionId) {
  const guestCart = await getCart(null, sessionId);
  const userCart = await getCart(userId, null);
  
  if (guestCart.items.length === 0) {
    return userCart;
  }
  
  // Merge items
  for (const guestItem of guestCart.items) {
    const existingIndex = userCart.items.findIndex(
      item => item.productId === guestItem.productId && item.variantId === guestItem.variantId
    );
    
    if (existingIndex >= 0) {
      // Add quantities
      userCart.items[existingIndex].quantity = Math.min(
        userCart.items[existingIndex].quantity + guestItem.quantity,
        config.cart.itemMaxQuantity
      );
    } else {
      // Add new item
      userCart.items.push(guestItem);
    }
  }
  
  userCart.updated_at = new Date();
  
  await saveCart(userCart, userId, null);
  
  // Clear guest cart
  const redis = getRedisClient();
  await redis.del(getCartKey(null, sessionId));
  
  logger.info('Carts merged', { userId, sessionId, itemCount: userCart.items.length });
  
  return userCart;
}

/**
 * Saves cart to Redis and DB
 */
async function saveCart(cart, userId, sessionId) {
  const redis = getRedisClient();
  const cacheKey = getCartKey(userId, sessionId);
  
  // Save to Redis
  try {
    await redis.setex(cacheKey, CART_CACHE_TTL, JSON.stringify(cart));
  } catch (error) {
    logger.error('Failed to save cart to Redis', { error: error.message });
  }
  
  // Persist to DB for authenticated users
  if (userId) {
    try {
      await query(
        `INSERT INTO carts (id, user_id, items, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) 
         DO UPDATE SET items = $3, updated_at = $5`,
        [cart.id, userId, JSON.stringify(cart.items), cart.created_at, cart.updated_at]
      );
    } catch (error) {
      logger.error('Failed to persist cart to DB', { error: error.message });
    }
  }
}

/**
 * Calculates cart totals
 */
export async function calculateTotals(userId, sessionId) {
  const cart = await getCart(userId, sessionId);
  
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    itemCount,
    items: cart.items,
  };
}

export default {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
  calculateTotals,
};
