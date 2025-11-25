import { query } from '../config/database.js'
import logger from '../utils/logger.js'

export const collectionService = {
	/**
	 * Get all collections with product counts
	 */
	async getAllCollections() {
		try {
			const sql = `
        SELECT 
          c.*,
          COUNT(pc.product_id)::int as "productCount"
        FROM collections c
        LEFT JOIN product_collections pc ON c.id = pc.collection_id
        GROUP BY c.id
        ORDER BY c.featured DESC, c.name ASC
      `
			const result = await query(sql)
			return result.rows
		} catch (error) {
			logger.error('Error fetching collections:', error)
			throw error
		}
	},

	/**
	 * Get collection by slug
	 */
	async getCollectionBySlug(slug) {
		try {
			const sql = `
        SELECT * FROM collections WHERE slug = $1
      `
			const result = await query(sql, [slug])
			return result.rows[0]
		} catch (error) {
			logger.error(`Error fetching collection ${slug}:`, error)
			throw error
		}
	},

	/**
	 * Create a new collection
	 */
	async createCollection(data) {
		try {
			const { name, slug, description, image, featured, color } = data

			const sql = `
        INSERT INTO collections (name, slug, description, image, featured, color)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `

			const result = await query(sql, [
				name,
				slug,
				description,
				image,
				featured || false,
				color
			])

			return result.rows[0]
		} catch (error) {
			logger.error('Error creating collection:', error)
			throw error
		}
	},

	/**
	 * Update a collection
	 */
	async updateCollection(id, data) {
		try {
			const { name, slug, description, image, featured, color } = data

			const sql = `
        UPDATE collections 
        SET name = $1, slug = $2, description = $3, image = $4, featured = $5, color = $6, updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `

			const result = await query(sql, [
				name,
				slug,
				description,
				image,
				featured,
				color,
				id
			])

			return result.rows[0]
		} catch (error) {
			logger.error(`Error updating collection ${id}:`, error)
			throw error
		}
	},

	/**
	 * Delete a collection
	 */
	async deleteCollection(id) {
		try {
			const sql = `DELETE FROM collections WHERE id = $1 RETURNING id`
			const result = await query(sql, [id])
			return result.rows[0]
		} catch (error) {
			logger.error(`Error deleting collection ${id}:`, error)
			throw error
		}
	}
}
