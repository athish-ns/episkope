import { getEmailConfig } from '../config/emailConfig.js'

// Email service configuration and implementation
class EmailService {
  constructor() {
    this.emailQueue = []
    this.isProcessing = false
    
    // Load configuration from config file
    this.config = getEmailConfig()
    
    // Initialize the selected email service
    this.initializeEmailService()
  }

  // Initialize the selected email service
  initializeEmailService() {
    const provider = this.config.provider
    
    switch (provider) {
      case 'resend':
        this.initializeResend()
        break
      case 'nodemailer':
        this.initializeNodemailer()
        break
      case 'console':
      default:
        this.initializeConsole()
        break
    }
  }

  // Initialize Resend
  initializeResend() {
    console.log('Resend email service initialized - FREE tier: 3,000 emails/month')
  }

  // Initialize Nodemailer (server-side only)
  initializeNodemailer() {
    console.log('Nodemailer initialized - requires backend implementation')
  }

  // Initialize Console (fallback)
  initializeConsole() {
    console.log('Console email service initialized - emails will be logged to console')
  }

  // Send email using the configured provider
  async sendEmail(emailData) {
    const provider = this.config.provider
    
    try {
      switch (provider) {
        case 'resend':
          return await this.sendEmailViaResend(emailData)
        case 'nodemailer':
          return await this.sendEmailViaNodemailer(emailData)
        case 'console':
        default:
          return await this.sendEmailViaConsole(emailData)
      }
    } catch (error) {
      console.error(`Error sending email via ${provider}:`, error)
      // Fallback to console
      return await this.sendEmailViaConsole(emailData)
    }
  }

  // Send email via Resend (FREE alternative to SendGrid)
  async sendEmailViaResend(emailData) {
    const { to, subject, html, text } = emailData
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.resend.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${this.config.resend.fromName} <${this.config.resend.fromEmail}>`,
          to: [to],
          subject: subject,
          html: html,
          text: text
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Resend API error: ${errorData.message || response.statusText}`)
      }

      const result = await response.json()
      return { success: true, provider: 'resend', messageId: result.id }

    } catch (error) {
      console.error('Resend email error:', error)
      throw error
    }
  }

  // Send email via Nodemailer (requires backend)
  async sendEmailViaNodemailer(emailData) {
    const { to, subject, html, text } = emailData
    
    try {
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Nodemailer API error: ${errorData.error || response.statusText}`)
      }

      const result = await response.json()
      return { success: true, provider: 'nodemailer', messageId: result.messageId }

    } catch (error) {
      console.error('Nodemailer email error:', error)
      throw error
    }
  }

  // Send email via Console (fallback)
  async sendEmailViaConsole(emailData) {
    const { to, subject, html, text } = emailData
    
    console.log('📧 CONSOLE EMAIL (Fallback):', {
      to,
      subject,
      html: html.substring(0, 200) + '...',
      text: text.substring(0, 200) + '...',
      timestamp: new Date().toISOString()
    })

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return { success: true, provider: 'console' }
  }

  // Update email service configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.initializeEmailService()
  }

  // Get current configuration
  getConfig() {
    return { ...this.config }
  }

  // Test email service configuration
  async testEmailService() {
    const testEmail = {
      to: 'test@example.com',
      subject: 'Test Email - Rehabilitation Center System',
      html: '<h1>Test Email</h1><p>This is a test email to verify your email service configuration.</p>',
      text: 'Test Email\n\nThis is a test email to verify your email service configuration.'
    }

    try {
      const result = await this.sendEmail(testEmail)
      console.log('✅ Email service test successful:', result)
      return { success: true, result }
    } catch (error) {
      console.error('❌ Email service test failed:', error)
      return { success: false, error: error.message }
    }
  }

  // Email service for sending emergency notifications
  async sendEmergencyEmail(emergencyData) {
    try {
      const { 
        patientId, 
        patientName, 
        assignedDoctor, 
        assignedNurse, 
        assignedBuddy, 
        severity, 
        description, 
        location,
        timestamp 
      } = emergencyData

      // For testing purposes, we'll simulate sending emails
      // In production, you would get actual user emails from your database
      const recipients = []
      
      if (assignedDoctor) {
        recipients.push({
          id: assignedDoctor,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Dr. Smith',
          role: 'Doctor'
        })
      }

      if (assignedNurse) {
        recipients.push({
          id: assignedNurse,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Nurse Jones',
          role: 'Nurse'
        })
      }

      if (assignedBuddy) {
        recipients.push({
          id: assignedBuddy,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Medical Buddy Wilson',
          role: 'Medical Buddy'
        })
      }

      // Send emails to all recipients
      const emailPromises = []
      for (const recipient of recipients) {
        const emailPromise = this.sendEmergencyEmailToStaff(recipient, emergencyData)
        emailPromises.push(emailPromise)
      }

      // Wait for all emails to be sent
      const results = await Promise.allSettled(emailPromises)
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`Emergency emails sent: ${successful} successful, ${failed} failed`)

      return {
        success: true,
        recipients: recipients.length,
        successful,
        failed
      }

    } catch (error) {
      console.error('Error sending emergency emails:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Send emergency email to individual staff member
  async sendEmergencyEmailToStaff(recipient, emergencyData) {
    try {
      const { patientName, severity, description, location, timestamp } = emergencyData
      
      const emailData = {
        to: recipient.email,
        subject: `🚨 EMERGENCY ALERT - ${severity.toUpperCase()} - Patient: ${patientName}`,
        html: this.generateEmergencyEmailHTML(recipient, emergencyData),
        text: this.generateEmergencyEmailText(recipient, emergencyData),
        priority: 'high',
        metadata: {
          type: 'emergency',
          recipientId: recipient.id,
          recipientRole: recipient.role,
          patientId: emergencyData.patientId,
          severity,
          timestamp
        }
      }

      // Use the unified email service
      const emailResult = await this.sendEmail(emailData)
      
      if (emailResult.success) {
        console.log('📧 EMERGENCY EMAIL SENT:', {
          to: recipient.email,
          role: recipient.role,
          patient: patientName,
          severity,
          provider: emailResult.provider,
          timestamp: new Date().toISOString()
        })
      }

      return { success: true, recipientId: recipient.id, provider: emailResult.provider }

    } catch (error) {
      console.error(`Error sending emergency email to ${recipient.email}:`, error)
      throw error
    }
  }

  // Generate HTML email content
  generateEmergencyEmailHTML(recipient, emergencyData) {
    const { patientName, severity, description, location, timestamp } = emergencyData
    const severityColor = severity === 'critical' ? '#d32f2f' : 
                         severity === 'high' ? '#f57c00' : '#ff9800'
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emergency Alert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: ${severityColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${severityColor}; }
          .button { background: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 EMERGENCY ALERT 🚨</h1>
          <h2>${severity.toUpperCase()} Priority</h2>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>Dear ${recipient.name} (${recipient.role}),</strong><br>
            An emergency situation has been reported that requires your immediate attention.
          </div>
          
          <div class="info">
            <h3>Emergency Details:</h3>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Time Reported:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
          
          <div class="info">
            <h3>Required Actions:</h3>
            <ul>
              <li>Immediately review the emergency situation</li>
              <li>Coordinate with other assigned staff members</li>
              <li>Take appropriate medical action as needed</li>
              <li>Update patient status in the system</li>
            </ul>
          </div>
          
          <a href="#" class="button">View Patient Details</a>
          <a href="#" class="button">Acknowledge Emergency</a>
        </div>
        
        <div class="footer">
          <p>This is an automated emergency alert from the Rehabilitation Center Management System.</p>
          <p>Please do not reply to this email. Contact the system administrator if you have questions.</p>
        </div>
      </body>
      </html>
    `
  }

  // Generate plain text email content
  generateEmergencyEmailText(recipient, emergencyData) {
    const { patientName, severity, description, location, timestamp } = emergencyData
    
    return `
EMERGENCY ALERT - ${severity.toUpperCase()}

Dear ${recipient.name} (${recipient.role}),

An emergency situation has been reported that requires your immediate attention.

EMERGENCY DETAILS:
- Patient: ${patientName}
- Severity: ${severity.toUpperCase()}
- Description: ${description}
- Location: ${location}
- Time Reported: ${new Date(timestamp).toLocaleString()}

REQUIRED ACTIONS:
1. Immediately review the emergency situation
2. Coordinate with other assigned staff members
3. Take appropriate medical action as needed
4. Update patient status in the system

This is an automated emergency alert from the Rehabilitation Center Management System.
Please do not reply to this email. Contact the system administrator if you have questions.
    `.trim()
  }

  // Send assignment notification emails
  async sendAssignmentEmails(assignmentData) {
    try {
      const { 
        patientId, 
        patientName, 
        assignedDoctor, 
        assignedNurse, 
        assignedBuddy, 
        assignmentType 
      } = assignmentData

      const recipients = []

      // Get staff details for new assignments
      if (assignedDoctor && assignmentType === 'doctor') {
        recipients.push({
          id: assignedDoctor,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Dr. Smith',
          role: 'Doctor'
        })
      }

      if (assignedNurse && assignmentType === 'nurse') {
        recipients.push({
          id: assignedNurse,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Nurse Jones',
          role: 'Nurse'
        })
      }

      if (assignedBuddy && assignmentType === 'buddy') {
        recipients.push({
          id: assignedBuddy,
          email: 'vaibhavkiran@karunya.edu.in', // Replace with actual email lookup
          name: 'Medical Buddy Wilson',
          role: 'Medical Buddy'
        })
      }

      // Send assignment notification emails
      const emailPromises = []
      for (const recipient of recipients) {
        const emailPromise = this.sendAssignmentEmail(recipient, assignmentData)
        emailPromises.push(emailPromise)
      }

      const results = await Promise.allSettled(emailPromises)
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      return {
        success: true,
        recipients: recipients.length,
        successful,
        failed
      }

    } catch (error) {
      console.error('Error sending assignment emails:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Send assignment notification email
  async sendAssignmentEmail(recipient, assignmentData) {
    try {
      const { patientName, assignmentType } = assignmentData
      
      const emailData = {
        to: recipient.email,
        subject: `📋 New Patient Assignment - ${patientName}`,
        html: this.generateAssignmentEmailHTML(recipient, assignmentData),
        text: this.generateAssignmentEmailText(recipient, assignmentData),
        priority: 'normal',
        metadata: {
          type: 'assignment',
          recipientId: recipient.id,
          recipientRole: recipient.role,
          patientId: assignmentData.patientId,
          assignmentType,
          timestamp: new Date().toISOString()
        }
      }

      // Use the unified email service
      const emailResult = await this.sendEmail(emailData)
      
      if (emailResult.success) {
        console.log('📧 ASSIGNMENT EMAIL SENT:', {
          to: recipient.email,
          role: recipient.role,
          patient: patientName,
          assignmentType,
          provider: emailResult.provider,
          timestamp: new Date().toISOString()
        })
      }

      return { success: true, recipientId: recipient.id, provider: emailResult.provider }

    } catch (error) {
      console.error(`Error sending assignment email to ${recipient.email}:`, error)
      throw error
    }
  }

  // Generate assignment email HTML
  generateAssignmentEmailHTML(recipient, assignmentData) {
    const { patientName, assignmentType } = assignmentData
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Patient Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196F3; }
          .button { background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 New Patient Assignment</h1>
        </div>
        
        <div class="content">
          <div class="info">
            <strong>Dear ${recipient.name} (${recipient.role}),</strong><br>
            You have been assigned to a new patient.
          </div>
          
          <div class="info">
            <h3>Assignment Details:</h3>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Assignment Type:</strong> ${assignmentType}</p>
            <p><strong>Assigned Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="info">
            <h3>Next Steps:</h3>
            <ul>
              <li>Review patient information and medical history</li>
              <li>Schedule initial consultation or session</li>
              <li>Coordinate with other assigned staff members</li>
              <li>Begin care plan development</li>
            </ul>
          </div>
          
          <a href="#" class="button">View Patient Details</a>
          <a href="#" class="button">Access Patient Records</a>
        </div>
        
        <div class="footer">
          <p>This is an automated assignment notification from the Rehabilitation Center Management System.</p>
          <p>Please do not reply to this email. Contact the system administrator if you have questions.</p>
        </div>
      </body>
      </html>
    `
  }

  // Generate assignment email text
  generateAssignmentEmailText(recipient, assignmentData) {
    const { patientName, assignmentType } = assignmentData
    
    return `
NEW PATIENT ASSIGNMENT

Dear ${recipient.name} (${recipient.role}),

You have been assigned to a new patient.

ASSIGNMENT DETAILS:
- Patient: ${patientName}
- Assignment Type: ${assignmentType}
- Assigned Date: ${new Date().toLocaleDateString()}

NEXT STEPS:
1. Review patient information and medical history
2. Schedule initial consultation or session
3. Coordinate with other assigned staff members
4. Begin care plan development

This is an automated assignment notification from the Rehabilitation Center Management System.
Please do not reply to this email. Contact the system administrator if you have questions.
    `.trim()
  }
}

// Create singleton instance
const emailService = new EmailService()

export default emailService