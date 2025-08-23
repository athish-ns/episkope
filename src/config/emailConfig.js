// Email Service Configuration
// Modify this file to configure your email service

export const emailConfig = {
  // Choose your email service provider
  // Options: 'resend', 'nodemailer', 'console'
  provider: 'nodemailer', // Changed to nodemailer to use backend server

  // Resend Configuration (FREE - 3,000 emails/month)
  resend: {
    apiKey: 're_AUDQ2VXV_NoFyxAC3DDYMfNt8ocsktWCP',
    fromEmail: 'noreply@emergency.episkope.com',
    fromName: 'Rehabilitation Center System'
  },

  // Gmail Configuration (requires app password)
  gmail: {
    user: 'episkopeemergency@gmail.com',
    password: 'gfak pisw hzmt zkkd', // Use Gmail App Password, not regular password
    fromEmail: 'episkopeemergency@gmail.com',
    fromName: 'Rehabilitation Center System'
  }
};

// Environment variable overrides (recommended for production)
export const getEmailConfig = () => {
  return {
    provider: process.env.REACT_APP_EMAIL_PROVIDER || emailConfig.provider,
    
    resend: {
      apiKey: process.env.REACT_APP_RESEND_API_KEY || emailConfig.resend.apiKey,
      fromEmail: process.env.REACT_APP_FROM_EMAIL || emailConfig.resend.fromEmail,
      fromName: process.env.REACT_APP_FROM_NAME || emailConfig.resend.fromName
    },

    gmail: {
      user: process.env.REACT_APP_GMAIL_USER || emailConfig.gmail.user,
      password: process.env.REACT_APP_GMAIL_PASSWORD || emailConfig.gmail.password,
      fromEmail: process.env.REACT_APP_GMAIL_FROM_EMAIL || emailConfig.gmail.fromEmail,
      fromName: process.env.REACT_APP_GMAIL_FROM_NAME || emailConfig.gmail.fromName
    }
  };
};
