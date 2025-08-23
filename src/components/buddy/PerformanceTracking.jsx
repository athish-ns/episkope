import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Rating,
  LinearProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material'
import {
  Star,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Psychology,
  FitnessCenter,
  Comment,
  Assessment,
  Visibility,
  Refresh,
  Add,
  Edit,
  Delete,
  ExpandMore,
  CalendarToday,
  TrackChanges,
  CheckCircle,
  Warning,
  Info,
  BarChart,
  PieChart,
  Timeline,
  Speed,
  DirectionsRun,
  Favorite,
  ThumbUp,
  ThumbDown,
  Notifications
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const PerformanceTracking = () => {
  const { profile } = useAuthStore()
  const { sessions, patients, updateSession } = useStore()
  const [activeTab, setActiveTab] = useState(0)
  const [performanceData, setPerformanceData] = useState(null)
  const [openGoalDialog, setOpenGoalDialog] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    targetDate: new Date().toISOString().split('T')[0],
    category: 'performance',
    priority: 'medium'
  })

  useEffect(() => {
    if (profile && sessions) {
      calculatePerformance()
    }
  }, [profile, sessions])

  const calculatePerformance = () => {
    if (!profile || !sessions) return

    const buddySessions = sessions.filter(s => s.buddyId === profile.uid)
    const completedSessions = buddySessions.filter(s => s.status === 'completed')
    const ratedSessions = completedSessions.filter(s => s.patientRating)
    
    // Calculate ratings
    const totalRating = ratedSessions.reduce((sum, s) => sum + (s.patientRating || 0), 0)
    const averageRating = ratedSessions.length > 0 ? totalRating / ratedSessions.length : 0
    
    // Rating breakdown
    const ratingBreakdown = {
      5: ratedSessions.filter(s => s.patientRating === 5).length,
      4: ratedSessions.filter(s => s.patientRating === 4).length,
      3: ratedSessions.filter(s => s.patientRating === 3).length,
      2: ratedSessions.filter(s => s.patientRating === 2).length,
      1: ratedSessions.filter(s => s.patientRating === 1).length
    }

    // Calculate trends
    const recentSessions = completedSessions.slice(-10)
    const recentRatings = recentSessions.filter(s => s.patientRating).map(s => s.patientRating)
    const recentAverage = recentRatings.length > 0 ? 
      recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length : 0
    
    const trend = recentAverage > averageRating ? 'up' : recentAverage < averageRating ? 'down' : 'stable'

    // Patient satisfaction
    const satisfiedPatients = ratedSessions.filter(s => s.patientRating >= 4).length
    const satisfactionRate = ratedSessions.length > 0 ? (satisfiedPatients / ratedSessions.length) * 100 : 0

    // Performance tier
    let tier = 'Bronze'
    if (averageRating >= 4.5 && satisfactionRate >= 90) tier = 'Gold'
    else if (averageRating >= 4.0 && satisfactionRate >= 80) tier = 'Silver'

    // Goals tracking
    const goals = [
      { id: 1, title: 'Maintain 4.5+ rating', category: 'rating', target: 4.5, current: averageRating, achieved: averageRating >= 4.5 },
      { id: 2, title: 'Complete 15 sessions', category: 'sessions', target: 15, current: completedSessions.length, achieved: completedSessions.length >= 15 },
      { id: 3, title: '90% satisfaction rate', category: 'satisfaction', target: 90, current: satisfactionRate, achieved: satisfactionRate >= 90 },
      { id: 4, title: 'Weekly exercise sessions', category: 'frequency', target: 3, current: 2, achieved: false }
    ]

    // Performance metrics
    const metrics = {
      sessionCompletionRate: buddySessions.length > 0 ? (completedSessions.length / buddySessions.length) * 100 : 0,
      averageSessionDuration: completedSessions.length > 0 ? 
        completedSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / completedSessions.length : 0,
      patientRetentionRate: 85, // This would be calculated from actual data
      emergencyResponseTime: '5.2 min', // This would be tracked from actual incidents
      patientProgressScore: 78 // This would be calculated from various factors
    }

    setPerformanceData({
      totalSessions: buddySessions.length,
      completedSessions: completedSessions.length,
      ratedSessions: ratedSessions.length,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingBreakdown,
      trend,
      satisfactionRate: parseFloat(satisfactionRate.toFixed(1)),
      tier,
      recentSessions: recentSessions.slice(-5),
      assignedPatients: patients.filter(p => p.assignedBuddy === profile.uid).length,
      goals,
      metrics
    })
  }

  const handleGoalSubmit = async () => {
    try {
      if (selectedGoal) {
        // Update existing goal
        const updatedGoals = performanceData.goals.map(g => 
          g.id === selectedGoal.id ? { ...g, ...goalFormData } : g
        )
        setPerformanceData({ ...performanceData, goals: updatedGoals })
        toast.success('Goal updated successfully')
      } else {
        // Add new goal
        const newGoal = {
          id: Date.now(),
          ...goalFormData,
          current: 0,
          achieved: false
        }
        setPerformanceData({ 
          ...performanceData, 
          goals: [...performanceData.goals, newGoal] 
        })
        toast.success('Goal added successfully')
      }
      
      setOpenGoalDialog(false)
      setSelectedGoal(null)
      setGoalFormData({
        title: '',
        description: '',
        targetValue: '',
        targetDate: new Date().toISOString().split('T')[0],
        category: 'performance',
        priority: 'medium'
      })
    } catch (error) {
      toast.error('Error saving goal')
      console.error('Error saving goal:', error)
    }
  }

  const handleGoalEdit = (goal) => {
    setSelectedGoal(goal)
    setGoalFormData({
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.target.toString(),
      targetDate: goal.targetDate || new Date().toISOString().split('T')[0],
      category: goal.category,
      priority: goal.priority || 'medium'
    })
    setOpenGoalDialog(true)
  }

  const handleGoalDelete = (goalId) => {
    const updatedGoals = performanceData.goals.filter(g => g.id !== goalId)
    setPerformanceData({ ...performanceData, goals: updatedGoals })
    toast.success('Goal deleted successfully')
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold': return 'warning'
      case 'Silver': return 'default'
      case 'Bronze': return 'error'
      default: return 'default'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Gold': return '🥇'
      case 'Silver': return '🥈'
      case 'Bronze': return '🥉'
      default: return '⭐'
    }
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />
      case 'down': return <TrendingDown color="error" />
      default: return <TrendingUp color="warning" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'success'
      case 'down': return 'error'
      default: return 'warning'
    }
  }

  const getGoalProgress = (goal) => {
    if (goal.category === 'rating') {
      return Math.min((goal.current / goal.target) * 100, 100)
    } else if (goal.category === 'sessions') {
      return Math.min((goal.current / goal.target) * 100, 100)
    } else if (goal.category === 'satisfaction') {
      return Math.min((goal.current / goal.target) * 100, 100)
    } else {
      return Math.min((goal.current / goal.target) * 100, 100)
    }
  }

  if (!performanceData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Typography>Loading performance data...</Typography>
      </Box>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            {/* Performance Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: `${getTierColor(performanceData.tier)}.main`, 
                      width: 56, 
                      height: 56, 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <Typography variant="h4">{getTierIcon(performanceData.tier)}</Typography>
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {performanceData.tier} Tier
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Performance Level
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 56, 
                      height: 56, 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <Star sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {performanceData.averageRating}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'success.main', 
                      width: 56, 
                      height: 56, 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <TrendingUp sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {performanceData.satisfactionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient Satisfaction
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Avatar sx={{ 
                      bgcolor: 'info.main', 
                      width: 56, 
                      height: 56, 
                      mx: 'auto', 
                      mb: 2 
                    }}>
                      <Psychology sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {performanceData.assignedPatients}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assigned Patients
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Performance Trends */}
            <Card sx={{ borderRadius: 3, mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Performance Trends
                  </Typography>
                  <Chip
                    icon={getTrendIcon(performanceData.trend)}
                    label={`Trend: ${performanceData.trend.charAt(0).toUpperCase() + performanceData.trend.slice(1)}`}
                    color={getTrendColor(performanceData.trend)}
                    size="small"
                  />
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Rating Distribution
                    </Typography>
                    {Object.entries(performanceData.ratingBreakdown).reverse().map(([rating, count]) => (
                      <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 80 }}>
                          <Rating value={parseInt(rating)} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            ({rating})
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={performanceData.ratedSessions > 0 ? (count / performanceData.ratedSessions) * 100 : 0}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Session Statistics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Total Sessions</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.totalSessions}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Completed</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {performanceData.completedSessions}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Rated Sessions</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {performanceData.ratedSessions}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Completion Rate</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                          {performanceData.totalSessions > 0 ? 
                            Math.round((performanceData.completedSessions / performanceData.totalSessions) * 100) : 0}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Performance Goals
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenGoalDialog(true)}
              >
                Add Goal
              </Button>
            </Box>

            <Grid container spacing={3}>
              {performanceData.goals.map((goal) => (
                <Grid item xs={12} md={6} key={goal.id}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {goal.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {goal.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleGoalEdit(goal)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleGoalDelete(goal.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Progress: {goal.current}/{goal.target}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(getGoalProgress(goal))}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getGoalProgress(goal)}
                          sx={{ height: 8, borderRadius: 4 }}
                          color={goal.achieved ? 'success' : 'primary'}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={goal.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={goal.priority}
                          size="small"
                          color={goal.priority === 'high' ? 'error' : goal.priority === 'medium' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        {goal.achieved && (
                          <Chip
                            icon={<CheckCircle />}
                            label="Achieved"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Performance Metrics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Session Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Completion Rate</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.metrics.sessionCompletionRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Avg Session Duration</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.metrics.averageSessionDuration.toFixed(0)} min
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Patient Retention</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.metrics.patientRetentionRate}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Quality Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Emergency Response</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.metrics.emergencyResponseTime}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Progress Score</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.metrics.patientProgressScore}/100
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">Patient Satisfaction</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {performanceData.satisfactionRate}%
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )
      case 3:
        return (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Recent Sessions
            </Typography>
            
            {performanceData.recentSessions.length === 0 ? (
              <Alert severity="info">
                No recent sessions to display. Complete some sessions to see your performance data.
              </Alert>
            ) : (
              <Card>
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Patient</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Rating</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {performanceData.recentSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {new Date(session.date || session.scheduledDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{session.patientName || 'N/A'}</TableCell>
                            <TableCell>{session.sessionType || 'N/A'}</TableCell>
                            <TableCell>{session.duration || 'N/A'} min</TableCell>
                            <TableCell>
                              {session.patientRating ? (
                                <Rating value={session.patientRating} readOnly size="small" />
                              ) : (
                                <Chip label="Not Rated" size="small" color="default" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={session.status}
                                size="small"
                                color={session.status === 'completed' ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Performance Tracking
        </Typography>
        <Button
          startIcon={<Refresh />}
          onClick={calculatePerformance}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Overview" />
            <Tab label="Goals" />
            <Tab label="Metrics" />
            <Tab label="Recent Sessions" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content */}
      {renderTabContent()}

      {/* Goal Dialog */}
      <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGoal ? 'Edit Goal' : 'Add New Goal'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal Title"
                value={goalFormData.title}
                onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                placeholder="e.g., Maintain 4.5+ rating"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={goalFormData.description}
                onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                placeholder="Describe what you want to achieve..."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Value"
                value={goalFormData.targetValue}
                onChange={(e) => setGoalFormData({ ...goalFormData, targetValue: e.target.value })}
                placeholder="e.g., 4.5, 15, 90"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={goalFormData.targetDate}
                onChange={(e) => setGoalFormData({ ...goalFormData, targetDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={goalFormData.category}
                  onChange={(e) => setGoalFormData({ ...goalFormData, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="sessions">Sessions</MenuItem>
                  <MenuItem value="satisfaction">Satisfaction</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={goalFormData.priority}
                  onChange={(e) => setGoalFormData({ ...goalFormData, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGoalDialog(false)}>Cancel</Button>
          <Button onClick={handleGoalSubmit} variant="contained">
            {selectedGoal ? 'Update Goal' : 'Add Goal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PerformanceTracking 