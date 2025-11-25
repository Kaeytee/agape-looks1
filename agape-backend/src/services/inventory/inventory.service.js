/**
 * Inventory Service
 * Handles stock tracking, reservations, and optimistic locking
 * @module services/inventory
 */

import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import config from '../../config/index.js';
import logger from '../../utils/logger.js';
import { ValidationError, NotFoundError, ConflictError } from '../../utils/errors.js';

/**
 * Reserves inventory for order checkout
 * Uses Redis for TTL and DB for persistence
 */
export async function reserveInventory(orderId, items) {
  return await transaction(async (client) => {
    const redis = getRedisClient();
    const reservationExpiry = new Date();
    reservationExpiry.setMinutes(reservationExpiry.getMinutes() + config.inventory.reservationTTLMinutes);
    
    for (const item of items) {
      const { variantId, quantity } = item;
      
      // Get current stock with optimistic lock
      const variantResult = await client.query(
        'SELECT id, stock, version FROM product_variants WHERE id = $1 FOR UPDATE',
        [variantId]
      );
      
      if (variantResult.rows.length === 0) {
        throw new NotFoundError(`Product variant ${variantId}`);
      }
      
      const variant = variantResult.rows[0];
      
      // Check stock availability
      if (variant.stock < quantity) {
        throw new ValidationError(`Insufficient stock for variant ${variantId}. Available: ${variant.stock}, Requested: ${quantity}`);
      }
      
      // Create reservation in DB
      await client.query(
        `INSERT INTO inventory_reservations (id, order_id, product_variant_id, quantity, reserved_until)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), orderId, variantId, quantity, reservationExpiry]
      );
      
      // Store in Redis with TTL
      const redisKey = `reservation:${orderId}:${variantId}`;
      await redis.setex(
        redisKey,
        config.inventory.reservationTTLMinutes * 60,
        JSON.stringify({ quantity, expiresAt: reservationExpiry })
      );
      
      logger.info('Inventory reserved', {
        orderId,
        variantId,
        quantity,
        expiresAt: reservationExpiry,
      });
    }
    
    return { orderId, reservedUntil: reservationExpiry };
  });
}

/**
 * Commits inventory reservation (after payment success)
 * Deducts stock permanently
 */
export async function commitReservation(orderId) {
  return await transaction(async (client) => {
    // Get all reservations for order
    const reservationsResult = await client.query(
      `SELECT id, product_variant_id, quantity 
       FROM inventory_reservations 
       WHERE order_id = $1 AND released_at IS NULL`,
      [orderId]
    );
    
    if (reservationsResult.rows.length === 0) {
      logger.warn('No reservations found for order', { orderId });
      return { orderId, committed: 0 };
    }
    
    const redis = getRedisClient();
    
    for (const reservation of reservationsResult.rows) {
      const { product_variant_id, quantity } = reservation;
      
      // Update stock with optimistic locking
      const updateResult = await client.query(
        `UPDATE product_variants 
         SET stock = stock - $1, version = version + 1, updated_at = NOW()
         WHERE id = $2 AND stock >= $1
         RETURNING id, stock`,
        [quantity, product_variant_id]
      );
      
      if (updateResult.rows.length === 0) {
        throw new ConflictError(`Failed to commit inventory for variant ${product_variant_id}. Stock insufficient or concurrent update.`);
      }
      
      // Mark reservation as released (committed)
      await client.query(
        'UPDATE inventory_reservations SET released_at = NOW() WHERE id = $1',
        [reservation.id]
      );
      
      // Remove from Redis
      await redis.del(`reservation:${orderId}:${product_variant_id}`);
      
      logger.info('Inventory committed', {
        orderId,
        variantId: product_variant_id,
        quantity,
        newStock: updateResult.rows[0].stock,
      });
    }
    
    return { orderId, committed: reservationsResult.rows.length };
  });
}

/**
 * Releases inventory reservation (cancellation or expiry)
 */
export async function releaseReservation(orderId) {
  return await transaction(async (client) => {
    const result = await client.query(
      `UPDATE inventory_reservations 
       SET released_at = NOW() 
       WHERE order_id = $1 AND released_at IS NULL
       RETURNING product_variant_id, quantity`,
      [orderId]
    );
    
    const redis = getRedisClient();
    
    for (const reservation of result.rows) {
      await redis.del(`reservation:${orderId}:${reservation.product_variant_id}`);
      
      logger.info('Inventory reservation released', {
        orderId,
        variantId: reservation.product_variant_id,
        quantity: reservation.quantity,
      });
    }
    
    return { orderId, released: result.rows.length };
  });
}

/**
 * Cleans up expired reservations
 * Should be run as a scheduled job
 */
export async function cleanupExpiredReservations() {
  const result = await query(
    `UPDATE inventory_reservations 
     SET released_at = NOW() 
     WHERE reserved_until < NOW() AND released_at IS NULL
     RETURNING order_id, product_variant_id`
  );
  
  logger.info('Expired reservations cleaned up', { count: result.rows.length });
  
  return { cleaned: result.rows.length };
}

/**
 * Updates stock level (admin operation)
 */
export async function updateStock(variantId, quantity, operation = 'set', adminId) {
  return await transaction(async (client) => {
    // Get current stock
    const variantResult = await client.query(
      'SELECT id, stock, version FROM product_variants WHERE id = $1 FOR UPDATE',
      [variantId]
    );
    
    if (variantResult.rows.length === 0) {
      throw new NotFoundError('Product variant');
    }
    
    const variant = variantResult.rows[0];
    let newStock;
    
    switch (operation) {
      case 'set':
        newStock = quantity;
        break;
      case 'increment':
        newStock = variant.stock + quantity;
        break;
      case 'decrement':
        newStock = variant.stock - quantity;
        break;
      default:
        throw new ValidationError('Invalid operation. Use: set, increment, or decrement');
    }
    
    if (newStock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }
    
    // Update stock
    const updateResult = await client.query(
      `UPDATE product_variants 
       SET stock = $1, version = version + 1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, stock, version`,
      [newStock, variantId]
    );
    
    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'stock_updated', 'product_variant', $2, $3)`,
      [adminId, variantId, JSON.stringify({ operation, quantity, oldStock: variant.stock, newStock })]
    );
    
    logger.info('Stock updated', {
      variantId,
      operation,
      quantity,
      oldStock: variant.stock,
      newStock,
      adminId,
    });
    
    return updateResult.rows[0];
  });
}

/**
 * Gets low stock variants
 */
export async function getLowStockVariants(threshold = null) {
  const stockThreshold = threshold || config.inventory.lowStockThreshold;
  
  const result = await query(
    `SELECT pv.id, pv.variant_name, pv.stock, p.id as product_id, p.title as product_title
     FROM product_variants pv
     JOIN products p ON pv.product_id = p.id
     WHERE pv.stock <= $1 AND pv.stock > 0 AND p.is_active = TRUE
     ORDER BY pv.stock ASC`,
    [stockThreshold]
  );
  
  return result.rows;
}

/**
 * Gets out of stock variants
 */
export async function getOutOfStockVariants() {
  const result = await query(
    `SELECT pv.id, pv.variant_name, p.id as product_id, p.title as product_title
     FROM product_variants pv
     JOIN products p ON pv.product_id = p.id
     WHERE pv.stock = 0 AND p.is_active = TRUE
     ORDER BY p.title ASC`
  );
  
  return result.rows;
}

/**
 * Gets inventory statistics
 */
export async function getInventoryStats() {
  const result = await query(
    `SELECT 
      COUNT(DISTINCT pv.id) as total_variants,
      SUM(pv.stock) as total_stock,
      COUNT(DISTINCT CASE WHEN pv.stock = 0 THEN pv.id END) as out_of_stock_count,
      COUNT(DISTINCT CASE WHEN pv.stock <= $1 AND pv.stock > 0 THEN pv.id END) as low_stock_count
     FROM product_variants pv
     JOIN products p ON pv.product_id = p.id
     WHERE p.is_active = TRUE`,
    [config.inventory.lowStockThreshold]
  );
  
  return result.rows[0];
}

export default {
  reserveInventory,
  commitReservation,
  releaseReservation,
  cleanupExpiredReservations,
  updateStock,
  getLowStockVariants,
  getOutOfStockVariants,
  getInventoryStats,
};
