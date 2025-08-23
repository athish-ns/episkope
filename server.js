const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting for security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Email configuration from environment variables
const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'gmail',
  gmail: {
    user: process.env.GMAIL_USER || 'episkopeemergency@gmail.com',
    password: process.env.GMAIL_PASSWORD || 'kddf lnrn gnmt mhyr',
    fromEmail: process.env.GMAIL_FROM_EMAIL || 'episkopeemergency@gmail.com',
    fromName: process.env.GMAIL_FROM_NAME || 'Rehabilitation Center System'
  }
};

// Validate email configuration
const validateEmailConfig = () => {
  if (!emailConfig.gmail.user || !emailConfig.gmail.password) {
    console.error('❌ Email configuration incomplete. Please check environment variables.');
    return false;
  }
  return true;
};

// Create Nodemailer transporter with error handling
let transporter;
try {
  if (validateEmailConfig()) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailConfig.gmail.user,
        pass: emailConfig.gmail.password
      },
      secure: true,
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email transporter is ready');
      }
    });
  }
} catch (error) {
  console.error('❌ Failed to create email transporter:', error);
}

// Input validation middleware
const validateEmailRequest = (req, res, next) => {
  const { to, subject, html, text } = req.body;
  
  // Check required fields
  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: to, subject, and either html or text'
    });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }
  
  // Validate subject length
  if (subject.length > 200) {
    return res.status(400).json({
      success: false,
      error: 'Subject too long (max 200 characters)'
    });
  }
  
  // Validate content length
  if (html && html.length > 1000000) { // 1MB limit
    return res.status(400).json({
      success: false,
      error: 'HTML content too large (max 1MB)'
    });
  }
  
  if (text && text.length > 100000) { // 100KB limit
    return res.status(400).json({
      success: false,
      error: 'Text content too large (max 100KB)'
    });
  }
  
  next();
};

// Test email endpoint
app.post('/api/send-email', validateEmailRequest, async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }
    
    const { to, subject, html, text } = req.body;

    // Email options
    const mailOptions = {
      from: `"${emailConfig.gmail.fromName}" <${emailConfig.gmail.fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
      text: text,
      priority: 'high'
    };

    // Send email with timeout
    const sendEmailWithTimeout = () => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Email sending timeout'));
        }, 30000); // 30 second timeout
        
        transporter.sendMail(mailOptions, (error, info) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        });
      });
    };

    const info = await sendEmailWithTimeout();

    console.log('📧 Email sent successfully:', {
      to: to,
      subject: subject,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      provider: 'nodemailer',
      messageId: info.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      userMessage = 'Email authentication failed. Please check credentials.';
    } else if (error.code === 'ECONNECTION') {
      userMessage = 'Email service connection failed. Please try again later.';
    } else if (error.message === 'Email sending timeout') {
      userMessage = 'Email service is slow. Please try again later.';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage,
      provider: 'nodemailer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    emailService: transporter ? 'configured' : 'not configured'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Email server is running!',
    config: {
      provider: emailConfig.provider,
      fromEmail: emailConfig.gmail.fromEmail,
      fromName: emailConfig.gmail.fromName,
      emailConfigured: !!transporter
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test',
      'POST /api/send-email'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 Email configuration: ${emailConfig.provider}`);
  console.log(`📤 From: ${emailConfig.gmail.fromName} <${emailConfig.gmail.fromEmail}>`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📧 Send email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!transporter) {
    console.warn('⚠️  Email service not properly configured. Check environment variables.');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
