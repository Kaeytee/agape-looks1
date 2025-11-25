/**
 * Request Validation Middleware
 * @module middleware/validation
 */

import { ValidationError } from '../utils/errors.js';

/**
 * Validates request body against Joi schema
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError('Request validation failed', details));
    }
    
    req.body = value;
    next();
  };
}

/**
 * Validates query parameters against Joi schema
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError('Query validation failed', details));
    }
    
    req.query = value;
    next();
  };
}

/**
 * Validates route parameters against Joi schema
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message,
      }));
      return next(new ValidationError('Parameter validation failed', details));
    }
    
    req.params = value;
    next();
  };
}
