import express from 'express';
import settingsController from './settings.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Public route to get settings (needed for cart calculation)
router.get('/', settingsController.getSettings);

// Admin only route to update settings
router.put('/:key', authenticate, requireAdmin, settingsController.updateSetting);

export default router;
