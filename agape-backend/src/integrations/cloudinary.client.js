/**
 * Cloudinary Media Client
 * @module integrations/cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ExternalServiceError } from '../utils/errors.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: config.cloudinary.secure,
});

/**
 * Uploads image to Cloudinary
 */
export async function uploadImage(file, options = {}) {
  const { folder = config.cloudinary.folder, tags = [] } = options;
  
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      tags,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });
    
    logger.info('Image uploaded to Cloudinary', {
      publicId: result.public_id,
      url: result.secure_url,
    });
    
    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload failed', { error: error.message });
    throw new ExternalServiceError('Cloudinary', error.message);
  }
}

/**
 * Deletes image from Cloudinary
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    logger.info('Image deleted from Cloudinary', { publicId });
    
    return result;
  } catch (error) {
    logger.error('Cloudinary delete failed', { error: error.message });
    throw new ExternalServiceError('Cloudinary', error.message);
  }
}

/**
 * Generates signed upload URL
 */
export function generateSignedUploadUrl(options = {}) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: options.folder || config.cloudinary.folder,
  };
  
  const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);
  
  return {
    url: `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/image/upload`,
    timestamp,
    signature,
    apiKey: config.cloudinary.apiKey,
    folder: params.folder,
  };
}

/**
 * Gets image transformations
 */
export function getTransformedUrl(publicId, transformations) {
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}

export default {
  uploadImage,
  deleteImage,
  generateSignedUploadUrl,
  getTransformedUrl,
};
