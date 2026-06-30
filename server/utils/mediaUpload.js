import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Uploads a local file to Cloudinary, or returns the local server URL if Cloudinary is not configured.
 * @param {Object} file - The file object from Multer (req.file)
 * @returns {Promise<string>} - The url of the uploaded file
 */
export const uploadToCloudinaryOrLocal = async (file) => {
  if (!file) return null;

  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto', // Automatically detect images or videos
        folder: 'connecthub',
      });
      // Clean up the local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, falling back to local server storage:', error.message);
    }
  }

  // Fallback to local server serving path
  const PORT = process.env.PORT || 5000;
  const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
  return `${SERVER_URL}/uploads/${file.filename}`;
};

/**
 * Uploads multiple local files.
 * @param {Array} files - The array of files from Multer (req.files)
 * @returns {Promise<Array<string>>} - Array of uploaded file urls
 */
export const uploadMultipleToCloudinaryOrLocal = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadToCloudinaryOrLocal(file));
  return await Promise.all(uploadPromises);
};
