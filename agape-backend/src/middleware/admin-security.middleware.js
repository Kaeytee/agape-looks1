/**
 * Enhanced Admin Security Middleware
 * IP-based rate limiting and additional security for admin routes
 * @module middleware/admin-security
 */

import { getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import { UnauthorizedError, TooManyRequestsError } from '../utils/errors.js';

/**
 * IP whitelist for admin access (configurable via environment)
 * Format: comma-separated list of IPs or CIDR ranges
 */
const ADMIN_IP_WHITELIST = process.env.ADMIN_IP_WHITELIST
  ? process.env.ADMIN_IP_WHITELIST.split(',').map(ip => ip.trim())
  : [];

/**
 * Checks if IP is in whitelist
 */
function isIPWhitelisted(ip) {
  // If no whitelist configured, allow all (for development)
  if (ADMIN_IP_WHITELIST.length === 0) {
    return true;
  }
  
  // Check exact match
  if (ADMIN_IP_WHITELIST.includes(ip)) {
    return true;
  }
  
  // Check CIDR ranges (basic implementation)
  // For production, use a library like 'ipaddr.js' or 'ip-range-check'
  for (const allowedIP of ADMIN_IP_WHITELIST) {
    if (allowedIP.includes('*')) {
      const pattern = allowedIP.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(ip)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * IP-based rate limiting for admin routes (stricter than general)
 * Limit: 30 requests per minute per IP
 */
export async function adminIPRateLimit(req, res, next) {
  const redis = getRedisClient();
  const ip = req.ip || req.connection.remoteAddress;
  const key = `admin_rate_limit:ip:${ip}`;
  
  try {
    // Check IP whitelist
    if (!isIPWhitelisted(ip)) {
      logger.warn('Admin access attempt from non-whitelisted IP', { ip });
      
      // Track unauthorized access attempts
      const attemptKey = `admin_unauthorized:${ip}`;
      await redis.incr(attemptKey);
      await redis.expire(attemptKey, 3600); // 1 hour
      
      throw new UnauthorizedError('Admin access from this IP is not allowed');
    }
    
    // Rate limiting
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 60); // 1 minute window
    }
    
    const ttl = await redis.ttl(key);
    
    // Stricter limit for admin routes
    const limit = 30;
    
    if (requests > limit) {
      logger.warn('Admin rate limit exceeded', { ip, requests });
      throw new TooManyRequestsError('Too many admin requests. Please try again later.');
    }
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': Math.max(0, limit - requests),
      'X-RateLimit-Reset': new Date(Date.now() + ttl * 1000).toISOString(),
    });
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof TooManyRequestsError) {
      throw error;
    }
    
    logger.error('Admin rate limit error', { error: error.message });
    next(); // Fail open in case of Redis issues
  }
}

/**
 * Monitors failed admin login attempts
 */
export async function monitorFailedAdminLogin(userId, ip) {
  const redis = getRedisClient();
  const key = `admin_failed_login:${userId}`;
  const ipKey = `admin_failed_login_ip:${ip}`;
  
  try {
    const userAttempts = await redis.incr(key);
    await redis.expire(key, 3600); // 1 hour
    
    const ipAttempts = await redis.incr(ipKey);
    await redis.expire(ipKey, 3600);
    
    // Alert if threshold exceeded
    if (userAttempts > 3 || ipAttempts > 5) {
      logger.error('Multiple failed admin login attempts detected', {
        userId,
        ip,
        userAttempts,
        ipAttempts,
        severity: 'CRITICAL',
      });
      
      // TODO: Send alert to security team
      // await sendSecurityAlert('Failed admin login attempts', { userId, ip });
    }
  } catch (error) {
    logger.error('Failed login monitoring error', { error: error.message });
  }
}

/**
 * Requires re-authentication for sensitive admin operations
 * Password must be re-entered within last 5 minutes
 */
export async function requireRecentAuth(req, res, next) {
  const redis = getRedisClient();
  const userId = req.user.id;
  const key = `admin_recent_auth:${userId}`;
  
  try {
    const lastAuth = await redis.get(key);
    
    if (!lastAuth) {
      throw new UnauthorizedError('Please re-authenticate to perform this action');
    }
    
    const lastAuthTime = parseInt(lastAuth, 10);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    if (lastAuthTime < fiveMinutesAgo) {
      await redis.del(key);
      throw new UnauthorizedError('Authentication expired. Please re-authenticate.');
    }
    
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    
    logger.error('Recent auth check error', { error: error.message });
    next(); // Fail open
  }
}

/**
 * Sets recent authentication timestamp
 */
export async function setRecentAuth(userId) {
  const redis = getRedisClient();
  const key = `admin_recent_auth:${userId}`;
  
  await redis.setex(key, 300, Date.now().toString()); // 5 minutes
}

/**
 * Tracks unusual admin access patterns
 */
export async function trackAdminAccess(req, res, next) {
  const { user, ip, path, method } = req;
  
  logger.info('Admin access', {
    userId: user.id,
    email: user.email,
    ip,
    path,
    method,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });
  
  next();
}

export default {
  adminIPRateLimit,
  monitorFailedAdminLogin,
  requireRecentAuth,
  setRecentAuth,
  trackAdminAccess,
};
