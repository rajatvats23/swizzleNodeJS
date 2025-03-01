const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const jwtConfig = require('../config/jwt');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required! Please login.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid authentication format! Token required.' });
    }
    
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);
      
      // Find user by id
      const user = await User.findById(decoded.user_id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'User not found!' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired!', expired: true });
      }
      
      return res.status(401).json({ message: 'Invalid token!' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error during authentication.' });
  }
};

module.exports = { verifyToken };