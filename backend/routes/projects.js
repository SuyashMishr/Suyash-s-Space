const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Project = require('../models/Project');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const projectValidation = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  body('category')
    .isIn(['web', 'mobile', 'desktop', 'ai', 'data', 'other'])
    .withMessage('Invalid category'),
  body('technologies')
    .isArray()
    .withMessage('Technologies must be an array'),
  body('status')
    .optional()
    .isIn(['completed', 'in-progress', 'planned'])
    .withMessage('Invalid status')
];

// Get all projects (public endpoint with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      featured, 
      status = 'completed',
      page = 1, 
      limit = 10,
      search 
    } = req.query;

    // Build query
    const query = { status };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const projects = await Project.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    // Filter confidential data for non-admin users
    const filteredProjects = projects.map(project => {
      if (!req.user || req.user.role !== 'admin') {
        return project.getPublicData();
      }
      return project;
    });

    res.json({
      projects: filteredProjects,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit)
      },
      confidential: true
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get featured projects
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const projects = await Project.getFeatured();
    
    const filteredProjects = projects.map(project => {
      if (!req.user || req.user.role !== 'admin') {
        return project.getPublicData();
      }
      return project;
    });

    res.json({
      projects: filteredProjects,
      confidential: true
    });

  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get projects by category
router.get('/category/:category', optionalAuth, async (req, res) => {
  try {
    const { category } = req.params;
    const projects = await Project.getByCategory(category);
    
    const filteredProjects = projects.map(project => {
      if (!req.user || req.user.role !== 'admin') {
        return project.getPublicData();
      }
      return project;
    });

    res.json({
      projects: filteredProjects,
      category,
      confidential: true
    });

  } catch (error) {
    console.error('Get projects by category error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get single project
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        confidential: true 
      });
    }

    // Filter confidential data for non-admin users
    const projectData = (!req.user || req.user.role !== 'admin') 
      ? project.getPublicData() 
      : project;

    res.json({
      project: projectData,
      confidential: true
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Create new project (admin only)
router.post('/', verifyToken, verifyAdmin, projectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array(),
        confidential: true 
      });
    }

    const project = new Project(req.body);
    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project,
      confidential: true
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Update project (admin only)
router.put('/:id', verifyToken, verifyAdmin, projectValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array(),
        confidential: true 
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        confidential: true 
      });
    }

    res.json({
      message: 'Project updated successfully',
      project,
      confidential: true
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Delete project (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        error: 'Project not found',
        confidential: true 
      });
    }

    res.json({
      message: 'Project deleted successfully',
      confidential: true
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

module.exports = router;
