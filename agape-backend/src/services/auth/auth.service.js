/**
 * Authentication Service
 * @module services/auth
 */

import jwt from 'jsonwebtoken';
import fs from 'fs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/index.js';
import { query, transaction } from '../../config/database.js';
import { getRedisClient } from '../../config/redis.js';
import { hashPassword, comparePassword, generateToken, hashString } from '../../utils/crypto.js';
import { AuthenticationError, ConflictError, ValidationError, NotFoundError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';

let privateKey = null;

/**
 * Loads JWT private key
 */
function loadPrivateKey() {
  if (!privateKey) {
    privateKey = fs.readFileSync(config.jwt.privateKeyPath, 'utf8');
  }
  return privateKey;
}

/**
 * Generates JWT access token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    },
    loadPrivateKey(),
    {
      algorithm: config.jwt.algorithm,
      expiresIn: config.jwt.accessTokenExpiry,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    }
  );
}

/**
 * Generates refresh token and stores session
 */
async function generateRefreshToken(user, deviceInfo = {}) {
  const token = generateToken(64);
  const tokenHash = hashString(token);
  
  await query(
    `INSERT INTO sessions (user_id, refresh_token_hash, device_info, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '${config.jwt.refreshTokenExpiry}')
     RETURNING id`,
    [
      user.id,
      tokenHash,
      JSON.stringify(deviceInfo),
      deviceInfo.ip,
      deviceInfo.userAgent,
    ]
  );
  
  return token;
}

/**
 * Registers new user
 */
export async function register(userData) {
  const { email, password, name, phone } = userData;
  
  // Check if user exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new ConflictError('Email already registered');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const result = await query(
    `INSERT INTO users (email, password_hash, name, phone, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, email, name, role, created_at`,
    [email, passwordHash, name, phone || null]
  );
  
  const user = result.rows[0];
  
  // Generate email verification token
  const verificationToken = generateToken();
  const redis = getRedisClient();
  await redis.setex(`email_verify:${verificationToken}`, 86400, user.id); // 24 hours
  
  // Generate JWT tokens (auto-login after registration)
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Store refresh token in Redis
  await redis.setex(
    `refresh_token:${user.id}:${refreshToken}`,
    config.jwt.refreshExpiresIn,
    JSON.stringify({ userId: user.id, createdAt: new Date().toISOString() })
  );
  
  logger.info('User registered and auto-logged in', { userId: user.id, email: user.email });
  
  return {
    user,
    verificationToken,
    accessToken,
    refreshToken,
  };
}

/**
 * Verifies email
 */
export async function verifyEmail(token) {
  const redis = getRedisClient();
  const userId = await redis.get(`email_verify:${token}`);
  
  if (!userId) {
    throw new ValidationError('Invalid or expired verification token');
  }
  
  await query(
    'UPDATE users SET verified_at = NOW() WHERE id = $1 AND verified_at IS NULL',
    [userId]
  );
  
  await redis.del(`email_verify:${token}`);
  
  logger.info('Email verified', { userId });
}

/**
 * User login
 */
export async function login(email, password, deviceInfo = {}) {
  // Get user
  const result = await query(
    `SELECT id, email, password_hash, role, verified_at, failed_login_attempts, locked_until
     FROM users WHERE email = $1`,
    [email]
  );
  
  if (result.rows.length === 0) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  const user = result.rows[0];
  
  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new AuthenticationError('Account temporarily locked due to multiple failed login attempts');
  }
  
  // Verify password
  const isValid = await comparePassword(password, user.password_hash);
  
  if (!isValid) {
    // Increment failed attempts
    const attempts = user.failed_login_attempts + 1;
    const lockUntil = attempts >= config.security.maxLoginAttempts
      ? `NOW() + INTERVAL '${config.security.loginLockoutDuration} minutes'`
      : null;
    
    await query(
      `UPDATE users SET failed_login_attempts = $1, locked_until = ${lockUntil || 'NULL'}
       WHERE id = $2`,
      [attempts, user.id]
    );
    
    logger.warn('Failed login attempt', { email, attempts });
    
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Reset failed attempts and update last login
  await query(
    'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
    [user.id]
  );
  
  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user, deviceInfo);
  
  logger.info('User logged in', { userId: user.id, email: user.email });
  
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      verified: !!user.verified_at,
    },
  };
}

/**
 * Refreshes access token
 */
export async function refreshAccessToken(refreshToken) {
  const tokenHash = hashString(refreshToken);
  
  const result = await query(
    `SELECT s.id, s.user_id, u.email, u.role, u.verified_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.refresh_token_hash = $1
       AND s.expires_at > NOW()
       AND s.revoked_at IS NULL`,
    [tokenHash]
  );
  
  if (result.rows.length === 0) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
  
  const session = result.rows[0];
  const user = {
    id: session.user_id,
    email: session.email,
    role: session.role,
  };
  
  const accessToken = generateAccessToken(user);
  
  return { accessToken };
}

/**
 * Logs out user (revokes session)
 */
export async function logout(refreshToken) {
  const tokenHash = hashString(refreshToken);
  
  await query(
    'UPDATE sessions SET revoked_at = NOW() WHERE refresh_token_hash = $1',
    [tokenHash]
  );
  
  logger.info('User logged out');
}

/**
 * Gets user sessions
 */
export async function getUserSessions(userId) {
  const result = await query(
    `SELECT id, device_info, ip_address, created_at, expires_at
     FROM sessions
     WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [userId]
  );
  
  return result.rows;
}

/**
 * Revokes specific session
 */
export async function revokeSession(userId, sessionId) {
  const result = await query(
    'UPDATE sessions SET revoked_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
    [sessionId, userId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('Session');
  }
  
  logger.info('Session revoked', { userId, sessionId });
}

/**
 * Requests password reset
 */
export async function requestPasswordReset(email) {
  const result = await query('SELECT id FROM users WHERE email = $1', [email]);
  
  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return { success: true };
  }
  
  const userId = result.rows[0].id;
  const resetToken = generateToken();
  
  const redis = getRedisClient();
  await redis.setex(`password_reset:${resetToken}`, 3600, userId); // 1 hour
  
  logger.info('Password reset requested', { userId, email });
  
  return { resetToken };
}

/**
 * Resets password
 */
export async function resetPassword(token, newPassword) {
  const redis = getRedisClient();
  const userId = await redis.get(`password_reset:${token}`);
  
  if (!userId) {
    throw new ValidationError('Invalid or expired reset token');
  }
  
  const passwordHash = await hashPassword(newPassword);
  
  await transaction(async (client) => {
    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, failed_login_attempts = 0, locked_until = NULL WHERE id = $2',
      [passwordHash, userId]
    );
    
    // Revoke all sessions
    await client.query(
      'UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    );
  });
  
  await redis.del(`password_reset:${token}`);
  
  logger.info('Password reset', { userId });
}

/**
 * Enables 2FA
 */
export async function enable2FA(userId) {
  const secret = speakeasy.generateSecret({
    name: `${config.app.name} (${userId})`,
    issuer: config.app.name,
  });
  
  await query(
    'UPDATE users SET two_factor_secret = $1 WHERE id = $2',
    [secret.base32, userId]
  );
  
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  
  logger.info('2FA enabled', { userId });
  
  return {
    secret: secret.base32,
    qrCode,
  };
}

/**
 * Verifies 2FA token
 */
export async function verify2FA(userId, token) {
  const result = await query(
    'SELECT two_factor_secret FROM users WHERE id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User');
  }
  
  const secret = result.rows[0].two_factor_secret;
  
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
  
  if (!verified) {
    throw new AuthenticationError('Invalid 2FA token');
  }
  
  await query(
    'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
    [userId]
  );
  
  logger.info('2FA verified', { userId });
}

/**
 * Disables 2FA
 */
export async function disable2FA(userId) {
  await query(
    'UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = $1',
    [userId]
  );
  
  logger.info('2FA disabled', { userId });
}
