const express = require('express');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const Project = require('../models/Project');
const Resume = require('../models/Resume');
const User = require('../models/User');

const router = express.Router();

// All routes require admin authentication
router.use(verifyToken, verifyAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalProjects,
      featuredProjects,
      completedProjects,
      inProgressProjects,
      totalUsers,
      activeResume
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ featured: true }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'in-progress' }),
      User.countDocuments(),
      Resume.findOne({ 'metadata.isActive': true })
    ]);

    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentProjects = await Project.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt');

    res.json({
      statistics: {
        projects: {
          total: totalProjects,
          featured: featuredProjects,
          completed: completedProjects,
          inProgress: inProgressProjects,
          byCategory: projectsByCategory
        },
        users: {
          total: totalUsers
        },
        resume: {
          hasActive: !!activeResume,
          lastUpdated: activeResume?.metadata?.lastUpdated
        }
      },
      recentProjects,
      confidential: true
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get all projects (admin view with full data)
router.get('/projects', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20,
      category,
      status,
      search 
    } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit)
      },
      confidential: true
    });

  } catch (error) {
    console.error('Admin get projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Bulk update projects
router.patch('/projects/bulk', async (req, res) => {
  try {
    const { projectIds, updates } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ 
        error: 'Project IDs array is required',
        confidential: true 
      });
    }

    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      updates,
      { runValidators: true }
    );

    res.json({
      message: 'Projects updated successfully',
      modifiedCount: result.modifiedCount,
      confidential: true
    });

  } catch (error) {
    console.error('Bulk update projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get system information
router.get('/system', async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.json({
      system: systemInfo,
      confidential: true
    });

  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get application logs (last 100 entries)
router.get('/logs', async (req, res) => {
  try {
    // In a real application, you would read from log files
    // For now, return mock log data
    const mockLogs = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Application started',
        source: 'server.js'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'Database connected',
        source: 'database.js'
      }
    ];

    res.json({
      logs: mockLogs,
      confidential: true
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Backup data
router.post('/backup', async (req, res) => {
  try {
    const [projects, resumes, users] = await Promise.all([
      Project.find().lean(),
      Resume.find().lean(),
      User.find().select('-password').lean()
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        projects,
        resumes,
        users
      }
    };

    res.json({
      message: 'Backup created successfully',
      backup,
      confidential: true
    });

  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Clear cache (if implemented)
router.post('/cache/clear', (req, res) => {
  try {
    // Clear any caching mechanisms here
    res.json({
      message: 'Cache cleared successfully',
      confidential: true
    });

  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get user management data
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      users,
      confidential: true
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString() && !isActive) {
      return res.status(400).json({ 
        error: 'Cannot deactivate your own account',
        confidential: true 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        confidential: true 
      });
    }

    res.json({
      message: 'User status updated successfully',
      user,
      confidential: true
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

module.exports = router;
