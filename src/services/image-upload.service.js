const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in S3
 * @returns {Promise<string>} - S3 URL of the uploaded file
 */
const uploadFile = async (fileBuffer, fileName, folder = 'uploads') => {
  try {
    // Extract file extension
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Validate file type
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedTypes.includes(extension)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }
    
    // Generate unique file name
    const uniqueFileName = `${folder}/${uuidv4()}.${extension}`;
    
    // Set the parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      // ACL: 'public-read'
    };
    
    // Upload file to S3
    const result = await s3.upload(params).promise();
    
    // Return the S3 URL
    return result.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 * @param {string} fileUrl - S3 URL of the file to delete
 * @returns {Promise<void>}
 */
const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract bucket name and key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash
    
    // Set the parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };
    
    // Delete file from S3
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    // Not throwing error to prevent disrupting the main flow
  }
};

module.exports = {
  uploadFile,
  deleteFile
};