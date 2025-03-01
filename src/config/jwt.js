require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET,
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION
};