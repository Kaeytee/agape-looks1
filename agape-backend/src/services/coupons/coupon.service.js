/**
 * Coupon Service
 * Manages discount coupons and free shipping offers
 * @module services/coupons
 */

import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../../config/database.js';
import logger from '../../utils/logger.js';
import { ValidationError, NotFoundError, ConflictError } from '../../utils/errors.js';

/**
 * Creates a new coupon
 */
export async function createCoupon(data) {
  const {
    code,
    type,
    amountOrPct,
    minOrderAmount = 0,
    expiresAt = null,
    usageLimit = null,
    perUserLimit = 1,
    description = '',
    isActive = true,
  } = data;

  // Validate type
  if (!['percentage', 'fixed', 'free_shipping'].includes(type)) {
    throw new ValidationError('Invalid coupon type. Must be percentage, fixed, or free_shipping');
  }

  // Validate amount/percentage
  if (type === 'percentage' && (amountOrPct < 0 || amountOrPct > 100)) {
    throw new ValidationError('Percentage must be between 0 and 100');
  }

  if ((type === 'fixed' || type === 'free_shipping') && amountOrPct < 0) {
    throw new ValidationError('Amount must be non-negative');
  }

  // Check if code already exists
  const existing = await query('SELECT id FROM coupons WHERE code = $1', [code.toUpperCase()]);
  
  if (existing.rows.length > 0) {
    throw new ConflictError('Coupon code already exists');
  }

  const result = await query(
    `INSERT INTO coupons (
      code, type, amount_or_pct, min_order_amount, expires_at, 
      usage_limit, per_user_limit, description, is_active, metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      code.toUpperCase(),
      type,
      amountOrPct,
      minOrderAmount,
      expiresAt,
      usageLimit,
      perUserLimit,
      description,
      isActive,
      JSON.stringify({}),
    ]
  );

  logger.info('Coupon created', { code: code.toUpperCase(), type });

  return formatCoupon(result.rows[0]);
}

/**
 * Gets all coupons with optional filters
 */
export async function getCoupons(filters = {}) {
  const { isActive, type, limit = 100, offset = 0, search } = filters;

  let queryText = `
    SELECT 
      c.*,
      COUNT(cu.id) as total_usage,
      COALESCE(SUM(cu.discount_amount), 0) as total_discount_given
    FROM coupons c
    LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  if (isActive !== undefined) {
    queryText += ` AND c.is_active = $${paramCount}`;
    params.push(isActive);
    paramCount++;
  }

  if (type) {
    queryText += ` AND c.type = $${paramCount}`;
    params.push(type);
    paramCount++;
  }

  if (search) {
    queryText += ` AND (c.code ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }

  queryText += `
    GROUP BY c.id
    ORDER BY c.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;
  params.push(limit, offset);

  const result = await query(queryText, params);

  return result.rows.map(row => ({
    ...formatCoupon(row),
    totalUsage: parseInt(row.total_usage) || 0,
    totalDiscountGiven: parseFloat(row.total_discount_given) || 0,
  }));
}

/**
 * Gets coupon statistics
 */
export async function getCouponStats() {
  const result = await query(`
    SELECT 
      COUNT(*) as total_coupons,
      COUNT(*) FILTER (WHERE is_active = true) as active_coupons,
      COUNT(*) FILTER (WHERE expires_at < NOW() AND is_active = true) as expired_coupons,
      COUNT(DISTINCT cu.id) as total_redemptions,
      COALESCE(SUM(cu.discount_amount), 0) as total_discount_given
    FROM coupons c
    LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
  `);

  return {
    totalCoupons: parseInt(result.rows[0].total_coupons) || 0,
    activeCoupons: parseInt(result.rows[0].active_coupons) || 0,
    expiredCoupons: parseInt(result.rows[0].expired_coupons) || 0,
    totalRedemptions: parseInt(result.rows[0].total_redemptions) || 0,
    totalDiscountGiven: parseFloat(result.rows[0].total_discount_given) || 0,
  };
}

/**
 * Gets a single coupon by ID
 */
export async function getCouponById(id) {
  const result = await query(
    `SELECT 
      c.*,
      COUNT(cu.id) as total_usage,
      COALESCE(SUM(cu.discount_amount), 0) as total_discount_given
    FROM coupons c
    LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
    WHERE c.id = $1
    GROUP BY c.id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Coupon');
  }

  const row = result.rows[0];
  return {
    ...formatCoupon(row),
    totalUsage: parseInt(row.total_usage) || 0,
    totalDiscountGiven: parseFloat(row.total_discount_given) || 0,
  };
}

/**
 * Gets a coupon by code
 */
export async function getCouponByCode(code) {
  const result = await query(
    'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)',
    [code]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Coupon');
  }

  return formatCoupon(result.rows[0]);
}

/**
 * Updates a coupon
 */
export async function updateCoupon(id, updates) {
  const allowedUpdates = [
    'description',
    'minOrderAmount',
    'expiresAt',
    'usageLimit',
    'perUserLimit',
    'isActive',
  ];

  const setClauses = [];
  const params = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (allowedUpdates.includes(key)) {
      setClauses.push(`${snakeKey} = $${paramCount}`);
      params.push(updates[key]);
      paramCount++;
    }
  });

  if (setClauses.length === 0) {
    throw new ValidationError('No valid fields to update');
  }

  params.push(id);

  const result = await query(
    `UPDATE coupons 
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING *`,
    params
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Coupon');
  }

  logger.info('Coupon updated', { id });

  return formatCoupon(result.rows[0]);
}

/**
 * Deletes a coupon
 */
export async function deleteCoupon(id) {
  const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);

  if (result.rows.length === 0) {
    throw new NotFoundError('Coupon');
  }

  logger.info('Coupon deleted', { id });

  return formatCoupon(result.rows[0]);
}

/**
 * Validates a coupon code for use
 */
export async function validateCoupon(code, userId, cartSubtotal) {
  const coupon = await getCouponByCode(code);

  // Check if active
  if (!coupon.isActive) {
    throw new ValidationError('This coupon is no longer active');
  }

  // Check expiration
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new ValidationError('This coupon has expired');
  }

  // Check minimum order amount
  if (cartSubtotal < coupon.minOrderAmount) {
    throw new ValidationError(
      `Minimum order amount of ${coupon.minOrderAmount} required to use this coupon`
    );
  }

  // Check total usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ValidationError('This coupon has reached its usage limit');
  }

  // Check per-user usage limit
  if (userId && coupon.perUserLimit !== null) {
    const userUsage = await query(
      'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, userId]
    );

    if (parseInt(userUsage.rows[0].count) >= coupon.perUserLimit) {
      throw new ValidationError('You have already used this coupon the maximum number of times');
    }
  }

  return coupon;
}

/**
 * Applies a coupon to calculate discount
 */
export async function applyCoupon(code, userId, cartSubtotal, shippingFee) {
  const coupon = await validateCoupon(code, userId, cartSubtotal);

  let discount = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case 'percentage':
      discount = (cartSubtotal * coupon.amountOrPct) / 100;
      break;
    case 'fixed':
      discount = Math.min(coupon.amountOrPct, cartSubtotal);
      break;
    case 'free_shipping':
      freeShipping = true;
      discount = shippingFee;
      break;
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discount: parseFloat(discount.toFixed(2)),
    freeShipping,
    description: coupon.description,
  };
}

/**
 * Records coupon usage
 */
export async function recordCouponUsage(couponId, userId, orderId, discountAmount) {
  await query(
    `INSERT INTO coupon_usage (coupon_id, user_id, order_id, discount_amount)
     VALUES ($1, $2, $3, $4)`,
    [couponId, userId, orderId, discountAmount]
  );

  // Increment used_count
  await query(
    'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
    [couponId]
  );

  logger.info('Coupon usage recorded', { couponId, orderId, discountAmount });
}

/**
 * Gets coupon usage history
 */
export async function getCouponUsageHistory(couponId, limit = 50, offset = 0) {
  const result = await query(
    `SELECT 
      cu.*,
      u.name as user_name,
      u.email as user_email,
      o.order_number
    FROM coupon_usage cu
    LEFT JOIN users u ON cu.user_id = u.id
    LEFT JOIN orders o ON cu.order_id = o.id
    WHERE cu.coupon_id = $1
    ORDER BY cu.created_at DESC
    LIMIT $2 OFFSET $3`,
    [couponId, limit, offset]
  );

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    orderId: row.order_id,
    orderNumber: row.order_number,
    discountAmount: parseFloat(row.discount_amount),
    createdAt: row.created_at,
  }));
}

/**
 * Formats coupon data for API response
 */
function formatCoupon(row) {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    amountOrPct: parseFloat(row.amount_or_pct),
    minOrderAmount: parseFloat(row.min_order_amount),
    expiresAt: row.expires_at,
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    perUserLimit: row.per_user_limit,
    description: row.description,
    isActive: row.is_active,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export default {
  createCoupon,
  getCoupons,
  getCouponStats,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  recordCouponUsage,
  getCouponUsageHistory,
};
