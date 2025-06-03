const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken
} = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_\s]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

const loginValidation = [
  body('username')
    .optional()
    .notEmpty()
    .withMessage('Username cannot be empty'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body()
    .custom((value, { req }) => {
      if (!req.body.username && !req.body.email) {
        throw new Error('Either username or email is required');
      }
      return true;
    })
];

// Register new user (admin only for security)
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        confidential: true
      });
    }

    const { username, email, password, adminKey } = req.body;

    // Check admin key for registration
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        error: 'Invalid admin key. Registration not allowed.',
        confidential: true
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email or username already exists',
        confidential: true
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: 'admin' // All registered users are admins for this portfolio
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
      refreshToken,
      confidential: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      confidential: true
    });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        confidential: true
      });
    }

    const { username, email, password } = req.body;

    // Find user by username or email
    const query = username ? { username } : { email };
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        confidential: true
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        confidential: true
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      user: user.toJSON(),
      token,
      refreshToken,
      confidential: true
    });

  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Account is temporarily locked') {
      return res.status(423).json({
        success: false,
        message: error.message,
        confidential: true
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      confidential: true
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        confidential: true
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        confidential: true
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
      confidential: true
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      confidential: true
    });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  res.json({
    user: req.user.toJSON(),
    confidential: true
  });
});

// Verify token
router.get('/verify', verifyToken, async (req, res) => {
  res.json({
    success: true,
    user: req.user.toJSON(),
    confidential: true
  });
});

// Logout (client-side token removal)
router.post('/logout', verifyToken, (req, res) => {
  res.json({
    message: 'Logout successful',
    confidential: true
  });
});

module.exports = router;
