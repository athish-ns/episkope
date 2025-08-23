import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Rating,
  Divider
} from '@mui/material'
import {
  Assessment,
  Person,
  Group,
  Star,
  Visibility,
  Comment,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const SessionReviews = () => {
  const { profile } = useAuthStore()
  const { patients, users, sessions, updateSession, updateUser, loadUsers, loadPatients, loadSessions } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    // Load data when component mounts
    loadUsers()
    loadPatients()
    loadSessions()
  }, [])

  const assignedPatients = (patients || []).filter(p => p.assignedDoctor === profile?.uid)
  const doctorSessions = (sessions || []).filter(s => 
    assignedPatients.some(p => p.id === s.patientId)
  )

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      toast.error('Please provide feedback')
      return
    }

    // Add doctor feedback to session
    updateSession(selectedSession.id, { 
      doctorFeedback: feedback,
      doctorFeedbackDate: new Date().toISOString()
    })

    // Add feedback to buddy's record
    const buddy = users.find(u => u.id === selectedSession.buddyId)
    if (buddy) {
      const newFeedback = {
        from: profile.uid,
        positive: feedback.toLowerCase().includes('good') || feedback.toLowerCase().includes('excellent'),
        comment: feedback,
        date: new Date().toISOString()
      }
      
      const updatedFeedback = [...(buddy.feedback || []), newFeedback]
      updateUser(buddy.id, { feedback: updatedFeedback })
    }

    toast.success('Feedback submitted successfully')
    handleClose()
  }

  const handleViewSession = (session) => {
    setSelectedSession(session)
    setFeedback(session.doctorFeedback || '')
    setOpenDialog(true)
  }

  const handleClose = () => {
    setOpenDialog(false)
    setSelectedSession(null)
    setFeedback('')
  }

  const getSessionDetails = (session) => {
    const patient = (patients || []).find(p => p.id === session.patientId)
    const buddy = (users || []).find(u => u.id === session.buddyId)
    const nurse = (users || []).find(u => u.id === session.nurseId)
    
    return { patient, buddy, nurse }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 3.5) return 'warning'
    return 'error'
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Session Reviews
      </Typography>

      <Grid container spacing={3}>
        {doctorSessions.map((session) => {
          const details = getSessionDetails(session)
          return (
            <Grid item xs={12} md={6} key={session.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {details.patient?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(session.date).toLocaleDateString()} • {session.duration} min
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton onClick={() => handleViewSession(session)}>
                      <Visibility />
                    </IconButton>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Care Team
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Nurse: ${details.nurse?.name}`} 
                        size="small" 
                        color="secondary"
                      />
                      <Chip 
                        label={`Buddy: ${details.buddy?.name} (${details.buddy?.tier})`} 
                        size="small" 
                        color={details.buddy?.tier === 'Gold' ? 'warning' : details.buddy?.tier === 'Silver' ? 'default' : 'error'}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Activities
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(session.activities || []).map((activity, index) => (
                        <Chip key={index} label={activity} size="small" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Patient Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={session.patientRating} readOnly size="small" />
                      <Chip 
                        label={`${session.patientRating}/5`} 
                        size="small" 
                        color={getRatingColor(session.patientRating)}
                      />
                    </Box>
                    {session.patientFeedback && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        "{session.patientFeedback}"
                      </Typography>
                    )}
                  </Box>

                  {session.doctorFeedback && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Your Feedback
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.doctorFeedback}
                      </Typography>
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
          Session Review - {selectedSession && getSessionDetails(selectedSession).patient?.name}
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Session Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date" 
                        secondary={new Date(selectedSession.date).toLocaleDateString()} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Patient" 
                        secondary={getSessionDetails(selectedSession).patient?.name} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Group />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Medical Buddy" 
                        secondary={`${getSessionDetails(selectedSession).buddy?.name} (${getSessionDetails(selectedSession).buddy?.tier})`} 
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Activities Performed
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {(selectedSession.activities || []).map((activity, index) => (
                      <Chip key={index} label={activity} />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Buddy Report
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        {selectedSession.buddyReport}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Nurse Notes
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        {selectedSession.nurseNotes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Patient Feedback
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Rating value={selectedSession.patientRating} readOnly />
                    <Chip 
                      label={`${selectedSession.patientRating}/5`} 
                      color={getRatingColor(selectedSession.patientRating)}
                    />
                  </Box>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        "{selectedSession.patientFeedback}"
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Your Feedback
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Provide feedback for the Medical Buddy"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Comment on the session quality, buddy performance, areas for improvement..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmitFeedback} variant="contained">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SessionReviews 