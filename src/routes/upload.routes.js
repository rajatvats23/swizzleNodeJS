const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../middlewares/auth.middleware');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Upload image route
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Delete image route
router.delete('/image', uploadController.deleteImage);

module.exports = router;