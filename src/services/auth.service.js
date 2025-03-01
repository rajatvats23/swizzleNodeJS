const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const { getResetPasswordToken } = require('../utils/password');

// Generate JWT tokens
const generateTokens = (userId, email) => {
  // Create access token
  const accessToken = jwt.sign(
    { user_id: userId, email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.accessExpiration }
  );
  
  // Create refresh token
  const refreshToken = jwt.sign(
    { user_id: userId, email },
    jwtConfig.secret,
    { expiresIn: jwtConfig.refreshExpiration }
  );
  
  return { access_token: accessToken, refresh_token: refreshToken };
};

// Login user service
const loginUser = async (email, password) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  // Generate tokens
  const tokens = generateTokens(user._id, user.email);
  
  // Save refresh token to user
  user.refreshToken = tokens.refresh_token;
  await user.save();
  
  return tokens;
};

// Refresh token service
const refreshToken = async (refreshToken) => {
  try {
    // Verify token
    const decoded = jwt.verify(refreshToken, jwtConfig.secret);
    
    // Find user
    const user = await User.findById(decoded.user_id);
    
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }
    
    // Generate new tokens
    const tokens = generateTokens(user._id, user.email);
    
    // Update refresh token
    user.refreshToken = tokens.refresh_token;
    await user.save();
    
    return tokens;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Forgot password service
const forgotPassword = async (email) => {
  // Find user
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate token
  const resetToken = user.generateResetPasswordToken();
  await user.save();
  
  try {
    // Send reset email
    await sendPasswordResetEmail(user, resetToken);
    return true;
  } catch (error) {
    // If error sending email, clear reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    throw new Error('Error sending email');
  }
};

// Reset password service
const resetPassword = async (token, newPassword) => {
  // Hash token
  const resetPasswordToken = getResetPasswordToken(token);
  
  // Find user with the token and check if it's valid
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new Error('Invalid or expired token');
  }
  
  // Set new password and remove reset token fields
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();
  
  return true;
};

module.exports = {
  loginUser,
  refreshToken,
  forgotPassword,
  resetPassword
};