/**
 * Authentication Controller
 * @module services/auth/controller
 */

import * as authService from './auth.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';
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
