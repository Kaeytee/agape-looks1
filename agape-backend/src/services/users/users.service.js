/**
 * Users Service
 * Handles user management operations for admin
 * @module services/users/service
 */

import { query } from '../../config/database.js';
import { NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

/**
 * Get all users with pagination (Admin only)
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Users list with pagination
 */
export async function getUsers(filters = {}) {
  const { role, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  // Build WHERE clause dynamically
  let whereClause = 'WHERE 1=1';
  const params = [];
  let paramIndex = 1;
  
  // Filter by role
  if (role) {
    whereClause += ` AND role = $${paramIndex}`;
    params.push(role);
    paramIndex++;
  }
  
  // Search by name or email
  if (search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  
  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total);
  
  // Get users
  const result = await query(
    `SELECT 
       id,
       email,
       name,
       phone,
       role,
       verified_at,
       created_at,
       updated_at
     FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );
  
  logger.info('Users listed', { count: result.rows.length, total, page, filters });
  
  return {
    users: result.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get user by ID (Admin only)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User details
 */
export async function getUserById(userId) {
  const result = await query(
    `SELECT 
       id,
       email,
       name,
       phone,
       role,
       verified_at,
       created_at,
       updated_at
     FROM users
     WHERE id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  return result.rows[0];
}

/**
 * Update user role (Admin only)
 * @param {string} userId - User ID
 * @param {string} newRole - New role
 * @returns {Promise<Object>} - Updated user
 */
export async function updateUserRole(userId, newRole) {
  const validRoles = ['customer', 'admin'];
  
  if (!validRoles.includes(newRole)) {
    throw new ValidationError(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  }
  
  const result = await query(
    `UPDATE users
     SET role = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, name, role, updated_at`,
    [userId, newRole]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  logger.info('User role updated', { userId, newRole });
  
  return result.rows[0];
}

/**
 * Get user statistics (Admin only)
 * @returns {Promise<Object>} - User statistics
 */
export async function getUserStats() {
  const result = await query(
    `SELECT 
       COUNT(*) as total_users,
       COUNT(*) FILTER (WHERE role = 'customer') as total_customers,
       COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
       COUNT(*) FILTER (WHERE verified_at IS NOT NULL) as verified_users,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_last_30_days
     FROM users`
  );
  
  return result.rows[0];
}

export default {
  getUsers,
  getUserById,
  updateUserRole,
  getUserStats,
};
