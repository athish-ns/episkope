import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material'
import {
  Person,
  Warning,
  CheckCircle,
  Error,
  Flag,
  Visibility,
  ThumbUp,
  ThumbDown,
  Comment,
  Schedule,
  Star
} from '@mui/icons-material'
import useStore from '../../store'
import toast from 'react-hot-toast'

const LogVerification = () => {
  const { user, users, patients, sessions, updateSession, addSession } = useStore()
  const [openFlagDialog, setOpenFlagDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [flagReason, setFlagReason] = useState('')
  const [flagSeverity, setFlagSeverity] = useState('medium')

  // Get patients assigned to current nurse
  const assignedPatients = patients.filter(p => p.assignedNurse === user?.id)
  
  // Get sessions for assigned patients
  const assignedSessions = sessions.filter(s => 
    assignedPatients.some(p => p.id === s.patientId)
  )

  // Get sessions that need verification (no nurse verification yet)
  const pendingVerification = assignedSessions.filter(s => !s.nurseVerified)
  
  // Get flagged sessions
  const flaggedSessions = assignedSessions.filter(s => s.redFlag)

  const getBuddyInfo = (buddyId) => {
    return users.find(u => u.id === buddyId)
  }

  const getPatientInfo = (patientId) => {
    return patients.find(p => p.id === patientId)
  }

  const handleVerifySession = (session, verified) => {
    const updates = {
      nurseVerified: true,
      nurseVerificationDate: new Date().toISOString(),
      nurseNotes: verified ? 'Session verified and approved' : 'Session requires attention'
    }
    
    updateSession(session.id, updates)
    toast.success(`Session ${verified ? 'verified' : 'flagged'} successfully`)
  }

  const handleRaiseFlag = () => {
    if (!flagReason.trim()) {
      toast.error('Please provide a reason for the flag')
      return
    }

    const updates = {
      redFlag: true,
      flagReason: flagReason,
      flagSeverity: flagSeverity,
              flagRaisedBy: user.id,
      flagDate: new Date().toISOString(),
      nurseVerified: false
    }
    
    updateSession(selectedSession.id, updates)
    toast.success('Red flag raised successfully')
    setOpenFlagDialog(false)
    setSelectedSession(null)
    setFlagReason('')
    setFlagSeverity('medium')
  }

  const handleOpenFlagDialog = (session) => {
    setSelectedSession(session)
    setOpenFlagDialog(true)
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'info'
      default:
        return 'default'
    }
  }

  const getSessionStatus = (session) => {
    if (session.redFlag) return { status: 'flagged', color: 'error', text: 'Flagged' }
    if (session.nurseVerified) return { status: 'verified', color: 'success', text: 'Verified' }
    return { status: 'pending', color: 'warning', text: 'Pending' }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Log Verification & Red Flags
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Verify buddy session logs, approve reports, and raise red flags for concerning issues.
      </Typography>

      {/* Alerts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {pendingVerification.length > 0 && (
          <Grid item xs={12} md={6}>
            <Alert severity="warning" icon={<Schedule />}>
              {pendingVerification.length} session(s) pending verification
            </Alert>
          </Grid>
        )}
        {flaggedSessions.length > 0 && (
          <Grid item xs={12} md={6}>
            <Alert severity="error" icon={<Flag />}>
              {flaggedSessions.length} session(s) with red flags
            </Alert>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Verification */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Verification ({pendingVerification.length})
              </Typography>
              
              {pendingVerification.length === 0 ? (
                <Alert severity="success">
                  All sessions have been verified!
                </Alert>
              ) : (
                <List>
                  {pendingVerification.map((session) => {
                    const buddy = getBuddyInfo(session.buddyId)
                    const patient = getPatientInfo(session.patientId)
                    const status = getSessionStatus(session)
                    
                    return (
                      <ListItem 
                        key={session.id}
                        sx={{ 
                          border: 1, 
                          borderColor: 'grey.300', 
                          borderRadius: 1, 
                          mb: 2,
                          flexDirection: 'column',
                          alignItems: 'stretch'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="medium">
                                {patient?.name} - {buddy?.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(session.date).toLocaleDateString()} • {session.duration} min
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label={status.text} 
                            size="small" 
                            color={status.color}
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Activities Completed:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {session.activities.map((activity, index) => (
                              <Chip key={index} label={activity} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Buddy Report:
                          </Typography>
                          <Typography variant="body2" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                            {session.buddyReport}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star fontSize="small" color="warning" />
                            <Typography variant="body2">
                              Patient Rating: {session.patientRating}/5
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Patient Feedback: "{session.patientFeedback}"
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="outlined"
                            color="success"
                            startIcon={<ThumbUp />}
                            onClick={() => handleVerifySession(session, true)}
                          >
                            Verify & Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Flag />}
                            onClick={() => handleOpenFlagDialog(session)}
                          >
                            Raise Red Flag
                          </Button>
                          <Tooltip title="View Full Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Red Flags & Quick Actions */}
        <Grid item xs={12} md={4}>
          {/* Red Flags */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Red Flags ({flaggedSessions.length})
              </Typography>
              
              {flaggedSessions.length === 0 ? (
                <Alert severity="success">
                  No active red flags
                </Alert>
              ) : (
                <List dense>
                  {flaggedSessions.slice(0, 3).map((session) => {
                    const patient = getPatientInfo(session.patientId)
                    const buddy = getBuddyInfo(session.buddyId)
                    
                    return (
                      <ListItem key={session.id} sx={{ border: 1, borderColor: 'error.main', borderRadius: 1, mb: 1 }}>
                        <ListItemIcon>
                          <Flag color="error" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${patient?.name} - ${buddy?.name}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="error">
                                {session.flagReason}
                              </Typography>
                              <Chip 
                                label={session.flagSeverity} 
                                size="small" 
                                color={getSeverityColor(session.flagSeverity)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending Verification
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={((assignedSessions.length - pendingVerification.length) / assignedSessions.length) * 100}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {assignedSessions.length - pendingVerification.length} of {assignedSessions.length} verified
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Red Flags
                  </Typography>
                  <Typography variant="h4" color="error">
                    {flaggedSessions.length}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Patient Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star color="warning" />
                    <Typography variant="h6">
                      {(assignedSessions.reduce((sum, s) => sum + (s.patientRating || 0), 0) / assignedSessions.length).toFixed(1)}/5
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Red Flag Dialog */}
      <Dialog open={openFlagDialog} onClose={() => setOpenFlagDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Raise Red Flag - {selectedSession && getPatientInfo(selectedSession.patientId)?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Flagging this session will alert the doctor and require immediate attention.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Flag Severity</InputLabel>
              <Select
                value={flagSeverity}
                onChange={(e) => setFlagSeverity(e.target.value)}
                label="Flag Severity"
              >
                <MenuItem value="low">Low - Minor concern</MenuItem>
                <MenuItem value="medium">Medium - Requires attention</MenuItem>
                <MenuItem value="high">High - Urgent issue</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for Red Flag"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Describe the issue or concern that requires attention..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFlagDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleRaiseFlag} 
            variant="contained" 
            color="error"
            disabled={!flagReason.trim()}
          >
            Raise Red Flag
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default LogVerification 