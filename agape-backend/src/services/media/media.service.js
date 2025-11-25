/**
 * Media Service
 * @module services/media
 */

import * as cloudinaryClient from '../../integrations/cloudinary.client.js';
import logger from '../../utils/logger.js';

/**
 * Uploads media file
 */
export async function uploadMedia(file, options = {}) {
  return await cloudinaryClient.uploadImage(file, options);
}

/**
 * Deletes media file
 */
export async function deleteMedia(publicId) {
  return await cloudinaryClient.deleteImage(publicId);
}

/**
 * Generates signed upload URL
 */
export function generateUploadUrl(options = {}) {
  return cloudinaryClient.generateSignedUploadUrl(options);
}

/**
 * Gets transformed image URL
 */
export function getTransformedUrl(publicId, transformations) {
  return cloudinaryClient.getTransformedUrl(publicId, transformations);
}

export default {
  uploadMedia,
  deleteMedia,
  generateUploadUrl,
  getTransformedUrl,
};
