const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const resumeRoutes = require('./routes/resume');
const chatbotRoutes = require('./routes/chatbot');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "*"],  // Allow all image sources
      connectSrc: ["'self'", "http://localhost:3001", "http://localhost:3002", "http://localhost:4000"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin requests
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - exclude static files
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for static files (uploads, images, etc.)
    return req.path.startsWith('/uploads/') || 
           req.path.startsWith('/static/') ||
           req.path.endsWith('.jpg') ||
           req.path.endsWith('.jpeg') ||
           req.path.endsWith('.png') ||
           req.path.endsWith('.gif') ||
           req.path.endsWith('.webp');
  }
});

app.use(limiter);

// Stricter rate limiting for auth routes (temporarily increased for testing)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute instead of 15
  max: 20, // 20 attempts instead of 5
  message: 'Too many authentication attempts, please try again later.',
});

// Middleware
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'https://suyashspace.netlify.app',
    'https://suyash-s-space-1.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',  // Admin panel URL
    'http://localhost:3003'   // Frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add confidentiality headers
app.use((req, res, next) => {
  res.setHeader('X-Confidential', 'PRIVATE-PORTFOLIO');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://new_user-31:k1vVfeD4rKWdsu20@cluster0.14ldhro.mongodb.net/portfolio')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);

// Serve uploaded files with proper CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.header('Cache-Control', 'public, max-age=86400'); // 1 day cache
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'connected',
      ai_service: 'available'
    },
    confidential: true
  });
});

// Root health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'portfolio-backend',
    timestamp: new Date().toISOString()
  });
});

// Confidentiality notice
app.get('/api/notice', (req, res) => {
  res.json({
    notice: 'CONFIDENTIAL PORTFOLIO',
    message: 'This website and its contents are private and confidential.',
    access: 'Authorized personnel only'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    confidential: true
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    confidential: true
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Confidential portfolio backend active`);
});
app.get('/', (req, res) => {
  res.send('🟢 Portfolio backend is running');
});

module.exports = app;
