/**
 * Fraud Detection Middleware
 * Detects suspicious payment patterns and behaviors
 * @module middleware/fraud-detection
 */

import { getRedisClient } from '../config/redis.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import { BadRequestError } from '../utils/errors.js';

/**
 * Transaction amount limits
 */
const LIMITS = {
  SINGLE_TRANSACTION_MAX: parseInt(process.env.MAX_TRANSACTION_AMOUNT || '5000000', 10), // ₦5M default
  DAILY_USER_LIMIT: parseInt(process.env.DAILY_USER_LIMIT || '10000000', 10), // ₦10M default
  HOURLY_USER_LIMIT: parseInt(process.env.HOURLY_USER_LIMIT || '2000000', 10), // ₦2M default
};

/**
 * Checks if transaction amount is within limits
 */
export async function checkTransactionLimits(req, res, next) {
  const { amount } = req.body;
  const userId = req.user?.id;
  
  try {
    // Check single transaction limit
    if (amount > LIMITS.SINGLE_TRANSACTION_MAX) {
      logger.warn('Transaction amount exceeds limit', {
        userId,
        amount,
        limit: LIMITS.SINGLE_TRANSACTION_MAX,
      });
      
      throw new BadRequestError(
        `Transaction amount exceeds maximum limit of ₦${LIMITS.SINGLE_TRANSACTION_MAX.toLocaleString()}`
      );
    }
    
    // Check hourly limit
    const hourlyTotal = await getUserTransactionTotal(userId, 3600); // 1 hour
    if (hourlyTotal + amount > LIMITS.HOURLY_USER_LIMIT) {
      logger.warn('Hourly transaction limit exceeded', {
        userId,
        currentTotal: hourlyTotal,
        attemptedAmount: amount,
        limit: LIMITS.HOURLY_USER_LIMIT,
      });
      
      throw new BadRequestError(
        'Hourly transaction limit exceeded. Please try again later.'
      );
    }
    
    // Check daily limit
    const dailyTotal = await getUserTransactionTotal(userId, 86400); // 24 hours
    if (dailyTotal + amount > LIMITS.DAILY_USER_LIMIT) {
      logger.warn('Daily transaction limit exceeded', {
        userId,
        currentTotal: dailyTotal,
        attemptedAmount: amount,
        limit: LIMITS.DAILY_USER_LIMIT,
      });
      
      throw new BadRequestError(
        'Daily transaction limit exceeded. Please contact support.'
      );
    }
    
    next();
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    
    logger.error('Transaction limit check error', { error: error.message });
    next(); // Fail open
  }
}

/**
 * Gets user's total transaction amount within time window
 */
async function getUserTransactionTotal(userId, timeWindowSeconds) {
  const redis = getRedisClient();
  const key = `user_txn_total:${userId}:${timeWindowSeconds}`;
  
  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return parseFloat(cached);
  }
  
  // Query database
  const result = await query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM payments
     WHERE user_id = $1
     AND status IN ('paid', 'success')
     AND created_at > NOW() - INTERVAL '${timeWindowSeconds} seconds'`,
    [userId]
  );
  
  const total = parseFloat(result.rows[0].total);
  
  // Cache for 1 minute
  await redis.setex(key, 60, total.toString());
  
  return total;
}

/**
 * Detects suspicious payment patterns
 */
export async function detectFraudPatterns(req, res, next) {
  const userId = req.user?.id;
  const ip = req.ip || req.connection.remoteAddress;
  const { amount, orderId } = req.body;
  
  const redis = getRedisClient();
  const riskScore = 0;
  const riskFactors = [];
  
  try {
    // Check rapid successive payments from same user
    const recentPaymentsKey = `recent_payments:${userId}`;
    const recentCount = await redis.incr(recentPaymentsKey);
    await redis.expire(recentPaymentsKey, 300); // 5 minutes
    
    if (recentCount > 3) {
      riskFactors.push('RAPID_PAYMENTS');
    }
    
    // Check multiple failed payments before success
    const failedKey = `failed_payments:${userId}`;
    const failedCount = await redis.get(failedKey);
    
    if (failedCount && parseInt(failedCount, 10) > 2) {
      riskFactors.push('MULTIPLE_FAILED_ATTEMPTS');
    }
    
    // Check if multiple users from same IP
    const ipUsersKey = `ip_users:${ip}`;
    await redis.sadd(ipUsersKey, userId);
    await redis.expire(ipUsersKey, 3600);
    const uniqueUsers = await redis.scard(ipUsersKey);
    
    if (uniqueUsers > 5) {
      riskFactors.push('MULTIPLE_USERS_SAME_IP');
    }
    
    // Check if amount is unusually high for user
    const avgAmount = await getUserAverageTransactionAmount(userId);
    if (avgAmount > 0 && amount > avgAmount * 10) {
      riskFactors.push('UNUSUALLY_HIGH_AMOUNT');
    }
    
    // Check velocity - new account with high-value transaction
    const accountAge = await getAccountAge(userId);
    if (accountAge < 24 && amount > 500000) { // Less than 24 hours old
      riskFactors.push('NEW_ACCOUNT_HIGH_VALUE');
    }
    
    // Log risk assessment
    if (riskFactors.length > 0) {
      logger.warn('Potential fraud detected', {
        userId,
        ip,
        amount,
        orderId,
        riskFactors,
        severity: riskFactors.length >= 3 ? 'HIGH' : 'MEDIUM',
      });
      
      // For high-risk transactions, require manual review
      if (riskFactors.length >= 3) {
        // Mark order for manual review
        await query(
          `UPDATE orders
           SET metadata = metadata || $1
           WHERE id = $2`,
          [JSON.stringify({ requiresReview: true, riskFactors }), orderId]
        );
        
        // TODO: Send alert to fraud team
        // await sendFraudAlert({ userId, orderId, riskFactors });
      }
    }
    
    // Attach risk info to request
    req.fraudRiskFactors = riskFactors;
    
    next();
  } catch (error) {
    logger.error('Fraud detection error', { error: error.message });
    next(); // Continue even if fraud check fails
  }
}

/**
 * Gets user's average transaction amount
 */
async function getUserAverageTransactionAmount(userId) {
  const result = await query(
    `SELECT AVG(amount) as avg_amount
     FROM payments
     WHERE user_id = $1
     AND status IN ('paid', 'success')
     AND created_at > NOW() - INTERVAL '30 days'`,
    [userId]
  );
  
  return parseFloat(result.rows[0].avg_amount || 0);
}

/**
 * Gets account age in hours
 */
async function getAccountAge(userId) {
  const result = await query(
    `SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as age_hours
     FROM users
     WHERE id = $1`,
    [userId]
  );
  
  return parseFloat(result.rows[0]?.age_hours || 0);
}

/**
 * Tracks failed payment for fraud detection
 */
export async function trackFailedPayment(userId) {
  const redis = getRedisClient();
  const key = `failed_payments:${userId}`;
  
  await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour
}

/**
 * Clears failed payment counter on success
 */
export async function clearFailedPaymentCounter(userId) {
  const redis = getRedisClient();
  const key = `failed_payments:${userId}`;
  
  await redis.del(key);
}

export default {
  checkTransactionLimits,
  detectFraudPatterns,
  trackFailedPayment,
  clearFailedPaymentCounter,
};
