const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const Project = require('../models/Project');
const Resume = require('../models/Resume');
const User = require('../models/User');
const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    if (file.fieldname === 'profilePhoto') {
      uploadPath = path.join(__dirname, '../uploads/profile');
    } else if (file.fieldname === 'resume') {
      uploadPath = path.join(__dirname, '../uploads/resume');
    } else {
      uploadPath = path.join(__dirname, '../uploads');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profilePhoto') {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photo'), false);
    }
  } else if (file.fieldname === 'resume') {
    // Accept PDF, DOC, and DOCX files
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// ====================
// CONTACT MESSAGES MANAGEMENT
// ====================

// Get all contact messages
router.get('/contact-messages', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const totalMessages = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNextPage: page < Math.ceil(totalMessages / limit),
        hasPrevPage: page > 1
      },
      confidential: true
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Get specific contact message
router.get('/contact-messages/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id)
      .populate('replies.sentBy', 'username email')
      .lean();

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found',
        confidential: true 
      });
    }

    // Mark as read if it wasn't already
    if (message.status === 'new') {
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { 
          status: 'read',
          readAt: new Date()
        }
      );
      message.status = 'read';
      message.readAt = new Date();
    }

    res.json({
      success: true,
      message,
      confidential: true
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Update contact message status
router.patch('/contact-messages/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        confidential: true 
      });
    }

    const updateData = { status };
    if (status === 'read') {
      updateData.readAt = new Date();
    } else if (status === 'replied') {
      updateData.repliedAt = new Date();
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found',
        confidential: true 
      });
    }

    res.json({
      success: true,
      message,
      confidential: true
    });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Delete contact message
router.delete('/contact-messages/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found',
        confidential: true 
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      confidential: true
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Reply to contact message
router.post('/contact-messages/:id/reply', async (req, res) => {
  try {
    const { message: replyMessage, recipientEmail, recipientName } = req.body;

    if (!replyMessage || !recipientEmail) {
      return res.status(400).json({ 
        error: 'Reply message and recipient email are required',
        confidential: true 
      });
    }

    const contactMessage = await ContactMessage.findById(req.params.id);
    if (!contactMessage) {
      return res.status(404).json({ 
        error: 'Message not found',
        confidential: true 
      });
    }

    // Send email reply
    const emailSent = await sendEmailReply({
      recipientEmail,
      recipientName: recipientName || contactMessage.name,
      originalSubject: contactMessage.subject,
      replyMessage,
      originalMessage: contactMessage.message
    });

    if (emailSent) {
      // Save reply to database
      contactMessage.replies.push({
        message: replyMessage,
        sentBy: req.user.userId,
        sentAt: new Date()
      });
      
      // Update status
      contactMessage.status = 'replied';
      contactMessage.repliedAt = new Date();
      
      await contactMessage.save();

      res.json({
        success: true,
        message: 'Reply sent successfully',
        confidential: true
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send email reply',
        confidential: true
      });
    }
  } catch (error) {
    console.error('Send reply error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      confidential: true 
    });
  }
});

// Email reply function
async function sendEmailReply({ recipientEmail, recipientName, originalSubject, replyMessage, originalMessage }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email credentials not configured for replies');
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Suyash Mishra - Portfolio" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Re: ${originalSubject || 'Your message from my portfolio'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">Suyash Mishra</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; text-align: center;">Full Stack Developer</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
              Hi ${recipientName},
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out through my portfolio contact form. I appreciate your message!
            </p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                ${replyMessage.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <div style="background: #f1f3f4; padding: 15px; border-radius: 5px; margin-top: 25px;">
              <h4 style="color: #495057; margin: 0 0 10px 0; font-size: 14px;">Your Original Message:</h4>
              <p style="color: #6c757d; font-size: 13px; line-height: 1.5; margin: 0;">
                "${originalMessage.substring(0, 200)}${originalMessage.length > 200 ? '...' : ''}"
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong>Suyash Mishra</strong><br>
                Full Stack Developer
              </p>
              
              <div style="margin-top: 15px;">
                <a href="https://github.com/SuyashMishr" style="color: #667eea; text-decoration: none; margin-right: 15px;">GitHub</a>
                <a href="https://www.linkedin.com/in/suyash-mishra-b8667a253/" style="color: #667eea; text-decoration: none; margin-right: 15px;">LinkedIn</a>
                <a href="mailto:suyashmishraa983@gmail.com" style="color: #667eea; text-decoration: none;">Email</a>
              </div>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #6c757d; font-size: 12px; margin: 0;">
              This email was sent in response to your portfolio contact form submission.
            </p>
          </div>
        </div>
      `,
      text: `
Hi ${recipientName},

Thank you for reaching out through my portfolio contact form. 

${replyMessage}

Your original message: "${originalMessage.substring(0, 200)}${originalMessage.length > 200 ? '...' : ''}"

Best regards,
Suyash Mishra
Full Stack Developer
Email: suyashmishraa983@gmail.com
GitHub: https://github.com/SuyashMishr
LinkedIn: https://www.linkedin.com/in/suyash-mishra-b8667a253/
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Reply sent successfully to ${recipientEmail}`);
    return true;

  } catch (error) {
    console.error('📧 Reply email sending error:', error);
    return false;
  }
}

// =============================================================================
// PROFILE MANAGEMENT ROUTES
// =============================================================================

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const user = req.user; // User is already loaded by auth middleware
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return profile data
    res.json({
      name: user.fullName || user.username,
      email: user.email,
      bio: user.bio || '',
      position: user.position || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
      profilePhoto: user.profilePhoto || null,
      resume: user.resume || null
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update admin profile
router.put('/profile', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, bio, position, location, phone, website } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic information
    const updateData = {
      fullName: name,
      email: email,
      bio: bio,
      position: position,
      location: location,
      phone: phone,
      website: website,
      updatedAt: new Date()
    };

    // Handle profile photo upload
    if (req.files && req.files.profilePhoto) {
      const profilePhoto = req.files.profilePhoto[0];
      
      // Delete old profile photo if it exists
      if (user.profilePhoto) {
        const oldPhotoPath = path.join(__dirname, '..', user.profilePhoto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      // Set new profile photo path (relative to backend root)
      updateData.profilePhoto = `/uploads/profile/${profilePhoto.filename}`;
    }

    // Handle resume upload
    if (req.files && req.files.resume) {
      const resume = req.files.resume[0];
      
      // Delete old resume if it exists
      if (user.resume) {
        const oldResumePath = path.join(__dirname, '..', user.resume);
        if (fs.existsSync(oldResumePath)) {
          fs.unlinkSync(oldResumePath);
        }
      }

      // Set new resume path (relative to backend root)
      updateData.resume = `/uploads/resume/${resume.filename}`;

      // Also copy to frontend public folder for direct access
      const frontendResumePath = path.join(__dirname, '../../frontend/public/resume.pdf');
      const backendResumePath = path.join(__dirname, '../uploads/resume', resume.filename);
      
      if (fs.existsSync(backendResumePath)) {
        fs.copyFileSync(backendResumePath, frontendResumePath);
        console.log('Resume copied to frontend public folder');
      }
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      profile: {
        name: updatedUser.fullName || updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio || '',
        position: updatedUser.position || '',
        location: updatedUser.location || '',
        phone: updatedUser.phone || '',
        website: updatedUser.website || '',
        profilePhoto: updatedUser.profilePhoto,
        resume: updatedUser.resume
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
