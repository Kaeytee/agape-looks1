/**
 * Error Handling Middleware
 * @module middleware/error
 */

import { formatErrorResponse, AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  // Log error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Format error response
  const response = formatErrorResponse(err, req.id);
  
  // Hide stack trace in production
  if (config.app.env === 'production' && !err.isOperational) {
    response.message = 'Internal server error';
    response.userMessage = 'An unexpected error occurred. Please try again later.';
    delete response.details;
  }
  
  // Include stack in development
  if (config.app.env === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    userMessage: 'The requested resource was not found',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
}

/**
 * Async handler wrapper
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
