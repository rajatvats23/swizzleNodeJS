const imageUploadService = require('../services/image-upload.service');

/**
 * Upload a single image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get folder path from query parameter or use default
    const folder = req.query.folder || 'images';
    
    // Upload file to S3
    const fileUrl = await imageUploadService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      folder
    );
    
    // Return the file URL
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    res.status(500).json({ message: error.message || 'Failed to upload image' });
  }
};

/**
 * Delete an image
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteImage = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    // Delete file from S3
    await imageUploadService.deleteFile(url);
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error in deleteImage:', error);
    res.status(500).json({ message: error.message || 'Failed to delete image' });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};