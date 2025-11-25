/**
 * Media Controller
 * @module services/media/controller
 */

import * as mediaService from './media.service.js';
import { asyncHandler } from '../../middleware/error.middleware.js';

export const uploadMedia = asyncHandler(async (req, res) => {
  const { file } = req.body;
  const result = await mediaService.uploadMedia(file, req.body.options);
  
  res.json({
    status: 'success',
    message: 'Media uploaded successfully',
    data: result,
  });
});

export const deleteMedia = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  await mediaService.deleteMedia(publicId);
  
  res.json({
    status: 'success',
    message: 'Media deleted successfully',
  });
});

export const getUploadUrl = asyncHandler(async (req, res) => {
  const uploadData = mediaService.generateUploadUrl(req.query);
  
  res.json({
    status: 'success',
    data: uploadData,
  });
});
