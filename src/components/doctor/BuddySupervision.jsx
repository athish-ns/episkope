import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  Person,
  Star,
  Assessment,
  TrendingUp,
  TrendingDown,
  Comment,
  Visibility
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const BuddySupervision = () => {
  const { profile } = useAuthStore()
  const { patients, users, sessions, updateUser, loadUsers, loadPatients, loadSessions } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBuddy, setSelectedBuddy] = useState(null)
  const [evaluation, setEvaluation] = useState('')

  useEffect(() => {
    // Load data when component mounts
    loadUsers()
    loadPatients()
    loadSessions()
  }, [])

  const assignedPatients = (patients || []).filter(p => p.assignedDoctor === profile?.uid)
  const assignedBuddies = (users || []).filter(u => 
    u.role === 'Medical Buddy' && 
    assignedPatients.some(p => p.assignedBuddy === u.id)
  )

  const getBuddyStats = (buddyId) => {
    const buddySessions = (sessions || []).filter(s => s.buddyId === buddyId)
    const ratings = buddySessions.map(s => s.patientRating).filter(r => r)
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : 0
    
    const assignedPatientsCount = assignedPatients.filter(p => p.assignedBuddy === buddyId).length
    const recentSessions = buddySessions.slice(-5)
    
    return {
      totalSessions: buddySessions.length,
      avgRating: parseFloat(avgRating),
      assignedPatients: assignedPatientsCount,
      recentSessions,
      ratings
    }
  }

  const handleSubmitEvaluation = () => {
    if (!evaluation.trim()) {
      toast.error('Please provide evaluation feedback')
      return
    }

    const newFeedback = {
      from: profile.uid,
      positive: evaluation.toLowerCase().includes('good') || evaluation.toLowerCase().includes('excellent'),
      comment: evaluation,
      date: new Date().toISOString()
    }

    const updatedFeedback = [...(selectedBuddy.feedback || []), newFeedback]
    updateUser(selectedBuddy.id, { feedback: updatedFeedback })

    toast.success('Evaluation submitted successfully')
    handleClose()
  }

  const handleViewBuddy = (buddy) => {
    setSelectedBuddy(buddy)
    setEvaluation('')
    setOpenDialog(true)
  }

  const handleClose = () => {
    setOpenDialog(false)
    setSelectedBuddy(null)
    setEvaluation('')
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold':
        return 'warning'
      case 'Silver':
        return 'default'
      case 'Bronze':
        return 'error'
      default:
        return 'default'
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 3.5) return 'warning'
    return 'error'
  }

  const getPerformanceTrend = (buddy) => {
    const stats = getBuddyStats(buddy.id)
    if (stats.avgRating >= 4.5) return { trend: 'up', color: 'success', text: 'Excellent' }
    if (stats.avgRating >= 4.0) return { trend: 'up', color: 'warning', text: 'Good' }
    if (stats.avgRating >= 3.0) return { trend: 'down', color: 'warning', text: 'Needs Improvement' }
    return { trend: 'down', color: 'error', text: 'Poor' }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medical Buddy Supervision
      </Typography>

      <Grid container spacing={3}>
        {assignedBuddies.map((buddy) => {
          const stats = getBuddyStats(buddy.id)
          const performance = getPerformanceTrend(buddy)
          
          return (
            <Grid item xs={12} md={6} key={buddy.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {buddy.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={buddy.tier} 
                            size="small" 
                            color={getTierColor(buddy.tier)}
                          />
                          <Chip 
                            label={performance.text} 
                            size="small" 
                            color={performance.color}
                            icon={performance.trend === 'up' ? <TrendingUp /> : <TrendingDown />}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewBuddy(buddy)}
                    >
                      Evaluate
                    </Button>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {stats.totalSessions}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sessions
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary">
                          {stats.assignedPatients}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Patients
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Star fontSize="small" color="warning" />
                          <Typography variant="h4" color="warning.main">
                            {stats.avgRating}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Avg Rating
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Performance Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={stats.avgRating} readOnly size="small" />
                      <Chip 
                        label={`${stats.avgRating}/5`} 
                        size="small" 
                        color={getRatingColor(stats.avgRating)}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.avgRating / 5) * 100} 
                      color={getRatingColor(stats.avgRating)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {(buddy.feedback || []).length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Feedback
                      </Typography>
                      <List dense>
                        {(buddy.feedback || []).slice(-2).map((feedback, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <Comment fontSize="small" color={feedback.positive ? 'success' : 'error'} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feedback.comment}
                              secondary={new Date(feedback.date).toLocaleDateString()}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Evaluate Medical Buddy - {selectedBuddy?.name}
        </DialogTitle>
        <DialogContent>
          {selectedBuddy && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Buddy Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Name" 
                        secondary={selectedBuddy.name} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Star />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Current Tier" 
                        secondary={selectedBuddy.tier} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Total Sessions" 
                        secondary={getBuddyStats(selectedBuddy.id).totalSessions} 
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Performance Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="primary">
                          {getBuddyStats(selectedBuddy.id).avgRating}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Average Rating
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="h4" color="secondary">
                          {getBuddyStats(selectedBuddy.id).assignedPatients}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Assigned Patients
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Recent Sessions
                  </Typography>
                  <List dense>
                    {getBuddyStats(selectedBuddy.id).recentSessions.map((session, index) => {
                      const patient = (patients || []).find(p => p.id === session.patientId)
                      return (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Assessment />
                          </ListItemIcon>
                          <ListItemText 
                            primary={patient?.name}
                            secondary={`${new Date(session.date).toLocaleDateString()} - Rating: ${session.patientRating}/5`}
                          />
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Evaluation Feedback
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Provide evaluation feedback"
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value)}
                    placeholder="Comment on performance, areas for improvement, strengths..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitEvaluation} variant="contained">
            Submit Evaluation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BuddySupervision 