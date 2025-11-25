/**
 * GDPR Routes
 * @module services/gdpr/routes
 */

import express from 'express';
import * as gdprController from './gdpr.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validation.middleware.js';
import Joi from 'joi';

const router = express.Router();

/**
 * Validation schemas
 */
const deleteAccountSchema = Joi.object({
  password: Joi.string().required(),
  reason: Joi.string().optional(),
});

const consentSchema = Joi.object({
  consentType: Joi.string().valid('marketing', 'analytics', 'cookies').required(),
  granted: Joi.boolean().required(),
});

/**
 * Routes
 */

// Export user data
router.get('/export', authenticate, gdprController.exportMyData);

// Delete account
router.delete(
  '/account',
  authenticate,
  validateBody(deleteAccountSchema),
  gdprController.deleteMyAccount
);

// Record consent
router.post(
  '/consent',
  authenticate,
  validateBody(consentSchema),
  gdprController.recordConsent
);

export default router;
