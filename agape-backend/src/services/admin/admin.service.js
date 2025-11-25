/**
 * Admin Service
 * @module services/admin
 */

import { query } from '../../config/database.js';
import logger from '../../utils/logger.js';

/**
 * Gets dashboard statistics
 */
export async function getDashboardStats(filters = {}) {
  const { from, to } = filters;
  
  let dateFilter = '';
  const params = [];
  
  if (from && to) {
    dateFilter = 'WHERE created_at BETWEEN $1 AND $2';
    params.push(from, to);
  }
  
  // Get order statistics
  const orderStats = await query(
    `SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
      SUM(total) as total_revenue,
      AVG(total) as average_order_value
     FROM orders ${dateFilter}`,
    params
  );
  
  // Get user statistics
  const userStats = await query('SELECT COUNT(*) as total_users FROM users');
  
  // Get product statistics
  const productStats = await query(
    'SELECT COUNT(*) as total_products FROM products WHERE is_active = TRUE'
  );
  
  return {
    orders: orderStats.rows[0],
    users: userStats.rows[0],
    products: productStats.rows[0],
  };
}

/**
 * Gets sales trends
 */
export async function getSalesTrends(period = 'daily', limit = 30) {
  const groupBy = period === 'daily' ? 'DATE(created_at)' : 
                  period === 'weekly' ? 'DATE_TRUNC(\'week\', created_at)' :
                  'DATE_TRUNC(\'month\', created_at)';
  
  const result = await query(
    `SELECT 
      ${groupBy} as period,
      COUNT(*) as order_count,
      SUM(total) as revenue
     FROM orders
     WHERE status IN ('paid', 'processing', 'shipped', 'delivered')
     GROUP BY ${groupBy}
     ORDER BY period DESC
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

/**
 * Gets top selling products
 */
export async function getTopProducts(limit = 10) {
  const result = await query(
    `SELECT 
      p.id,
      p.title,
      p.price,
      COUNT(oi.id) as order_count,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price_snapshot) as revenue
     FROM products p
     JOIN order_items oi ON p.id = oi.product_id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status IN ('paid', 'processing', 'shipped', 'delivered')
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}

/**
 * Gets recent audit logs
 */
export async function getAuditLogs(filters = {}) {
  const { entity, entityId, actorId, limit = 50 } = filters;
  
  let whereClause = '';
  const params = [];
  let paramIndex = 1;
  
  if (entity) {
    whereClause = `WHERE entity = $${paramIndex}`;
    params.push(entity);
    paramIndex++;
  }
  
  if (entityId) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` entity_id = $${paramIndex}`;
    params.push(entityId);
    paramIndex++;
  }
  
  if (actorId) {
    whereClause += whereClause ? ' AND' : ' WHERE';
    whereClause += ` actor_id = $${paramIndex}`;
    params.push(actorId);
    paramIndex++;
  }
  
  params.push(limit);
  
  const result = await query(
    `SELECT al.*, u.email as actor_email
     FROM audit_logs al
     LEFT JOIN users u ON al.actor_id = u.id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIndex}`,
    params
  );
  
  return result.rows;
}

/**
 * Exports sales data to CSV format
 */
export async function exportSalesData(filters = {}) {
  const { from, to } = filters;
  
  let whereClause = '';
  const params = [];
  
  if (from && to) {
    whereClause = 'WHERE o.created_at BETWEEN $1 AND $2';
    params.push(from, to);
  }
  
  const result = await query(
    `SELECT 
      o.order_number,
      o.created_at,
      o.status,
      o.total,
      u.email,
      u.name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ${whereClause}
     ORDER BY o.created_at DESC`,
    params
  );
  
  return result.rows;
}

export default {
  getDashboardStats,
  getSalesTrends,
  getTopProducts,
  getAuditLogs,
  exportSalesData,
};
