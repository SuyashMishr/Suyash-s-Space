const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for chatbot
const chatbotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many chatbot requests, please try again later.',
    confidential: true
  }
});

// Validation for chat messages
const chatValidation = [
  body('message')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
    .trim()
    .escape(),
  body('sessionId')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters')
];

// Chat endpoint
router.post('/chat', chatbotLimiter, chatValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
        confidential: true
      });
    }

    const { message, sessionId } = req.body;
    const userIP = req.ip;

    // Log the chat request (for monitoring)
    console.log(`Chat request from ${userIP}: ${message.substring(0, 50)}...`);

    try {
      // Call AI service
      const aiResponse = await axios.post(
        `${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/chat`,
        {
          message,
          sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userIP
        },
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': process.env.AI_SERVICE_API_KEY || 'dev-key'
          }
        }
      );

      const { response, sessionId: returnedSessionId, confidence, sources } = aiResponse.data;

      res.json({
        success: true,
        response,
        sessionId: returnedSessionId,
        confidence,
        sources: sources || [],
        timestamp: new Date().toISOString(),
        confidential: true
      });

    } catch (aiError) {
      console.error('AI service error:', aiError.message);

      // Fallback response when AI service is unavailable
      const fallbackResponse = getFallbackResponse(message);

      res.json({
        success: true,
        response: fallbackResponse,
        sessionId: sessionId || `fallback_${Date.now()}`,
        confidence: 0.5,
        sources: [],
        timestamp: new Date().toISOString(),
        fallback: true,
        confidential: true
      });
    }

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: 'Internal server error',
      confidential: true
    });
  }
});

// Get chat capabilities
router.get('/capabilities', (req, res) => {
  res.json({
    capabilities: [
      'Answer questions about skills and experience',
      'Provide information about projects',
      'Discuss technical expertise',
      'Share professional background',
      'Explain project details and technologies used'
    ],
    limitations: [
      'Cannot access real-time information',
      'Limited to portfolio-related topics',
      'Cannot perform actions or make changes',
      'Responses are based on pre-trained knowledge'
    ],
    confidential: true
  });
});

// Get chat statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // This would typically come from a chat logs database
    // For now, return mock statistics
    res.json({
      totalChats: 0,
      averageResponseTime: '1.2s',
      topQuestions: [
        'What technologies do you work with?',
        'Tell me about your experience',
        'What projects have you worked on?'
      ],
      confidential: true
    });
  } catch (error) {
    console.error('Chat stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      confidential: true
    });
  }
});

// Fallback responses when AI service is unavailable
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('skill') || lowerMessage.includes('technology')) {
    return "I'm experienced in full-stack development with technologies like React, Node.js, Python, and MongoDB. I also work with AI/ML technologies and cloud platforms. For detailed information about my skills, please check the Skills section of this portfolio.";
  }

  if (lowerMessage.includes('project')) {
    return "I've worked on various projects including web applications, AI systems, and data analysis tools. You can find detailed information about my projects in the Projects section of this portfolio.";
  }

  if (lowerMessage.includes('experience')) {
    return "I have experience in software development, AI/ML, and full-stack web development. Please check the Resume section for detailed information about my professional experience.";
  }

  if (lowerMessage.includes('contact')) {
    return "You can reach out to me through the Contact section of this portfolio. I'm always open to discussing new opportunities and collaborations.";
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm an AI assistant that can help you learn about this portfolio. Feel free to ask me about skills, projects, experience, or any other questions you might have.";
  }

  return "I'm here to help you learn about this portfolio. You can ask me about skills, projects, experience, or any other questions. Please note that the AI service is currently unavailable, so I'm providing basic responses. For detailed information, please explore the different sections of this portfolio.";
}

// Health check for chatbot service
router.get('/health', async (req, res) => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    try {
      const healthCheck = await axios.get(`${aiServiceUrl}/health`, {
        timeout: 5000
      });

      res.json({
        status: 'OK',
        aiService: 'connected',
        aiServiceStatus: healthCheck.data,
        timestamp: new Date().toISOString(),
        confidential: true
      });
    } catch (aiError) {
      res.json({
        status: 'OK',
        aiService: 'disconnected',
        fallbackMode: true,
        timestamp: new Date().toISOString(),
        confidential: true
      });
    }
  } catch (error) {
    console.error('Chatbot health check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      confidential: true
    });
  }
});

module.exports = router;
