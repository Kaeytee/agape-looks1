/**
 * Custom Error Classes and Error Handling
 * @module utils/errors
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', userMessage = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.userMessage = userMessage || message;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 400, 'VALIDATION_ERROR', 'Invalid input provided');
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR', 'Please log in to continue');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR', 'You do not have permission to perform this action');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND', `The requested ${resource.toLowerCase()} was not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT', message);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', 'You have made too many requests. Please try again later');
  }
}

export class PaymentError extends AppError {
  constructor(message = 'Payment processing failed') {
    super(message, 402, 'PAYMENT_ERROR', 'Payment could not be processed. Please try again');
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR', 'Service temporarily unavailable');
    this.service = service;
  }
}

export function formatErrorResponse(error, requestId) {
  const response = {
    status: 'error',
    code: error.code || 'INTERNAL_ERROR',
    message: error.message,
    userMessage: error.userMessage || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId,
  };

  if (error.details) {
    response.details = error.details;
  }

  return response;
}
