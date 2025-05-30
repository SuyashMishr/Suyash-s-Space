const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        confidential: true 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.',
        confidential: true 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is deactivated.',
        confidential: true 
      });
    }

    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked.',
        confidential: true 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        confidential: true 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired.',
        confidential: true 
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error.',
      confidential: true 
    });
  }
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin privileges required.',
      confidential: true 
    });
  }
  next();
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'portfolio-backend',
      audience: 'portfolio-frontend'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'portfolio-backend',
      audience: 'portfolio-frontend'
    }
  );
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive && !user.isLocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // Additional rate limiting can be implemented here
  // For now, just pass through
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  optionalAuth,
  sensitiveOperationLimit
};
