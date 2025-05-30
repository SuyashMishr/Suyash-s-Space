const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 contact form submissions per windowMs
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later.',
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
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters')
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
    const timestamp = new Date();

    // Log the contact form submission
    console.log(`Contact form submission from ${userIP}:`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message.substring(0, 100)}...`);
    console.log(`Timestamp: ${timestamp.toISOString()}`);

    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Possibly integrate with a CRM system

    // For now, we'll just simulate success
    // You could integrate with services like:
    // - SendGrid for email
    // - Nodemailer for SMTP
    // - AWS SES for email service
    // - Slack/Discord webhooks for notifications

    // Simulate email sending (replace with actual implementation)
    const emailSent = await simulateEmailSending({
      name,
      email,
      subject,
      message,
      userIP,
      timestamp
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

// Simulate email sending function
async function simulateEmailSending(formData) {
  try {
    // In a real implementation, you would use a service like:
    
    /*
    // Example with Nodemailer
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: formData.email,
      to: 'suyashmishraa983@gmail.com',
      subject: `Portfolio Contact: ${formData.subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message}</p>
        <hr>
        <p><small>Submitted from IP: ${formData.userIP} at ${formData.timestamp}</small></p>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
    */

    // For now, just simulate success
    console.log('Email would be sent with the following data:', formData);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;

  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

module.exports = router;
