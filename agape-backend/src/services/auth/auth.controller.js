/**
 * Authentication Controller
 * @module services/auth/controller
 */

import * as authService from './auth.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';
import { query } from '../../config/database.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import logger from '../../utils/logger.js';
import config from '../../config/index.js';

/**
 * Register new user
 */
export const register = asyncHandler(async (req, res) => {
  const { user, verificationToken, accessToken, refreshToken } = await authService.register(req.body);
  
  // TODO: Queue email verification job
  
  // Set refresh token in httpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.session.cookieSecure,
    sameSite: config.session.cookieSameSite,
    maxAge: config.session.cookieMaxAge,
  });
  
  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please check your email to verify your account.',
    data: { 
      user,
      accessToken,
    },
  });
});

/**
 * Verify email
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  await authService.verifyEmail(token);
  
  res.json({
    status: 'success',
    message: 'Email verified successfully',
  });
});

/**
 * User login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const deviceInfo = {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  };
  
  const { accessToken, refreshToken, user } = await authService.login(
    email,
    password,
    deviceInfo
  );
  
  // Set refresh token in httpOnly cookie
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.session.cookieSecure,
    sameSite: config.session.cookieSameSite,
    maxAge: config.session.cookieMaxAge,
  });
  
  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      accessToken,
      user,
    },
  });
});

/**
 * Refresh access token
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token || req.body.refreshToken;
  
  if (!refreshToken) {
    throw new AuthenticationError('Refresh token required');
  }
  
  const { accessToken } = await authService.refreshAccessToken(refreshToken);
  
  res.json({
    status: 'success',
    data: { accessToken },
  });
});

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  // Get user details with order and wishlist counts
  const result = await query(
    `SELECT 
       u.id, u.email, u.name, u.phone, u.role, u.verified_at, u.created_at, u.updated_at,
       (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
       (SELECT COUNT(*) FROM wishlists WHERE user_id = u.id) as wishlist_count
     FROM users u
     WHERE u.id = $1`,
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  const user = result.rows[0];
  
  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        verified: !!user.verified_at,
        isEmailVerified: !!user.verified_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        orderCount: parseInt(user.order_count) || 0,
        wishlistCount: parseInt(user.wishlist_count) || 0,
      },
    },
  });
});

/**
 * Update user profile
 * PATCH /api/v1/auth/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  
  if (Object.keys(updates).length === 0) {
    throw new ValidationError('No fields to update');
  }
  
  const setClauses = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
  const values = [...Object.values(updates), userId];
  
  const result = await query(
    `UPDATE users
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, email, name, phone, role, verified_at, created_at, updated_at`,
    values
  );
  
  if (result.rows.length === 0) {
    throw new NotFoundError('User not found');
  }
  
  const user = result.rows[0];
  
  logger.info('User profile updated', { userId });
  
  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        verified: !!user.verified_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    },
  });
});

/**
 * Logout
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  
  res.clearCookie('refresh_token');
  
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * Get user sessions
 */
export const getSessions = asyncHandler(async (req, res) => {
  const sessions = await authService.getUserSessions(req.user.id);
  
  res.json({
    status: 'success',
    data: { sessions },
  });
});

/**
 * Revoke session
 */
export const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  await authService.revokeSession(req.user.id, sessionId);
  
  res.json({
    status: 'success',
    message: 'Session revoked successfully',
  });
});

/**
 * Request password reset
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const { resetToken } = await authService.requestPasswordReset(email);
  
  // TODO: Queue password reset email
  
  res.json({
    status: 'success',
    message: 'If the email exists, a password reset link has been sent',
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  await authService.resetPassword(token, password);
  
  res.json({
    status: 'success',
    message: 'Password reset successfully',
  });
});

/**
 * Change password
 */
export const changePassword = asyncHandler(async (req, res) => {
  // Implementation needed
  res.json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

/**
 * Enable 2FA
 */
export const enable2FA = asyncHandler(async (req, res) => {
  const { secret, qrCode } = await authService.enable2FA(req.user.id);
  
  res.json({
    status: 'success',
    message: 'Scan the QR code with your authenticator app',
    data: { secret, qrCode },
  });
});

/**
 * Verify and activate 2FA
 */
export const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  await authService.verify2FA(req.user.id, token);
  
  res.json({
    status: 'success',
    message: '2FA enabled successfully',
  });
});

/**
 * Disable 2FA
 */
export const disable2FA = asyncHandler(async (req, res) => {
  await authService.disable2FA(req.user.id);
  
  res.json({
    status: 'success',
    message: '2FA disabled successfully',
  });
});
