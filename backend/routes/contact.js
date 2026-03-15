const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const router = express.Router();

// Rate limiting for contact form - More reasonable limits
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 contact form submissions per windowMs (increased from 3)
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again in a few minutes.',
    confidential: true
  }
});

// Validation for contact form
const contactValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('subject')
    .optional()
    .isLength({ min: 0, max: 200 })
    .withMessage('Subject must be less than 200 characters')
    .trim()
    .escape(),
  body('message')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .trim()
    .escape()
];

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactLimiter, contactValidation, async (req, res) => {
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

    const { name, email, subject, message } = req.body;
    const userIP = req.ip;
    const userAgent = req.get('User-Agent');
    const timestamp = new Date();

    // Save message to database
    const contactMessage = new ContactMessage({
      name,
      email,
      subject: subject || '',
      message,
      userIP,
      userAgent,
      status: 'new'
    });

    await contactMessage.save();

    // Log the contact form submission
    console.log(`Contact form submission from ${userIP}:`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message.substring(0, 100)}...`);
    console.log(`Timestamp: ${timestamp.toISOString()}`);
    console.log(`Saved to database with ID: ${contactMessage._id}`);

    // Send email notification
    const emailSent = await simulateEmailSending({
      name,
      email,
      subject,
      message,
      userIP,
      timestamp,
      messageId: contactMessage._id
    });

    if (emailSent) {
      res.json({
        success: true,
        message: 'Thank you for your message! I will get back to you soon.',
        confidential: true
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        confidential: true
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      confidential: true
    });
  }
});

// @route   GET /api/contact/info
// @desc    Get contact information
// @access  Public
router.get('/info', (req, res) => {
  res.json({
    success: true,
    contact: {
      email: 'suyashmishraa983@gmail.com',
      phone: '+91 8957458327',
      location: 'MMMUT, Gorakhpur',
      linkedin: 'https://www.linkedin.com/in/suyash-mishra-b8667a253/',
      github: 'https://github.com/SuyashMishr',
      availability: 'Open to new opportunities',
      responseTime: '24-48 hours'
    },
    confidential: true
  });
});



async function simulateEmailSending(formData) {
  try {
    // In development, allow simulation if credentials are missing
    const isProduction = process.env.NODE_ENV === 'production';

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('📧 Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
      console.log('📧 Email simulation:', {
        to: 'suyashmishraa983@gmail.com',
        subject: `Portfolio Contact: ${formData.subject || 'No Subject'}`,
        from: formData.email,
        name: formData.name,
        message: formData.message
      });

      // In production, treat missing credentials as a failure so you notice it
      if (isProduction) {
        return false;
      }

      // In development, simulate success so you can test the flow
      return true;
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'suyashmishraa983@gmail.com',
      subject: `Portfolio Contact: ${formData.subject || 'Message from ' + formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
            ${formData.subject ? `<p><strong>Subject:</strong> ${formData.subject}</p>` : ''}
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
            <h4 style="color: #495057; margin-top: 0;">Message:</h4>
            <p style="line-height: 1.6; color: #6c757d;">
              ${formData.message.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          
          <div style="font-size: 12px; color: #6c757d;">
            <p>
              <strong>Submission Details:</strong><br>
              IP Address: ${formData.userIP}<br>
              Timestamp: ${formData.timestamp.toLocaleString()}
            </p>
            <p>
              <em>This email was sent from your portfolio contact form.</em>
            </p>
          </div>
        </div>
      `,
      // Also send a plain text version
      text: `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject || 'No Subject'}

Message:
${formData.message}

---
Submission Details:
IP: ${formData.userIP}
Time: ${formData.timestamp.toLocaleString()}
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully to suyashmishraa983@gmail.com');
    return true;

  } catch (error) {
    console.error('📧 Email sending error:', error);
    return false; // Return false to indicate an error occurred
  }
}

module.exports = router;
