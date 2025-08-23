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
  Rating,
  LinearProgress,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material'
import {
  Person,
  Schedule,
  CheckCircle,
  Pending,
  Star,
  RateReview,
  FitnessCenter,
  Medication,
  Assignment,
  TrendingUp,
  Notifications
} from '@mui/icons-material'
import useStore from '../../store'
import toast from 'react-hot-toast'
import BuddyRating from './BuddyRating'

const DailyPlan = () => {
  const { user, patients, users, sessions, updateSession } = useStore()
  const [openRatingDialog, setOpenRatingDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  const patientData = patients.find(p => p.id === user?.id)
  const patientSessions = sessions.filter(s => s.patientId === user?.id)
  const todaySessions = patientSessions.filter(s => 
    new Date(s.date).toDateString() === new Date().toDateString()
  )

  const getCareTeam = () => {
    if (!patientData) return {}
    
    const doctor = users.find(u => u.id === patientData.assignedDoctor)
    const nurse = users.find(u => u.id === patientData.assignedNurse)
    const buddy = users.find(u => u.id === patientData.assignedBuddy)
    
    return { doctor, nurse, buddy }
  }

  const careTeam = getCareTeam()

  const getDailyPlan = () => {
    if (!patientData?.carePlan) return []
    
    const plan = []
    
    // Add exercises from care plan
    patientData.carePlan.exercises.forEach((exercise, index) => {
      plan.push({
        id: `exercise-${index}`,
        type: 'exercise',
        title: exercise,
        time: `09:00 AM`,
        completed: false,
        icon: <FitnessCenter />
      })
    })

    // Add medication reminders
    plan.push({
      id: 'medication-1',
      type: 'medication',
      title: 'Morning Medication',
      time: '08:00 AM',
      completed: false,
      icon: <Medication />
    })

    plan.push({
      id: 'medication-2',
      type: 'medication',
      title: 'Evening Medication',
      time: '08:00 PM',
      completed: false,
      icon: <Medication />
    })

    // Add buddy sessions
    if (careTeam.buddy) {
      plan.push({
        id: 'buddy-session',
        type: 'session',
        title: `Session with ${careTeam.buddy.name}`,
        time: '02:00 PM',
        completed: todaySessions.length > 0,
        icon: <Person />
      })
    }

    return plan
  }

  const dailyPlan = getDailyPlan()

  const handleOpenRatingDialog = (session) => {
    setSelectedSession(session)
    setOpenRatingDialog(true)
  }

  const handleRatingSubmitted = (ratingData) => {
    // Refresh the component or update local state if needed
    console.log('Rating submitted:', ratingData)
  }

  const getBuddyInfo = (buddyId) => {
    return users.find(u => u.id === buddyId)
  }

  const getPlanItemColor = (type) => {
    switch (type) {
      case 'exercise':
        return 'primary'
      case 'medication':
        return 'secondary'
      case 'session':
        return 'success'
      default:
        return 'default'
    }
  }

  const getPlanItemIcon = (type) => {
    switch (type) {
      case 'exercise':
        return <FitnessCenter />
      case 'medication':
        return <Medication />
      case 'session':
        return <Person />
      default:
        return <Assignment />
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Daily Care Plan
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your personalized daily schedule and care activities.
      </Typography>

      {/* Today's Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Schedule - {new Date().toLocaleDateString()}
              </Typography>
              
              <Stepper orientation="vertical">
                {dailyPlan.map((item, index) => (
                  <Step key={item.id} active={!item.completed} completed={item.completed}>
                    <StepLabel
                      icon={
                        item.completed ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Pending color="action" />
                        )
                      }
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {item.title}
                        </Typography>
                        <Chip 
                          label={item.time} 
                          size="small" 
                          color={getPlanItemColor(item.type)}
                        />
                        <Chip 
                          label={item.type} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {item.completed ? 'Completed' : 'Pending'}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Care Team Info */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Care Team
              </Typography>
              
              <List dense>
                {careTeam.doctor && (
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={careTeam.doctor.name}
                      secondary="Primary Doctor"
                    />
                  </ListItem>
                )}
                {careTeam.nurse && (
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={careTeam.nurse.name}
                      secondary="Assigned Nurse"
                    />
                  </ListItem>
                )}
                {careTeam.buddy && (
                  <ListItem>
                    <ListItemIcon>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={careTeam.buddy.name}
                      secondary={`Medical Buddy (${careTeam.buddy.tier})`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Progress
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Plan Completion
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(dailyPlan.filter(item => item.completed).length / dailyPlan.length) * 100}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {dailyPlan.filter(item => item.completed).length} of {dailyPlan.length} completed
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Sessions Today
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {todaySessions.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Sessions & Rating */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Sessions
              </Typography>
              
              {patientSessions.length === 0 ? (
                <Alert severity="info">
                  No sessions recorded yet. Your first session will appear here.
                </Alert>
              ) : (
                <List>
                  {patientSessions.slice(0, 5).map((session) => {
                    const buddy = getBuddyInfo(session.buddyId)
                    const hasRating = session.patientRating > 0
                    
                    return (
                      <ListItem 
                        key={session.id}
                        sx={{ 
                          border: 1, 
                          borderColor: 'grey.300', 
                          borderRadius: 1, 
                          mb: 2
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`Session with ${buddy?.name}`}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {new Date(session.date).toLocaleDateString()} • {session.duration} minutes
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Activities: {session.activities.join(', ')}
                              </Typography>
                              {hasRating && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                  <Star fontSize="small" color="warning" />
                                  <Typography variant="body2">
                                    Your rating: {session.patientRating}/5
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <Box>
                          {!hasRating ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<RateReview />}
                              onClick={() => handleOpenRatingDialog(session)}
                            >
                              Rate Session
                            </Button>
                          ) : (
                            <Chip 
                              label="Rated" 
                              color="success" 
                              size="small"
                              icon={<CheckCircle />}
                            />
                          )}
                        </Box>
                      </ListItem>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Notifications */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              
              <List dense>
                {dailyPlan.filter(item => !item.completed).slice(0, 3).map((item) => (
                  <ListItem key={item.id}>
                    <ListItemIcon>
                      <Notifications color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      secondary={`Due at ${item.time}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Care Plan Goals */}
          {patientData?.carePlan && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Goals
                </Typography>
                
                <List dense>
                  {patientData.carePlan.goals.map((goal, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TrendingUp color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={goal} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Rating Dialog */}
      <BuddyRating
        session={selectedSession}
        open={openRatingDialog}
        onClose={() => setOpenRatingDialog(false)}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </Box>
  )
}

export default DailyPlan 