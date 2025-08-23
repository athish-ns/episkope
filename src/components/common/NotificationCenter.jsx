import React, { useState, useEffect } from 'react'
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material'
import {
  Notifications,
  NotificationsActive,
  NotificationsNone,
  CheckCircle,
  Warning,
  Error,
  Info,
  Schedule,
  ReportProblem,
  Assignment,
  LocalHospital,
  Psychology,
  FitnessCenter,
  Star,
  TrendingUp,
  Close,
  Refresh,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material'
import notificationService, { 
  NOTIFICATION_TYPES, 
  PRIORITY_LEVELS, 
  NOTIFICATION_STATUS 
} from '../../services/notificationService'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const NotificationCenter = () => {
  const { profile } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    unacknowledged: 0
  })

  const open = Boolean(anchorEl)

  useEffect(() => {
    if (profile?.uid) {
      loadNotifications()
      loadStats()
      
      // Subscribe to real-time notifications
      const unsubscribe = notificationService.subscribe(profile.uid, handleNewNotification)
      
      return () => {
        unsubscribe()
      }
    }
  }, [profile?.uid])

  const loadNotifications = async () => {
    if (!profile?.uid) return
    
    setLoading(true)
    try {
      const result = await notificationService.getUserNotifications(profile.uid)
      if (result.success) {
        setNotifications(result.data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!profile?.uid) return
    
    try {
      const result = await notificationService.getNotificationStats(profile.uid)
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error loading notification stats:', error)
    }
  }

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev])
    loadStats()
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId, profile.uid)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, readBy: [...(n.readBy || []), profile.uid] }
              : n
          )
        )
        loadStats()
        toast.success('Notification marked as read')
      }
    } catch (error) {
      toast.error('Error marking notification as read')
    }
  }

  const handleAcknowledge = async (notificationId) => {
    try {
      const result = await notificationService.acknowledgeNotification(notificationId, profile.uid)
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, acknowledgedBy: [...(n.acknowledgedBy || []), profile.uid] }
              : n
          )
        )
        loadStats()
        toast.success('Notification acknowledged')
      }
    } catch (error) {
      toast.error('Error acknowledging notification')
    }
  }

  const handleDelete = async (notificationId) => {
    try {
      // This would typically delete from database
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      loadStats()
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Error deleting notification')
    }
  }

  const getNotificationIcon = (type, priority) => {
    if (priority === PRIORITY_LEVELS.CRITICAL || priority === PRIORITY_LEVELS.URGENT) {
      return <ReportProblem color="error" />
    }
    
    switch (type) {
          case NOTIFICATION_TYPES.EMERGENCY:
      return <ReportProblem color="error" />
      case NOTIFICATION_TYPES.REMINDER:
        return <Schedule color="warning" />
      case NOTIFICATION_TYPES.SESSION_UPDATE:
        return <Assignment color="info" />
      case NOTIFICATION_TYPES.CARE_PLAN_UPDATE:
        return <LocalHospital color="primary" />
      case NOTIFICATION_TYPES.BUDDY_ASSIGNMENT:
        return <Psychology color="secondary" />
      case NOTIFICATION_TYPES.PROGRESS_UPDATE:
        return <TrendingUp color="success" />
      default:
        return <Info color="default" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL:
        return 'error'
      case PRIORITY_LEVELS.URGENT:
        return 'error'
      case PRIORITY_LEVELS.HIGH:
        return 'warning'
      case PRIORITY_LEVELS.MEDIUM:
        return 'info'
      case PRIORITY_LEVELS.LOW:
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case NOTIFICATION_STATUS.READ:
        return 'success'
      case NOTIFICATION_STATUS.ACKNOWLEDGED:
        return 'info'
      case NOTIFICATION_STATUS.PENDING:
        return 'warning'
      case NOTIFICATION_STATUS.EXPIRED:
        return 'default'
      default:
        return 'default'
    }
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return notificationTime.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 0: // All
        return true
      case 1: // Unread
        return !notification.readBy?.includes(profile?.uid)
      case 2: // Unacknowledged
        return notification.requiresAcknowledgment && 
               !notification.acknowledgedBy?.includes(profile?.uid)
      case 3: // Emergency
        return notification.type === NOTIFICATION_TYPES.EMERGENCY
      default:
        return true
    }
  })

  const renderNotificationItem = (notification) => {
    const isRead = notification.readBy?.includes(profile?.uid)
    const isAcknowledged = notification.acknowledgedBy?.includes(profile?.uid)
    
    return (
      <ListItem
        key={notification.id}
        sx={{
          bgcolor: isRead ? 'transparent' : 'action.hover',
          borderLeft: `4px solid ${
            notification.priority === PRIORITY_LEVELS.CRITICAL || 
            notification.priority === PRIORITY_LEVELS.URGENT
              ? 'error.main'
              : notification.priority === PRIORITY_LEVELS.HIGH
              ? 'warning.main'
              : 'info.main'
          }`,
          mb: 1,
          borderRadius: 1
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'transparent' }}>
            {getNotificationIcon(notification.type, notification.priority)}
          </Avatar>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: isRead ? 'normal' : 'bold',
                  color: isRead ? 'text.secondary' : 'text.primary'
                }}
              >
                {notification.title}
              </Typography>
              <Chip
                label={notification.priority}
                size="small"
                color={getPriorityColor(notification.priority)}
                variant="outlined"
              />
              <Chip
                label={notification.status}
                size="small"
                color={getStatusColor(notification.status)}
                variant="outlined"
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: isRead ? 'text.secondary' : 'text.primary',
                  mb: 1
                }}
              >
                {notification.message}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(notification.createdAt)}
                </Typography>
                {notification.metadata?.location && (
                  <Typography variant="caption" color="text.secondary">
                    • {notification.metadata.location}
                  </Typography>
                )}
              </Box>
            </Box>
          }
        />
        
        <ListItemSecondaryAction>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {!isRead && (
              <Tooltip title="Mark as read">
                <IconButton
                  size="small"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <MarkEmailRead />
                </IconButton>
              </Tooltip>
            )}
            
            {notification.requiresAcknowledgment && !isAcknowledged && (
              <Tooltip title="Acknowledge">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleAcknowledge(notification.id)}
                >
                  <CheckCircle />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(notification.id)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  const renderTabContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (filteredNotifications.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {activeTab === 0 ? 'No notifications' :
             activeTab === 1 ? 'No unread notifications' :
             activeTab === 2 ? 'No unacknowledged notifications' :
             'No emergency notifications'}
          </Typography>
        </Box>
      )
    }

    return (
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredNotifications.map(renderNotificationItem)}
      </List>
    )
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ ml: 1 }}
        >
          <Badge badgeContent={stats.unread} color="error">
            {stats.unread > 0 ? <NotificationsActive /> : <Notifications />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { width: 400, maxHeight: 600 }
        }}
      >
        <Card>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box sx={{ 
              p: 2, 
              borderBottom: 1, 
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                Notifications
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={loadNotifications}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Close">
                  <IconButton size="small" onClick={handleClose}>
                    <Close />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Stats */}
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {stats.unread}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Unread
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="info.main">
                    {stats.unacknowledged}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth">
                <Tab label="All" />
                <Tab label="Unread" />
                <Tab label="Pending" />
                <Tab label="Emergency" />
              </Tabs>
            </Box>

            {/* Content */}
            <Box sx={{ p: 0 }}>
              {renderTabContent()}
            </Box>

            {/* Footer */}
            {notifications.length > 0 && (
              <Box sx={{ 
                p: 2, 
                borderTop: 1, 
                borderColor: 'divider',
                textAlign: 'center'
              }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadNotifications}
                  startIcon={<Refresh />}
                >
                  Refresh
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Popover>
    </>
  )
}

export default NotificationCenter
