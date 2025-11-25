/**
 * GDPR Controller
 * @module services/gdpr/controller
 */

import * as gdprService from './gdpr.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

/**
 * Export user data
 * GET /api/v1/gdpr/export
 */
export const exportMyData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const dataExport = await gdprService.exportUserData(userId);
  
  res.status(200).json({
    status: 'success',
    message: 'Data exported successfully',
    data: dataExport,
  });
});

/**
 * Delete user account
 * DELETE /api/v1/gdpr/account
 */
export const deleteMyAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password, reason } = req.body;
  
  // Verify password before deletion
  // This should be implemented in auth service
  // await authService.verifyPassword(userId, password);
  
  const result = await gdprService.deleteUserAccount(userId, reason);
  
  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully',
    data: result,
  });
});

/**
 * Record user consent
 * POST /api/v1/gdpr/consent
 */
export const recordConsent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { consentType, granted } = req.body;
  
  await gdprService.recordUserConsent(userId, consentType, granted);
  
  res.status(200).json({
    status: 'success',
    message: 'Consent recorded successfully',
  });
});

export default {
  exportMyData,
  deleteMyAccount,
  recordConsent,
};
