import express from 'express'
import { collectionsController } from './collections.controller.js'

import { authenticate, requireRole } from '../../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', collectionsController.getAllCollections)
router.get('/:slug', collectionsController.getCollectionBySlug)

// Admin routes
router.post('/', authenticate, requireRole('admin'), collectionsController.createCollection)
router.put('/:id', authenticate, requireRole('admin'), collectionsController.updateCollection)
router.delete('/:id', authenticate, requireRole('admin'), collectionsController.deleteCollection)

export default router
