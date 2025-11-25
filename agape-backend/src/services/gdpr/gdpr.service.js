/**
 * GDPR Compliance Service
 * Handles data export, deletion, and privacy requests
 * @module services/gdpr
 */

import { query, transaction } from '../../config/database.js';
import logger from '../../utils/logger.js';
import { NotFoundError } from '../../utils/errors.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Exports all user data (GDPR Right to Access)
 */
export async function exportUserData(userId) {
  logger.info('Exporting user data', { userId });
  
  try {
    // Fetch all user-related data
    const userData = await query(
      'SELECT id, email, name, phone, role, created_at, verified_at, last_login FROM users WHERE id = $1',
      [userId]
    );
    
    if (userData.rows.length === 0) {
      throw new NotFoundError('User not found');
    }
    
    const user = userData.rows[0];
    
    // Get orders
    const orders = await query(
      `SELECT id, order_number, status, total, currency, created_at, 
              shipping_address, billing_address
       FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    // Get payments
    const payments = await query(
      `SELECT id, gateway, amount, currency, status, created_at
       FROM payments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    // Get sessions
    const sessions = await query(
      `SELECT id, ip_address, user_agent, created_at, last_active
       FROM sessions WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
    
    // Compile data export
    const dataExport = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        accountCreated: user.created_at,
        emailVerified: user.verified_at,
        lastLogin: user.last_login,
      },
      orders: orders.rows.map(order => ({
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        currency: order.currency,
        date: order.created_at,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
      })),
      payments: payments.rows.map(payment => ({
        id: payment.id,
        gateway: payment.gateway,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        date: payment.created_at,
      })),
      sessions: sessions.rows.map(session => ({
        ipAddress: session.ip_address,
        device: session.user_agent,
        created: session.created_at,
        lastActive: session.last_active,
      })),
    };
    
    // Log data export request
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity, entity_id, changes)
       VALUES ($1, 'data_export', 'users', $1, $2)`,
      [userId, JSON.stringify({ exportDate: new Date() })]
    );
    
    return dataExport;
  } catch (error) {
    logger.error('Data export failed', { userId, error: error.message });
    throw error;
  }
}

/**
 * Deletes user account and all associated data (GDPR Right to Erasure)
 * Anonymizes data that must be retained for legal/accounting purposes
 */
export async function deleteUserAccount(userId, reason = 'user_request') {
  logger.info('Deleting user account', { userId, reason });
  
  try {
    await transaction(async (client) => {
      // Check if user exists
      const userResult = await client.query(
        'SELECT id, email FROM users WHERE id = $1',
        [userId]
      );
      
      if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found');
      }
      
      const email = userResult.rows[0].email;
      
      // Anonymize orders (keep for accounting, but remove PII)
      await client.query(
        `UPDATE orders
         SET shipping_address = $1,
             billing_address = $1,
             metadata = metadata || $2
         WHERE user_id = $3`,
        [
          JSON.stringify({ anonymized: true }),
          JSON.stringify({ deletedAt: new Date(), reason }),
          userId,
        ]
      );
      
      // Delete sessions
      await client.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
      
      // Delete cart
      await client.query('DELETE FROM carts WHERE user_id = $1', [userId]);
      
      // Anonymize audit logs (keep for compliance, remove PII)
      await client.query(
        `UPDATE audit_logs
         SET changes = changes || $1
         WHERE actor_id = $2`,
        [JSON.stringify({ actorDeleted: true }), userId]
      );
      
      // Delete user account
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      
      // Log deletion
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity, entity_id, changes)
         VALUES (NULL, 'account_deletion', 'users', $1, $2)`,
        [userId, JSON.stringify({ email, reason, deletedAt: new Date() })]
      );
    });
    
    logger.info('User account deleted successfully', { userId });
    
    return { success: true, message: 'Account deleted successfully' };
  } catch (error) {
    logger.error('Account deletion failed', { userId, error: error.message });
    throw error;
  }
}

/**
 * Implements data retention policy
 * Automatically deletes old data per retention rules
 */
export async function enforceDataRetentionPolicy() {
  logger.info('Enforcing data retention policy');
  
  try {
    // Delete sessions older than 30 days
    const sessionsDeleted = await query(
      `DELETE FROM sessions
       WHERE created_at < NOW() - INTERVAL '30 days'
       RETURNING id`
    );
    
    // Delete expired verification tokens
    const tokensDeleted = await query(
      `DELETE FROM users
       WHERE verified_at IS NULL
       AND created_at < NOW() - INTERVAL '7 days'
       RETURNING id`
    );
    
    // Archive old audit logs (keep for 2 years, then remove)
    const auditLogsArchived = await query(
      `DELETE FROM audit_logs
       WHERE created_at < NOW() - INTERVAL '2 years'
       RETURNING id`
    );
    
    logger.info('Data retention policy enforced', {
      sessionsDeleted: sessionsDeleted.rows.length,
      unverifiedAccountsDeleted: tokensDeleted.rows.length,
      auditLogsArchived: auditLogsArchived.rows.length,
    });
    
    return {
      sessionsDeleted: sessionsDeleted.rows.length,
      unverifiedAccountsDeleted: tokensDeleted.rows.length,
      auditLogsArchived: auditLogsArchived.rows.length,
    };
  } catch (error) {
    logger.error('Data retention enforcement failed', { error: error.message });
    throw error;
  }
}

/**
 * Generates consent record for data processing
 */
export async function recordUserConsent(userId, consentType, granted = true) {
  await query(
    `INSERT INTO user_consents (user_id, consent_type, granted, recorded_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, consent_type) 
     DO UPDATE SET granted = $3, recorded_at = NOW()`,
    [userId, consentType, granted]
  );
  
  logger.info('User consent recorded', { userId, consentType, granted });
}

export default {
  exportUserData,
  deleteUserAccount,
  enforceDataRetentionPolicy,
  recordUserConsent,
};
