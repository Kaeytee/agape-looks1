/**
 * Authentication Routes
 * @module services/auth/routes
 */

import express from 'express';
import Joi from 'joi';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import { authRateLimit } from '../../middleware/ratelimit.middleware.js';
import { emailSchema, passwordSchema, uuidSchema } from '../../utils/validators.js';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: passwordSchema,
});

const verify2FASchema = Joi.object({
  token: Joi.string().length(6).required(),
});

// Public routes
router.post('/register', authRateLimit, validateBody(registerSchema), authController.register);
router.post('/verify-email', validateBody(verifyEmailSchema), authController.verifyEmail);
router.post('/login', authRateLimit, validateBody(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/password-reset-request', authRateLimit, authController.requestPasswordReset);
router.post('/password-reset', validateBody(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/2fa/enable', authenticate, authController.enable2FA);
router.post('/2fa/verify', authenticate, validateBody(verify2FASchema), authController.verify2FA);
router.post('/2fa/disable', authenticate, authController.disable2FA);

export default router;
