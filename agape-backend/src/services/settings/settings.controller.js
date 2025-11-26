import settingsService from './settings.service.js';
import logger from '../../utils/logger.js';

class SettingsController {
	/**
	 * Get all settings
	 */
	async getSettings(req, res, next) {
		try {
			const settings = await settingsService.getAllSettings();
			res.json({
				status: 'success',
				data: settings
			});
		} catch (error) {
			logger.error('Error fetching settings:', error);
			next(error);
		}
	}

	/**
	 * Update a setting
	 */
	async updateSetting(req, res, next) {
		try {
			const { key } = req.params;
			const { value } = req.body;

			if (!value) {
				return res.status(400).json({
					status: 'error',
					message: 'Value is required'
				});
			}

			const setting = await settingsService.updateSetting(key, value);

			res.json({
				status: 'success',
				data: setting,
				message: 'Setting updated successfully'
			});
		} catch (error) {
			logger.error(`Error updating setting ${req.params.key}:`, error);
			next(error);
		}
	}
}

export default new SettingsController();
