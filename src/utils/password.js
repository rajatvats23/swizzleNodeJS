const crypto = require('crypto');

// Generate a hashed reset token
const getResetPasswordToken = (plainToken) => {
  // Hash token
  return crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');
};

// Validate password strength
const isStrongPassword = (password) => {
  // Password must contain at least:
  // - 8 characters
  // - One uppercase letter
  // - One lowercase letter
  // - One number
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return regex.test(password);
};

module.exports = { getResetPasswordToken, isStrongPassword };