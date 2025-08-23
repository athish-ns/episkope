import { dbService } from './firebaseService'
import { toast } from 'react-hot-toast'
import emailService from './emailService'

// Notification types
export const NOTIFICATION_TYPES = {
  REMINDER: 'reminder',
  EMERGENCY: 'emergency',
  SESSION_UPDATE: 'session_update',
  CARE_PLAN_UPDATE: 'care_plan_update',
  BUDDY_ASSIGNMENT: 'buddy_assignment',
  PROGRESS_UPDATE: 'progress_update',
  SYSTEM_ALERT: 'system_alert'
}

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical'
}

// Notification status
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  ACKNOWLEDGED: 'acknowledged',
  EXPIRED: 'expired'
}

class NotificationService {
  constructor() {
    this.subscribers = new Map()
    this.notificationQueue = []
    this.isProcessing = false
  }

  // Subscribe to notifications
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, [])
    }
    this.subscribers.get(userId).push(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(userId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Unsubscribe from notifications
  unsubscribe(userId, callback) {
    const callbacks = this.subscribers.get(userId)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notification = {
        id: Date.now().toString(),
        type: notificationData.type || NOTIFICATION_TYPES.SYSTEM_ALERT,
        priority: notificationData.priority || PRIORITY_LEVELS.MEDIUM,
        title: notificationData.title,
        message: notificationData.message,
        recipientId: notificationData.recipientId,
        senderId: notificationData.senderId,
        relatedEntity: notificationData.relatedEntity || null,
        metadata: notificationData.metadata || {},
        status: NOTIFICATION_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        scheduledFor: notificationData.scheduledFor || new Date().toISOString(),
        expiresAt: notificationData.expiresAt || null,
        requiresAcknowledgment: notificationData.requiresAcknowledgment || false,
        acknowledgedBy: [],
        readBy: []
      }

      // Save to database
      const result = await dbService.create('notifications', notification)
      
      if (result.success) {
        // Add to local queue for immediate processing
        this.notificationQueue.push(notification)
        this.processNotificationQueue()
        
        // Notify subscribers
        this.notifySubscribers(notification.recipientId, notification)
        
        return { success: true, notification }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Process notification queue
  async processNotificationQueue() {
    if (this.isProcessing || this.notificationQueue.length === 0) return
    
    this.isProcessing = true
    
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift()
      
      try {
        // Check if notification should be sent now
        if (new Date(notification.scheduledFor) <= new Date()) {
          await this.sendNotification(notification)
        } else {
          // Schedule for later
          setTimeout(() => {
            this.sendNotification(notification)
          }, new Date(notification.scheduledFor).getTime() - Date.now())
        }
      } catch (error) {
        console.error('Error processing notification:', error)
      }
    }
    
    this.isProcessing = false
  }

  // Send notification to recipient
  async sendNotification(notification) {
    try {
      // Update status to sent
      await dbService.update('notifications', notification.id, {
        status: NOTIFICATION_STATUS.SENT,
        sentAt: new Date().toISOString()
      })

      // Show toast notification
      if (notification.priority === PRIORITY_LEVELS.CRITICAL || notification.priority === PRIORITY_LEVELS.URGENT) {
        toast.error(notification.message, {
          duration: 10000,
          position: 'top-center'
        })
      } else if (notification.priority === PRIORITY_LEVELS.HIGH) {
        toast(notification.message, {
          duration: 8000,
          position: 'top-right'
        })
      } else {
        toast.success(notification.message, {
          duration: 5000,
          position: 'top-right'
        })
      }

      // Notify subscribers
      this.notifySubscribers(notification.recipientId, notification)
      
      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Notify subscribers
  notifySubscribers(userId, notification) {
    const callbacks = this.subscribers.get(userId)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(notification)
        } catch (error) {
          console.error('Error in notification callback:', error)
        }
      })
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const result = await dbService.read('notifications', notificationId)
      if (result.success) {
        const notification = result.data
        const readBy = notification.readBy || []
        
        if (!readBy.includes(userId)) {
          readBy.push(userId)
          
          await dbService.update('notifications', notificationId, {
            readBy,
            status: readBy.length > 0 ? NOTIFICATION_STATUS.READ : notification.status
          })
        }
        
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error: error.message }
    }
  }

  // Acknowledge notification
  async acknowledgeNotification(notificationId, userId) {
    try {
      const result = await dbService.read('notifications', notificationId)
      if (result.success) {
        const notification = result.data
        const acknowledgedBy = notification.acknowledgedBy || []
        
        if (!acknowledgedBy.includes(userId)) {
          acknowledgedBy.push(userId)
          
          await dbService.update('notifications', notificationId, {
            acknowledgedBy,
            status: NOTIFICATION_STATUS.ACKNOWLEDGED
          })
        }
        
        return { success: true }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error acknowledging notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      const queryFilters = [
        { field: 'recipientId', operator: '==', value: userId }
      ]

      if (filters.status) {
        queryFilters.push({ field: 'status', operator: '==', value: filters.status })
      }

      if (filters.type) {
        queryFilters.push({ field: 'type', operator: '==', value: filters.type })
      }

      if (filters.priority) {
        queryFilters.push({ field: 'priority', operator: '==', value: filters.priority })
      }

      const result = await dbService.query('notifications', queryFilters, {
        field: 'createdAt',
        direction: 'desc'
      })

      return result
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return { success: false, error: error.message }
    }
  }

  // Create reminder notification
  async createReminder(reminderData) {
    const { patientId, assignedBuddy, assignedNurse, sessionTime, type, message } = reminderData
    
    // Calculate reminder time (10 minutes before session)
    const reminderTime = new Date(sessionTime)
    reminderTime.setMinutes(reminderTime.getMinutes() - 10)
    
    // Create reminder for buddy
    if (assignedBuddy) {
      await this.createNotification({
        type: NOTIFICATION_TYPES.REMINDER,
        priority: PRIORITY_LEVELS.MEDIUM,
        title: 'Session Reminder',
        message: `You have a ${type} session with patient in 10 minutes. ${message}`,
        recipientId: assignedBuddy,
        senderId: 'system',
        relatedEntity: { type: 'session', id: patientId },
        scheduledFor: reminderTime.toISOString(),
        requiresAcknowledgment: true,
        metadata: {
          sessionTime,
          patientId,
          sessionType: type
        }
      })
    }

    // Create reminder for nurse
    if (assignedNurse) {
      await this.createNotification({
        type: NOTIFICATION_TYPES.REMINDER,
        priority: PRIORITY_LEVELS.MEDIUM,
        title: 'Session Reminder',
        message: `Buddy has a ${type} session with patient in 10 minutes. ${message}`,
        recipientId: assignedNurse,
        senderId: 'system',
        relatedEntity: { type: 'session', id: patientId },
        scheduledFor: reminderTime.toISOString(),
        requiresAcknowledgment: true,
        metadata: {
          sessionTime,
          patientId,
          sessionType: type
        }
      })
    }
  }

  // Create emergency alert
  async createEmergencyAlert(emergencyData) {
    const { 
      patientId, 
      patientName,
      assignedDoctor, 
      assignedNurse, 
      assignedBuddy, 
      type, 
      severity, 
      description, 
      location 
    } = emergencyData
    
    const priority = severity === 'critical' ? PRIORITY_LEVELS.CRITICAL : 
                    severity === 'high' ? PRIORITY_LEVELS.URGENT : 
                    PRIORITY_LEVELS.HIGH

    // Create emergency alert for all assigned staff (doctor, nurse, and buddy)
    const recipients = [assignedDoctor, assignedNurse, assignedBuddy].filter(Boolean)
    
    // Send in-app notifications to assigned staff
    for (const recipientId of recipients) {
      await this.createNotification({
        type: NOTIFICATION_TYPES.EMERGENCY,
        priority,
        title: 'Emergency Alert',
        message: `EMERGENCY: ${type} - ${description}. Patient: ${patientName}. Location: ${location}`,
        recipientId,
        senderId: 'system',
        relatedEntity: { type: 'emergency', id: patientId },
        requiresAcknowledgment: true,
        metadata: {
          emergencyType: type,
          severity,
          patientId,
          patientName,
          location,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Also create a confirmation notification for the patient who triggered the emergency
    await this.createNotification({
      type: NOTIFICATION_TYPES.EMERGENCY,
      priority: PRIORITY_LEVELS.MEDIUM, // Lower priority for patient confirmation
      title: 'Emergency Alert Sent',
      message: `Your emergency alert has been sent to ${recipients.length} assigned medical staff members. They have been notified and will respond shortly.`,
      recipientId: patientId, // Notify the patient
      senderId: 'system',
      relatedEntity: { type: 'emergency', id: patientId },
      requiresAcknowledgment: false, // Patient doesn't need to acknowledge
      metadata: {
        emergencyType: type,
        severity,
        patientId,
        patientName,
        location,
        timestamp: new Date().toISOString(),
        staffNotified: recipients.length
      }
    })

    // Send emergency emails to all assigned staff
    try {
      const emailResult = await emailService.sendEmergencyEmail({
        patientId,
        patientName,
        assignedDoctor,
        assignedNurse,
        assignedBuddy,
        severity,
        description,
        location,
        timestamp: new Date().toISOString()
      })

      if (emailResult.success) {
        console.log(`Emergency emails sent successfully: ${emailResult.successful}/${emailResult.recipients}`)
      } else {
        console.error('Failed to send emergency emails:', emailResult.error)
      }
    } catch (error) {
      console.error('Error sending emergency emails:', error)
    }

    // Show critical emergency toast
    if (priority === PRIORITY_LEVELS.CRITICAL) {
      toast.error('🚨 CRITICAL EMERGENCY ALERT 🚨', {
        duration: 0,
        position: 'top-center',
        style: {
          background: '#d32f2f',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
    }
  }

  // Send assignment notification emails
  async sendAssignmentNotificationEmails(assignmentData) {
    try {
      const { 
        patientId, 
        patientName, 
        assignedDoctor, 
        assignedNurse, 
        assignedBuddy, 
        assignmentType 
      } = assignmentData

      // Send assignment emails
      const emailResult = await emailService.sendAssignmentEmails({
        patientId,
        patientName,
        assignedDoctor,
        assignedNurse,
        assignedBuddy,
        assignmentType
      })

      if (emailResult.success) {
        console.log(`Assignment emails sent successfully: ${emailResult.successful}/${emailResult.recipients}`)
      } else {
        console.error('Failed to send assignment emails:', emailResult.error)
      }

      return emailResult
    } catch (error) {
      console.error('Error sending assignment notification emails:', error)
      return { success: false, error: error.message }
    }
  }

  // GPS tracking and proximity alerts
  async checkProximityAndAvailability(buddyId, patientId, sessionLocation) {
    try {
      // This would integrate with actual GPS services
      // For now, we'll simulate proximity checking
      
      const buddyLocation = await this.getUserLocation(buddyId)
      const patientLocation = await this.getUserLocation(patientId)
      
      if (buddyLocation && patientLocation) {
        const distance = this.calculateDistance(buddyLocation, patientLocation)
        const isNearby = distance <= 5 // 5 km radius
        
        if (isNearby) {
          // Buddy is nearby, create proximity notification
          await this.createNotification({
            type: NOTIFICATION_TYPES.SYSTEM_ALERT,
            priority: PRIORITY_LEVELS.LOW,
            title: 'Proximity Alert',
            message: 'Medical Buddy is in proximity for scheduled session',
            recipientId: buddyId,
            senderId: 'system',
            relatedEntity: { type: 'session', id: patientId },
            metadata: {
              distance: distance.toFixed(2),
              patientId,
              sessionLocation
            }
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error checking proximity:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user location (simulated)
  async getUserLocation(userId) {
    // This would integrate with actual GPS tracking
    // For now, return simulated coordinates
    return {
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
      timestamp: new Date().toISOString()
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(coord1, coord2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude)
    const dLon = this.toRadians(coord2.longitude - coord1.longitude)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const now = new Date().toISOString()
      const result = await dbService.query('notifications', [
        { field: 'expiresAt', operator: '<', value: now },
        { field: 'status', operator: '!=', value: NOTIFICATION_STATUS.EXPIRED }
      ])

      if (result.success) {
        for (const notification of result.data) {
          await dbService.update('notifications', notification.id, {
            status: NOTIFICATION_STATUS.EXPIRED
          })
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error)
      return { success: false, error: error.message }
    }
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      const result = await this.getUserNotifications(userId)
      
      if (result.success) {
        const notifications = result.data
        
        const stats = {
          total: notifications.length,
          unread: notifications.filter(n => !n.readBy?.includes(userId)).length,
          unacknowledged: notifications.filter(n => n.requiresAcknowledgment && !n.acknowledgedBy?.includes(userId)).length,
          byType: {},
          byPriority: {}
        }

        // Count by type
        notifications.forEach(n => {
          stats.byType[n.type] = (stats.byType[n.type] || 0) + 1
          stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1
        })

        return { success: true, stats }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error getting notification stats:', error)
      return { success: false, error: error.message }
    }
  }

  // Get notification counts for display (simplified version)
  async getNotificationCounts(userId) {
    try {
      const result = await this.getUserNotifications(userId)
      
      if (result.success) {
        const notifications = result.data
        
        return {
          success: true,
          counts: {
            total: notifications.length,
            unread: notifications.filter(n => !n.readBy?.includes(userId)).length,
            pending: notifications.filter(n => n.status === NOTIFICATION_STATUS.PENDING).length,
            emergency: notifications.filter(n => n.type === NOTIFICATION_TYPES.EMERGENCY).length
          }
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error getting notification counts:', error)
      return { success: false, error: error.message }
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService()

// Clean up expired notifications every hour
setInterval(() => {
  notificationService.cleanupExpiredNotifications()
}, 60 * 60 * 1000)

export default notificationService
