import { collectionService } from '../collectionService.js'
import { asyncHandler } from '../../middleware/error.middleware.js'

export const collectionsController = {
	/**
	 * Get all collections
	 */
	getAllCollections: asyncHandler(async (req, res) => {
		const collections = await collectionService.getAllCollections()
		res.json({
			success: true,
			data: collections
		})
	}),

	/**
	 * Get collection by slug
	 */
	getCollectionBySlug: asyncHandler(async (req, res) => {
		const { slug } = req.params
		const collection = await collectionService.getCollectionBySlug(slug)

		if (!collection) {
			return res.status(404).json({
				success: false,
				message: 'Collection not found'
			})
		}

		res.json({
			success: true,
			data: collection
		})
	}),

	/**
	 * Create collection
	 */
	createCollection: asyncHandler(async (req, res) => {
		const collection = await collectionService.createCollection(req.body)
		res.status(201).json({
			success: true,
			data: collection
		})
	}),

	/**
	 * Update collection
	 */
	updateCollection: asyncHandler(async (req, res) => {
		const { id } = req.params
		const collection = await collectionService.updateCollection(id, req.body)

		if (!collection) {
			return res.status(404).json({
				success: false,
				message: 'Collection not found'
			})
		}

		res.json({
			success: true,
			data: collection
		})
	}),

	/**
	 * Delete collection
	 */
	deleteCollection: asyncHandler(async (req, res) => {
		const { id } = req.params
		const result = await collectionService.deleteCollection(id)

		if (!result) {
			return res.status(404).json({
				success: false,
				message: 'Collection not found'
			})
		}

		res.json({
			success: true,
			message: 'Collection deleted successfully'
		})
	}),

	/**
	 * Delete all collections
	 */
	deleteAllCollections: asyncHandler(async (req, res) => {
		const count = await collectionService.deleteAllCollections()

		res.json({
			success: true,
			message: `${count} collections deleted successfully`
		})
	})
}
