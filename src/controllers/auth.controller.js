const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

// Login controller
const login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Login user
    const tokens = await authService.loginUser(email, password);
    
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Refresh token controller
const refresh = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    // Refresh token
    const tokens = await authService.refreshToken(refresh_token);
    
    res.status(200).json(tokens);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Forgot password controller
const forgotPassword = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email } = req.body;
    
    // Process forgot password
    await authService.forgotPassword(email);
    
    res.status(200).json({ 
      message: 'Password reset email sent' 
    });
  } catch (error) {
    // Don't expose error details for security
    res.status(200).json({ 
      message: 'If an account with that email exists, we sent a password reset link' 
    });
  }
};

// Reset password controller
const resetPassword = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Reset password
    await authService.resetPassword(token, password);
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  login,
  refresh,
  forgotPassword,
  resetPassword
};