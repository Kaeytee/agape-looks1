/**
 * Request Logging Middleware
 * @module middleware/logging
 */

import { nanoid } from 'nanoid';
import logger from '../utils/logger.js';

/**
 * Attaches request ID and logs requests
 */
export function requestLogger(req, res, next) {
  // Generate unique request ID
  req.id = nanoid();
  
  // Log request
  logger.info('Incoming request', {
    requestId: req.id,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });
  
  // Capture start time
  const startTime = Date.now();
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
    });
  });
  
  next();
}

/**
 * Adds correlation ID support
 */
export function correlationId(req, res, next) {
  req.correlationId = req.get('X-Correlation-ID') || req.id;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
}
