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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
  FilterList,
  Download,
  Print,
  TrendingFlat
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'

const BuddyRatingDashboard = () => {
  const { profile } = useAuthStore()
  const { users, sessions, patients, loadUsers, loadPatients, loadSessions } = useStore()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedBuddy, setSelectedBuddy] = useState('all')
  const [timeFilter, setTimeFilter] = useState('30days')
  const [buddyStats, setBuddyStats] = useState([])

  useEffect(() => {
    // Load data when component mounts
    loadUsers()
    loadPatients()
    loadSessions()
  }, [])

  useEffect(() => {
    if (users && sessions) {
      calculateBuddyStats()
    }
  }, [users, sessions, selectedBuddy, timeFilter])

  const calculateBuddyStats = () => {
    if (!users || !sessions) return

    const buddies = users.filter(u => u.role === 'Medical Buddy')
    const stats = []

    buddies.forEach(buddy => {
      if (selectedBuddy !== 'all' && buddy.id !== selectedBuddy) return

      const buddySessions = sessions.filter(s => s.buddyId === buddy.id)
      const completedSessions = buddySessions.filter(s => s.status === 'completed')
      const ratedSessions = completedSessions.filter(s => s.patientRating)
      
      // Apply time filter
      let filteredSessions = ratedSessions
      if (timeFilter !== 'all') {
        const cutoffDate = new Date()
        switch (timeFilter) {
          case '7days':
            cutoffDate.setDate(cutoffDate.getDate() - 7)
            break
          case '30days':
            cutoffDate.setDate(cutoffDate.getDate() - 30)
            break
          case '90days':
            cutoffDate.setDate(cutoffDate.getDate() - 90)
            break
          default:
            break
        }
        filteredSessions = ratedSessions.filter(s => new Date(s.date) >= cutoffDate)
      }

      if (filteredSessions.length === 0) return

      // Calculate ratings
      const totalRating = filteredSessions.reduce((sum, s) => sum + (s.patientRating || 0), 0)
      const averageRating = totalRating / filteredSessions.length
      
      // Rating breakdown
      const ratingBreakdown = {
        5: filteredSessions.filter(s => s.patientRating === 5).length,
        4: filteredSessions.filter(s => s.patientRating === 4).length,
        3: filteredSessions.filter(s => s.patientRating === 3).length,
        2: filteredSessions.filter(s => s.patientRating === 2).length,
        1: filteredSessions.filter(s => s.patientRating === 1).length
      }

      // Calculate trends
      const recentSessions = filteredSessions.slice(-10)
      const recentRatings = recentSessions.map(s => s.patientRating)
      const recentAverage = recentRatings.length > 0 ? 
        recentRatings.reduce((sum, r) => sum + r, 0) / recentRatings.length : 0
      
      const trend = recentAverage > averageRating ? 'up' : recentAverage < averageRating ? 'down' : 'stable'

      // Patient satisfaction
      const satisfiedPatients = filteredSessions.filter(s => s.patientRating >= 4).length
      const satisfactionRate = (satisfiedPatients / filteredSessions.length) * 100

      // Performance tier
      let tier = 'Bronze'
      if (averageRating >= 4.5 && satisfactionRate >= 90) tier = 'Gold'
      else if (averageRating >= 4.0 && satisfactionRate >= 80) tier = 'Silver'

      // Assigned patients
      const assignedPatients = patients.filter(p => p.assignedBuddy === buddy.id).length

      stats.push({
        buddy,
        totalSessions: buddySessions.length,
        completedSessions: completedSessions.length,
        ratedSessions: filteredSessions.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingBreakdown,
        trend,
        satisfactionRate: parseFloat(satisfactionRate.toFixed(1)),
        tier,
        assignedPatients,
        recentSessions: filteredSessions.slice(-5)
      })
    })

    // Sort by average rating (descending)
    stats.sort((a, b) => b.averageRating - a.averageRating)
    setBuddyStats(stats)
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold': return 'warning'
      case 'Silver': return 'info'
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
  
  // Utility function for trend color
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'success'
      case 'down': return 'error'
      case 'stable': return 'warning'
      default: return 'default'
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'success'
    if (rating >= 4.0) return 'primary'
    if (rating >= 3.0) return 'warning'
    return 'error'
  }

  const handleExportData = () => {
    // Export functionality for ratings data
    const data = buddyStats.map(stat => ({
      'Buddy Name': stat.buddy.name,
      'Email': stat.buddy.email,
      'Tier': stat.tier,
      'Average Rating': stat.averageRating,
      'Total Sessions': stat.totalSessions,
      'Completed Sessions': stat.completedSessions,
      'Rated Sessions': stat.ratedSessions,
      'Satisfaction Rate': `${stat.satisfactionRate}%`,
      'Assigned Patients': stat.assignedPatients,
      'Trend': stat.trend
    }))

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `buddy-ratings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <OverviewTab stats={buddyStats} />
      case 1:
        return <DetailedTab stats={buddyStats} />
      case 2:
        return <TrendsTab stats={buddyStats} />
      default:
        return <OverviewTab stats={buddyStats} />
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Medical Buddy Rating Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<Download />}
            onClick={handleExportData}
            variant="outlined"
            size="small"
          >
            Export Data
          </Button>
          <Button
            startIcon={<Refresh />}
            onClick={calculateBuddyStats}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Buddy</InputLabel>
                <Select
                  value={selectedBuddy}
                  onChange={(e) => setSelectedBuddy(e.target.value)}
                  label="Select Buddy"
                >
                  <MenuItem value="all">All Buddies</MenuItem>
                  {users.filter(u => u.role === 'Medical Buddy').map(buddy => (
                    <MenuItem key={buddy.id} value={buddy.id}>
                      {buddy.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  label="Time Period"
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" />
          <Tab label="Detailed Analysis" />
          <Tab label="Trends" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {renderTabContent()}
    </Box>
  )
}

// Utility functions for tier and icon
const getTierColor = (tier) => {
  switch (tier) {
    case 'Gold': return 'warning'
    case 'Silver': return 'info'
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

// Utility function for rating color
const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'success'
  if (rating >= 4.0) return 'primary'
  if (rating >= 3.0) return 'warning'
  return 'error'
}

const getTrendIcon = (trend) => {
  switch (trend) {
    case 'up': return <TrendingUp color="success" />
    case 'down': return <TrendingDown color="error" />
    default: return <TrendingUp color="warning" />
  }
}

// Utility function for trend color
const getTrendColor = (trend) => {
  switch (trend) {
    case 'up': return 'success'
    case 'down': return 'error'
    case 'stable': return 'warning'
    default: return 'default'
  }
}

const OverviewTab = ({ stats }) => {
  if (stats.length === 0) {
    return (
      <Alert severity="info">
        No rating data available for the selected filters.
      </Alert>
    )
  }
  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
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
              {stats.length > 0 ? 
                (stats.reduce((sum, s) => sum + s.averageRating, 0) / stats.length).toFixed(1) : '0'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overall Average Rating
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
              <EmojiEvents sx={{ fontSize: 28 }} />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {stats.filter(s => s.tier === 'Gold').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gold Tier Buddies
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
              {stats.reduce((sum, s) => sum + s.assignedPatients, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Patients
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Avatar sx={{ 
              bgcolor: 'warning.main', 
              width: 56, 
              height: 56, 
              mx: 'auto', 
              mb: 2 
            }}>
              <TrendingUp sx={{ fontSize: 28 }} />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {stats.filter(s => s.trend === 'up').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Improving Buddies
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Performers */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Medical Buddies
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Buddy</TableCell>
                    <TableCell>Tier</TableCell>
                    <TableCell>Average Rating</TableCell>
                    <TableCell>Satisfaction Rate</TableCell>
                    <TableCell>Trend</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.slice(0, 10).map((stat, index) => (
                    <TableRow key={stat.buddy.id}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          color={index < 3 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {stat.buddy.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {stat.buddy.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {stat.buddy.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stat.tier}
                          color={getTierColor(stat.tier)}
                          size="small"
                          icon={<span>{getTierIcon(stat.tier)}</span>}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={stat.averageRating} readOnly size="small" />
                          <Typography variant="body2" color={getRatingColor(stat.averageRating)}>
                            {stat.averageRating}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={getRatingColor(stat.satisfactionRate / 20)}>
                          {stat.satisfactionRate}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTrendIcon(stat.trend)}
                          label={stat.trend}
                          color={getTrendColor(stat.trend)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

// Detailed Analysis Tab Component
const DetailedTab = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid item xs={12} md={6} key={stat.buddy.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stat.buddy.name}
                </Typography>
                <Chip
                  label={stat.tier}
                  color={getTierColor(stat.tier)}
                  size="small"
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                  <Typography variant="h5" color={getRatingColor(stat.averageRating)}>
                    {stat.averageRating}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Satisfaction Rate
                  </Typography>
                  <Typography variant="h5" color={getRatingColor(stat.satisfactionRate / 20)}>
                    {stat.satisfactionRate}%
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rating Distribution
              </Typography>
              {Object.entries(stat.ratingBreakdown).reverse().map(([rating, count]) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 60 }}>
                    <Rating value={parseInt(rating)} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary">
                      ({rating})
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.ratedSessions > 0 ? (count / stat.ratedSessions) * 100 : 0}
                    sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

// Trends Tab Component
const TrendsTab = ({ stats }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Performance Trends Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Rating Trends
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Improving Buddies</Typography>
                <Chip 
                  label={stats.filter(s => s.trend === 'up').length}
                  color="success"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Declining Buddies</Typography>
                <Chip 
                  label={stats.filter(s => s.trend === 'down').length}
                  color="error"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Stable Buddies</Typography>
                <Chip 
                  label={stats.filter(s => s.trend === 'stable').length}
                  color="warning"
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Tier Distribution
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Gold Tier</Typography>
                <Chip 
                  label={stats.filter(s => s.tier === 'Gold').length}
                  color="warning"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Silver Tier</Typography>
                <Chip 
                  label={stats.filter(s => s.tier === 'Silver').length}
                  color="default"
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Bronze Tier</Typography>
                <Chip 
                  label={stats.filter(s => s.tier === 'Bronze').length}
                  color="error"
                  size="small"
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default BuddyRatingDashboard
