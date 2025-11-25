/**
 * Cryptography Utilities
 * @module utils/crypto
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';

/**
 * Hashes a password using bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, config.security.bcryptSaltRounds);
}

/**
 * Compares password with hash
 */
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generates a random token
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a string using SHA256
 */
export function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Creates HMAC signature
 */
export function createHmacSignature(data, secret) {
  return crypto.createHmac('sha512', secret).update(data).digest('hex');
}

/**
 * Verifies HMAC signature
 */
export function verifyHmacSignature(data, signature, secret) {
  const expectedSignature = createHmacSignature(data, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Masks sensitive data (for logging)
 */
export function maskSensitiveData(data, fields = ['password', 'token', 'secret']) {
  const masked = { ...data };
  fields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***REDACTED***';
    }
  });
  return masked;
}
