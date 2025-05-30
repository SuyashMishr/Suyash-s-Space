const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const { verifyToken, verifyAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get active resume (public endpoint with optional auth)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    // Return public version for non-admin users
    const resumeData = (!req.user || req.user.role !== 'admin') 
      ? resume.getPublicVersion() 
      : resume;

    res.json({
      resume: resumeData,
      confidential: true
    });

  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get resume sections separately
router.get('/personal', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    let personalInfo = resume.personalInfo;
    
    // Filter sensitive info for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      if (resume.metadata.confidentialityLevel === 'confidential') {
        personalInfo = { ...personalInfo };
        delete personalInfo.phone;
        delete personalInfo.email;
      }
    }

    res.json({
      personalInfo,
      confidential: true
    });

  } catch (error) {
    console.error('Get personal info error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

router.get('/experience', optionalAuth, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    // Filter confidential experience for non-admin users
    let experience = resume.experience;
    if (!req.user || req.user.role !== 'admin') {
      experience = experience.filter(exp => !exp.confidential);
    }

    res.json({
      experience,
      confidential: true
    });

  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

router.get('/skills', async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    res.json({
      skills: resume.skills,
      confidential: true
    });

  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

router.get('/education', async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    res.json({
      education: resume.education,
      confidential: true
    });

  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Create or update resume (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Deactivate existing resume
    await Resume.updateMany({}, { 'metadata.isActive': false });
    
    // Create new resume
    const resume = new Resume(req.body);
    resume.metadata.isActive = true;
    
    await resume.save();

    res.status(201).json({
      message: 'Resume created successfully',
      resume,
      confidential: true
    });

  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Update resume (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    res.json({
      message: 'Resume updated successfully',
      resume,
      confidential: true
    });

  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Add experience entry (admin only)
router.post('/experience', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    resume.experience.push(req.body);
    await resume.save();

    res.status(201).json({
      message: 'Experience added successfully',
      experience: resume.experience,
      confidential: true
    });

  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Update experience entry (admin only)
router.put('/experience/:index', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    const index = parseInt(req.params.index);
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    if (index < 0 || index >= resume.experience.length) {
      return res.status(404).json({ 
        error: 'Experience entry not found',
        confidential: true 
      });
    }

    resume.experience[index] = { ...resume.experience[index], ...req.body };
    await resume.save();

    res.json({
      message: 'Experience updated successfully',
      experience: resume.experience,
      confidential: true
    });

  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Delete experience entry (admin only)
router.delete('/experience/:index', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const resume = await Resume.getActive();
    const index = parseInt(req.params.index);
    
    if (!resume) {
      return res.status(404).json({ 
        error: 'Resume not found',
        confidential: true 
      });
    }

    if (index < 0 || index >= resume.experience.length) {
      return res.status(404).json({ 
        error: 'Experience entry not found',
        confidential: true 
      });
    }

    resume.experience.splice(index, 1);
    await resume.save();

    res.json({
      message: 'Experience deleted successfully',
      experience: resume.experience,
      confidential: true
    });

  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

module.exports = router;
