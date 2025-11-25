/**
 * Orders Service
 * Handles order creation, lifecycle management, and business logic
 * @module services/orders
 */

import { v4 as uuidv4 } from 'uuid';
import config from '../../config/index.js';
import { query, transaction } from '../../config/database.js';
import logger from '../../utils/logger.js';
import { NotFoundError, ValidationError, ConflictError } from '../../utils/errors.js';

/**
 * Generates unique order number
 */
function generateOrderNumber() {
  const prefix = config.order.numberPrefix;
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

/**
 * Calculates order totals
 */
function calculateOrderTotals(items, shippingCost = 0, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shippingCost.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Creates a new order
 * @param {Object} orderData - Order creation data
 * @returns {Promise<Object>} - Created order
 */
export async function createOrder(orderData) {
  const {
    userId,
    items,
    shippingAddress,
    billingAddress,
    couponCode,
    metadata = {},
  } = orderData;
  
  // Validate items
  if (!items || items.length === 0) {
    throw new ValidationError('Order must contain at least one item');
  }
  
  return await transaction(async (client) => {
    // Fetch product details and verify stock
    const productIds = items.map(item => item.productId);
    const variantIds = items.map(item => item.variantId).filter(Boolean);
    
    const productsResult = await client.query(
      `SELECT p.id, p.title, p.price, p.currency, pv.id as variant_id, pv.price_delta, pv.stock
       FROM products p
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       WHERE p.id = ANY($1) OR pv.id = ANY($2)`,
      [productIds, variantIds]
    );
    
    const productsMap = new Map();
    productsResult.rows.forEach(p => {
      const key = p.variant_id || p.id;
      productsMap.set(key, p);
    });
    
    // Build order items with price snapshots
    const orderItems = [];
    for (const item of items) {
      const key = item.variantId || item.productId;
      const product = productsMap.get(key);
      
      if (!product) {
        throw new NotFoundError(`Product ${item.productId}`);
      }
      
      // Check stock availability
      if (item.variantId && product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.title}`);
      }
      
      const itemPrice = product.price + (product.price_delta || 0);
      
      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        priceSnapshot: itemPrice,
        metadata: {
          productTitle: product.title,
          ...item.metadata,
        },
      });
    }
    
    // Calculate totals
    const totals = calculateOrderTotals(
      orderItems.map(item => ({ price: item.priceSnapshot, quantity: item.quantity })),
      metadata.shippingCost || 0,
      metadata.taxRate || 0
    );
    
    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await client.query(
        `SELECT * FROM coupons 
         WHERE code = $1 AND is_active = TRUE 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (usage_limit IS NULL OR used_count < usage_limit)`,
        [couponCode]
      );
      
      if (couponResult.rows.length > 0) {
        const coupon = couponResult.rows[0];
        
        // Check minimum order amount
        if (coupon.min_order_amount && totals.subtotal < coupon.min_order_amount) {
          throw new ValidationError(`Minimum order amount of ${coupon.min_order_amount} required for this coupon`);
        }
        
        // Calculate discount
        let discount = 0;
        if (coupon.type === 'fixed') {
          discount = coupon.amount_or_pct;
        } else if (coupon.type === 'percentage') {
          discount = (totals.subtotal * coupon.amount_or_pct) / 100;
        }
        
        totals.total -= discount;
        totals.discount = parseFloat(discount.toFixed(2));
        
        // Increment coupon usage
        await client.query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
          [coupon.id]
        );
        
        metadata.couponId = coupon.id;
        metadata.couponCode = coupon.code;
        metadata.discount = discount;
      }
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        id, order_number, user_id, status, subtotal, tax, shipping, total, currency,
        shipping_address, billing_address, metadata
      ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        uuidv4(),
        orderNumber,
        userId,
        totals.subtotal,
        totals.tax,
        totals.shipping,
        totals.total,
        config.payment.currency,
        JSON.stringify(shippingAddress),
        JSON.stringify(billingAddress),
        JSON.stringify(metadata),
      ]
    );
    
    const order = orderResult.rows[0];
    
    // Insert order items
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, quantity, price_snapshot, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          order.id,
          item.productId,
          item.variantId,
          item.quantity,
          item.priceSnapshot,
          JSON.stringify(item.metadata),
        ]
      );
      
      // Reserve inventory
      if (item.variantId) {
        const reservationExpiry = new Date();
        reservationExpiry.setMinutes(reservationExpiry.getMinutes() + config.inventory.reservationTTLMinutes);
        
        await client.query(
          `INSERT INTO inventory_reservations (id, order_id, product_variant_id, quantity, reserved_until)
           VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), order.id, item.variantId, item.quantity, reservationExpiry]
        );
      }
    }
    
    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, changes)
       VALUES ($1, 'order_created', 'order', $2, $3)`,
      [userId, order.id, JSON.stringify({ orderNumber, total: totals.total })]
    );
    
    logger.info('Order created', {
      orderId: order.id,
      orderNumber,
      userId,
      total: totals.total,
      itemCount: orderItems.length,
    });
    
    return {
      ...order,
      items: orderItems,
    };
  });
}

/**
 * Gets order details
 */
export async function getOrder(orderId, userId = null, role = 'customer') {
  let whereClause = 'WHERE o.id = $1';
  const params = [orderId];
  
  // Customers can only see their own orders
  if (role === 'customer' && userId) {
    whereClause += ' AND o.user_id = $2';
    params.push(userId);
  }
  
  const result = await query(
    `SELECT o.*, 
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi.product_id,
                'variantId', oi.variant_id,
                'quantity', oi.quantity,
                'price', oi.price_snapshot,
                'metadata', oi.metadata
              )
            ) as items
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     ${whereClause}
     GROUP BY o.id`,
    params
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Order');
  }
  
  return result.rows[0];
}

/**
 * Lists orders with filters
 */
export async function listOrders(filters = {}) {
  const { userId, status, page = 1, limit = 20, role = 'customer' } = filters;
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  const params = [];
  let paramIndex = 1;
  
  // Customers can only see their own orders
  if (role === 'customer' && userId) {
    whereClause = `WHERE user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  if (status) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  params.push(limit, offset);
  
  const result = await query(
    `SELECT o.*, 
            COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON o.id = oi.order_id
     ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );
  
  return result.rows;
}

/**
 * Updates order status
 */
export async function updateOrderStatus(orderId, newStatus, adminId) {
  const validStatuses = ['pending', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'payment_failed'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new ValidationError(`Invalid status: ${newStatus}`);
  }
  
  return await transaction(async (client) => {
    // Get current order
    const orderResult = await client.query(
      'SELECT id, status, user_id FROM orders WHERE id = $1',
      [orderId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new NotFoundError('Order');
    }
    
    const order = orderResult.rows[0];
    const oldStatus = order.status;
    
    // Update status
    await client.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2',
      [newStatus, orderId]
    );
    
    // Handle status-specific logic
    if (newStatus === 'cancelled') {
      // Release inventory reservations
      await client.query(
        'UPDATE inventory_reservations SET released_at = NOW() WHERE order_id = $1 AND released_at IS NULL',
        [orderId]
      );
    }
    
    // Create audit log
    await client.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, entity, entity_id, changes)
       VALUES ($1, 'admin', 'order_status_updated', 'order', $2, $3)`,
      [adminId, orderId, JSON.stringify({ from: oldStatus, to: newStatus })]
    );
    
    logger.info('Order status updated', {
      orderId,
      oldStatus,
      newStatus,
      adminId,
    });
    
    // TODO: Enqueue notification job based on status
    
    return { orderId, oldStatus, newStatus };
  });
}

/**
 * Cancels an order
 */
export async function cancelOrder(orderId, userId, reason = '') {
  return await transaction(async (client) => {
    // Get order
    const orderResult = await client.query(
      'SELECT id, status, user_id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      throw new NotFoundError('Order');
    }
    
    const order = orderResult.rows[0];
    
    // Only pending or pending_payment orders can be cancelled by users
    if (!['pending', 'pending_payment'].includes(order.status)) {
      throw new ValidationError('Order cannot be cancelled at this stage');
    }
    
    // Update status
    await client.query(
      'UPDATE orders SET status = \'cancelled\', metadata = metadata || $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify({ cancellationReason: reason }), orderId]
    );
    
    // Release inventory
    await client.query(
      'UPDATE inventory_reservations SET released_at = NOW() WHERE order_id = $1 AND released_at IS NULL',
      [orderId]
    );
    
    logger.info('Order cancelled by user', { orderId, userId, reason });
    
    return { orderId, status: 'cancelled' };
  });
}

/**
 * Gets order statistics
 */
export async function getOrderStatistics(filters = {}) {
  const { userId, from, to } = filters;
  
  let whereClause = '';
  const params = [];
  let paramIndex = 1;
  
  if (userId) {
    whereClause = `WHERE user_id = $${paramIndex}`;
    params.push(userId);
    paramIndex++;
  }
  
  if (from) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` created_at >= $${paramIndex}`;
    params.push(from);
    paramIndex++;
  }
  
  if (to) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` created_at <= $${paramIndex}`;
    params.push(to);
    paramIndex++;
  }
  
  const result = await query(
    `SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
      SUM(total) as total_revenue,
      AVG(total) as average_order_value
     FROM orders
     ${whereClause}`,
    params
  );
  
  return result.rows[0];
}

/**
 * Updates order tracking number (Admin only)
 * @param {string} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise<Object>} - Updated order
 */
export async function updateTracking(orderId, trackingNumber) {
  // Update tracking number
  const result = await query(
    `UPDATE orders 
     SET tracking_number = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [orderId, trackingNumber]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Order not found');
  }
  
  logger.info('Tracking number updated', { orderId, trackingNumber });
  
  return result.rows[0];
}

export default {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStatistics,
  updateTracking,
};
