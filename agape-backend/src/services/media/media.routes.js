/**
 * Media Routes
 * @module services/media/routes
 */

import express from 'express';
import * as mediaController from './media.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/upload-url', authenticate, requireAdmin, mediaController.getUploadUrl);
router.post('/upload', authenticate, requireAdmin, mediaController.uploadMedia);
router.delete('/:publicId', authenticate, requireAdmin, mediaController.deleteMedia);

export default router;
