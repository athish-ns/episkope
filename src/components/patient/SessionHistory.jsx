import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Avatar,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  CalendarToday,
  AccessTime,
  Person,
  Star,
  TrendingUp,
  Assignment,
  CheckCircle,
  Schedule,
  EmojiEvents,
  Psychology,
  FitnessCenter,
  RateReview
} from '@mui/icons-material'
import useStore from '../../store'
import BuddyRating from './BuddyRating'

const SessionHistory = () => {
  const { user, sessions, users } = useStore()
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  
  const patientSessions = sessions.filter(s => s.patientId === user?.id)
  
  const getBuddyName = (buddyId) => {
    const buddy = users.find(u => u.id === buddyId)
    return buddy ? buddy.name : 'Unknown Buddy'
  }

  const getSessionStatus = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'success', icon: <CheckCircle />, label: 'Completed' }
      case 'in-progress':
        return { color: 'warning', icon: <Schedule />, label: 'In Progress' }
      case 'scheduled':
        return { color: 'info', icon: <CalendarToday />, label: 'Scheduled' }
      default:
        return { color: 'default', icon: <CalendarToday />, label: 'Unknown' }
    }
  }

  const handleOpenRating = (session) => {
    setSelectedSession(session)
    setRatingDialogOpen(true)
  }

  const handleCloseRating = () => {
    setRatingDialogOpen(false)
    setSelectedSession(null)
  }

  const handleRatingSubmitted = (ratingData) => {
    // Refresh the component or update local state if needed
    console.log('Rating submitted:', ratingData)
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'physical':
        return <FitnessCenter color="primary" />
      case 'speech':
        return <Psychology color="secondary" />
      case 'cognitive':
        return <Assignment color="success" />
      default:
        return <Assignment color="info" />
    }
  }

  const getSessionTypeColor = (type) => {
    switch (type) {
      case 'physical':
        return 'primary'
      case 'speech':
        return 'secondary'
      case 'cognitive':
        return 'success'
      default:
        return 'info'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Session History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your rehabilitation journey through detailed session records
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <CalendarToday sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {patientSessions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'success.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <CheckCircle sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {patientSessions.filter(s => s.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'warning.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <Star sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {patientSessions.length > 0 
                  ? (patientSessions.reduce((sum, s) => sum + (s.patientRating || 0), 0) / patientSessions.length).toFixed(1)
                  : '0'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Rating
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'info.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <TrendingUp sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {patientSessions.filter(s => s.progressImprovement > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress Made
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Session List */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Recent Sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your latest rehabilitation sessions and progress updates
            </Typography>
          </Box>
          
          {patientSessions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'grey.200', 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2 
              }}>
                <CalendarToday sx={{ fontSize: 40, color: 'grey.500' }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No sessions yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your session history will appear here once you start your rehabilitation program.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {patientSessions.map((session, index) => {
                const status = getSessionStatus(session.status)
                return (
                  <React.Fragment key={session.id}>
                    <ListItem sx={{ 
                      p: 3,
                      '&:hover': {
                        bgcolor: 'grey.50',
                      },
                      transition: 'background-color 0.2s ease-in-out'
                    }}>
                      <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 3 }}>
                        {/* Session Icon */}
                        <Avatar sx={{ 
                          bgcolor: `${getSessionTypeColor(session.type)}.main`,
                          width: 56,
                          height: 56,
                          mt: 1
                        }}>
                          {getSessionTypeIcon(session.type)}
                        </Avatar>
                        
                        {/* Session Details */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {session.title || `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Therapy Session`}
                            </Typography>
                            <Chip
                              icon={status.icon}
                              label={status.label}
                              color={status.color}
                              size="small"
                              sx={{ fontWeight: 500 }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(session.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {formatTime(session.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {getBuddyName(session.buddyId)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {session.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {session.notes}
                            </Typography>
                          )}
                          
                          {/* Progress and Rating */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {session.progressImprovement !== undefined && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUp fontSize="small" color="success" />
                                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                                  +{session.progressImprovement}% improvement
                                </Typography>
                              </Box>
                            )}
                            
                            {session.patientRating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Star fontSize="small" color="warning" />
                                <Rating 
                                  value={session.patientRating} 
                                  readOnly 
                                  size="small"
                                  sx={{ '& .MuiRating-iconFilled': { color: 'warning.main' } }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  ({session.patientRating}/5)
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                        
                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {session.status === 'completed' && !session.patientRating && (
                            <Tooltip title="Rate this session">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<RateReview />}
                                onClick={() => handleOpenRating(session)}
                                sx={{ 
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  bgcolor: 'warning.main',
                                  '&:hover': { bgcolor: 'warning.dark' }
                                }}
                              >
                                Rate Session
                              </Button>
                            </Tooltip>
                          )}
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: 600
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < patientSessions.length - 1 && (
                      <Divider sx={{ mx: 3 }} />
                    )}
                  </React.Fragment>
                )
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <BuddyRating
        session={selectedSession}
        open={ratingDialogOpen}
        onClose={handleCloseRating}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </Box>
  )
}

export default SessionHistory 