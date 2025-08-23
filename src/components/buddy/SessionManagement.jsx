import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Rating,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  Visibility,
  Schedule,
  CheckCircle,
  Assessment,
  FitnessCenter,
  Psychology,
  LocationOn
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const SessionManagement = () => {
  const { profile } = useAuthStore()
  const { sessions, patients, updateSession } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Session tracking state
  const [sessionProgress, setSessionProgress] = useState({})
  const [moodTracking, setMoodTracking] = useState({})
  const [motivationLevel, setMotivationLevel] = useState(3)

  const buddySessions = sessions.filter(s => s.buddyId === profile?.uid)
  const filteredSessions = buddySessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesSearch = session.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.sessionType?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const handleOpenDialog = (session) => {
    setSelectedSession(session)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedSession(null)
  }

  const handleStartSession = async (sessionId) => {
    try {
      await updateSession(sessionId, {
        status: 'in-progress',
        startTime: new Date().toISOString()
      })
      toast.success('Session started')
    } catch (error) {
      toast.error('Error starting session')
    }
  }

  const handleCompleteSession = async (sessionId) => {
    try {
      await updateSession(sessionId, {
        status: 'completed',
        endTime: new Date().toISOString(),
        duration: sessionProgress[sessionId]?.actualDuration || 60,
        notes: sessionProgress[sessionId]?.notes || '',
        moodRating: moodTracking[sessionId] || 3,
        motivationLevel: motivationLevel,
        goalsAchieved: sessionProgress[sessionId]?.goalsAchieved || []
      })
      toast.success('Session completed')
    } catch (error) {
      toast.error('Error completing session')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary'
      case 'in-progress': return 'warning'
      case 'completed': return 'success'
      case 'cancelled': return 'error'
      default: return 'default'
    }
  }

  const getSessionTypeIcon = (type) => {
    switch (type) {
      case 'exercise': return <FitnessCenter />
      case 'therapy': return <Psychology />
      case 'assessment': return <Assessment />
      default: return <Schedule />
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Assigned Sessions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Execute treatment plans assigned by doctors. You cannot create or modify treatment plans.
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Sessions</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search patients or session types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`Total: ${buddySessions.length}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Today: ${buddySessions.filter(s => 
                    new Date(s.scheduledDate).toDateString() === new Date().toDateString()
                  ).length}`}
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {session.patientName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {session.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.patientId}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getSessionTypeIcon(session.sessionType)}
                        <Typography variant="body2">
                          {session.sessionType}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(session.scheduledDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(session.scheduledDate).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{session.duration} min</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {session.isRemote ? (
                          <Chip label="Remote" size="small" color="info" />
                        ) : (
                          <>
                            <LocationOn fontSize="small" />
                            <Typography variant="body2">{session.location}</Typography>
                          </>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.status}
                        color={getStatusColor(session.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleOpenDialog(session)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {session.status === 'scheduled' && (
                          <Tooltip title="Start Session">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStartSession(session.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                        {session.status === 'in-progress' && (
                          <Tooltip title="Complete Session">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteSession(session.id)}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Session Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Session Details - {selectedSession?.patientName}
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  This treatment plan was assigned by a doctor. You can execute the session and add progress notes, but cannot modify the treatment plan.
                </Alert>
              </Grid>
              
              {/* Treatment Plan Details (Read-only) */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Treatment Plan Details (Assigned by Doctor)
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient"
                  value={selectedSession.patientName || 'Unknown Patient'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Type"
                  value={selectedSession.sessionType || 'Unknown Type'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Scheduled Date & Time"
                  value={new Date(selectedSession.scheduledDate).toLocaleString()}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  value={selectedSession.duration || 60}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={selectedSession.location || 'Not specified'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Mode"
                  value={selectedSession.isRemote ? 'Remote' : 'In-person'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Session Goals (Set by Doctor)"
                  multiline
                  rows={2}
                  value={selectedSession.goals || 'No specific goals set'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Doctor's Instructions"
                  multiline
                  rows={2}
                  value={selectedSession.notes || 'No specific instructions'}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              {/* Execution Notes (Editable for buddies) */}
              {selectedSession.status !== 'scheduled' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Session Execution & Progress Notes
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Execution Notes"
                      multiline
                      rows={3}
                      value={sessionProgress[selectedSession.id]?.notes || ''}
                      onChange={(e) => setSessionProgress({
                        ...sessionProgress,
                        [selectedSession.id]: {
                          ...sessionProgress[selectedSession.id],
                          notes: e.target.value
                        }
                      })}
                      placeholder="Add notes about how the session went, patient response, etc..."
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Patient Mood Rating
                    </Typography>
                    <Rating
                      value={moodTracking[selectedSession.id] || 3}
                      onChange={(e, newValue) => setMoodTracking({
                        ...moodTracking,
                        [selectedSession.id]: newValue
                      })}
                      size="large"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Motivation Level
                    </Typography>
                    <Rating
                      value={motivationLevel}
                      onChange={(e, newValue) => setMotivationLevel(newValue)}
                      size="large"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SessionManagement 