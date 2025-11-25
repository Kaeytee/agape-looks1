/**
 * Authentication Middleware
 * @module middleware/auth
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';
import config from '../config/index.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

let publicKey = null;

/**
 * Loads JWT public key
 */
function loadPublicKey() {
  if (!publicKey) {
    publicKey = fs.readFileSync(config.jwt.publicKeyPath, 'utf8');
  }
  return publicKey;
}

/**
 * Authenticates JWT token from Authorization header
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }
    
    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, loadPublicKey(), {
      algorithms: [config.jwt.algorithm],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    
    // Check if user still exists
    const result = await query(
      'SELECT id, email, role, verified_at, locked_until FROM users WHERE id = $1',
      [decoded.sub]
    );
    
    if (result.rows.length === 0) {
      throw new AuthenticationError('User not found');
    }
    
    const user = result.rows[0];
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AuthenticationError('Account is temporarily locked');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      verified: !!user.verified_at,
    };
    
    logger.debug('User authenticated', { userId: user.id, role: user.role });
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expired'));
    }
    next(error);
  }
}

/**
 * Optional authentication - attaches user if token exists
 */
export async function optionalAuth(req, res, next) {
  try {
    await authenticate(req, res, () => next());
  } catch (error) {
    // Continue without authentication
    next();
  }
}

/**
 * Requires specific roles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError());
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
      });
      return next(new AuthorizationError());
    }
    
    next();
  };
}

/**
 * Requires email verification
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return next(new AuthenticationError());
  }
  
  if (!req.user.verified) {
    return next(new AuthorizationError('Email verification required'));
  }
  
  next();
}

/**
 * Admin only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Customer or admin middleware
 */
export const requireCustomer = requireRole('customer', 'admin');
