/**
 * Validation Utilities using Joi
 * @module utils/validators
 */

import Joi from 'joi';

// Email validation schema
export const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Invalid email format',
  'any.required': 'Email is required',
});

// Password validation schema
export const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
    'any.required': 'Password is required',
  });

// UUID validation schema
export const uuidSchema = Joi.string().uuid().required();

// Pagination schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Order status schema
export const orderStatusSchema = Joi.string().valid(
  'pending',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'payment_failed'
);

// Role schema
export const roleSchema = Joi.string().valid('customer', 'admin', 'merchant', 'fulfilment', 'finance');

export function validate(schema, data) {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const details = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
    throw new ValidationError('Validation failed', details);
  }
  return value;
}
