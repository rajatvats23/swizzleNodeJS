const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Login route
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.login
);

// Refresh token route
router.post(
  '/refresh',
  [
    body('refresh_token')
      .notEmpty()
      .withMessage('Refresh token is required')
  ],
  authController.refresh
);

// Forgot password route
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
  ],
  authController.forgotPassword
);

// Reset password route
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  authController.resetPassword
);

module.exports = router;