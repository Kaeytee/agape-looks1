/**
 * Rate Limiting Middleware using Redis
 * @module middleware/ratelimit
 */

import { getRedisClient } from '../config/redis.js';
import config from '../config/index.js';
import { RateLimitError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Creates rate limiter middleware
 */
export function rateLimit(options = {}) {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const max = options.max || config.rateLimit.maxRequests;
  const keyPrefix = options.keyPrefix || 'ratelimit';
  
  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      const identifier = options.keyGenerator 
        ? options.keyGenerator(req) 
        : req.ip || req.connection.remoteAddress;
      
      const key = `${keyPrefix}:${identifier}`;
      
      // Increment counter
      const current = await redis.incr(key);
      
      // Set expiry on first request
      if (current === 1) {
        await redis.pexpire(key, windowMs);
      }
      
      // Get TTL
      const ttl = await redis.pttl(key);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttl).toISOString());
      
      if (current > max) {
        logger.warn('Rate limit exceeded', {
          identifier,
          current,
          max,
          endpoint: req.path,
        });
        
        throw new RateLimitError();
      }
      
      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        return next(error);
      }
      
      // If Redis fails, allow request through (fail open)
      logger.error('Rate limit check failed', { error: error.message });
      next();
    }
  };
}

/**
 * Strict rate limit for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  max: config.rateLimit.authMax,
  keyPrefix: 'auth_ratelimit',
  keyGenerator: (req) => req.body.email || req.ip,
});

/**
 * Admin rate limit
 */
export const adminRateLimit = rateLimit({
  windowMs: 60000,
  max: config.rateLimit.adminMax,
  keyPrefix: 'admin_ratelimit',
});
