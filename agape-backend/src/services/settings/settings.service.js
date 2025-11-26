import { query } from '../../config/database.js';
import logger from '../../utils/logger.js';

class SettingsService {
	/**
	 * Get all settings
	 * @returns {Promise<Object>} Map of settings
	 */
	async getAllSettings() {
		const result = await query('SELECT key, value, description FROM settings');

		// Convert array to object map
		return result.rows.reduce((acc, row) => {
			acc[row.key] = {
				value: row.value,
				description: row.description
			};
			return acc;
		}, {});
	}

	/**
	 * Get setting by key
	 * @param {string} key Setting key
	 * @returns {Promise<Object>} Setting value
	 */
	async getSetting(key) {
		const result = await query('SELECT value FROM settings WHERE key = $1', [key]);

		if (result.rows.length === 0) {
			return null;
		}

		return result.rows[0].value;
	}

	/**
	 * Update setting
	 * @param {string} key Setting key
	 * @param {Object} value Setting value
	 * @returns {Promise<Object>} Updated setting
	 */
	async updateSetting(key, value) {
		const result = await query(
			`INSERT INTO settings (key, value) 
       VALUES ($1, $2)
       ON CONFLICT (key) 
       DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING key, value, description`,
			[key, value]
		);

		return {
			key: result.rows[0].key,
			value: result.rows[0].value,
			description: result.rows[0].description
		};
	}
}

export default new SettingsService();
