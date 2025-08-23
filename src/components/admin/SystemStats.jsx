import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import {
  LocalHospital,
  Person,
  Group,
  Assessment,
  TrendingUp,
  CheckCircle,
  Schedule,
  Star,
  School,
  Work,
  Favorite
} from '@mui/icons-material'
import useStore from '../../store'

const SystemStats = () => {
  const { users, patients, sessions } = useStore()

  const getTierDistribution = () => {
    const buddies = users.filter(u => u.role === 'Medical Buddy')
    const expert = buddies.filter(b => b.tier === 'Expert').length
    const advanced = buddies.filter(b => b.tier === 'Advanced').length
    const novice = buddies.filter(b => b.tier === 'Novice').length
    return { expert, advanced, novice, total: buddies.length }
  }

  const tierStats = getTierDistribution()

  const getRecentSessions = () => {
    return sessions.slice(-5).reverse().map(session => ({
      ...session,
      patientName: patients.find(p => p.id === session.patientId)?.name || 'Unknown Patient',
      buddyName: users.find(u => u.id === session.buddyId)?.name || 'Unknown Buddy'
    }))
  }

  const recentSessions = getRecentSessions()

  const getSessionStatus = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'success', icon: <CheckCircle />, label: 'Completed' }
      case 'in-progress':
        return { color: 'warning', icon: <Schedule />, label: 'In Progress' }
      default:
        return { color: 'info', icon: <Schedule />, label: 'Scheduled' }
    }
  }

  const StatCard = ({ title, value, icon, color, subtitle, gradient }) => (
    <Card sx={{ 
      height: '100%',
      background: gradient || 'white',
      color: gradient ? 'white' : 'inherit',
      position: 'relative',
      overflow: 'hidden',
      '&::before': gradient ? {
        content: '""',
        position: 'absolute',
        top: -30,
        right: -30,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
      } : {},
    }}>
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: gradient ? 'rgba(255, 255, 255, 0.2)' : color, 
            mr: 2,
            width: 48,
            height: 48
          }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography 
              color={gradient ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary'} 
              variant="h6"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
        {subtitle && (
          <Typography 
            variant="body2" 
            color={gradient ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'}
            sx={{ fontWeight: 400 }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive statistics and insights about the rehabilitation centre
        </Typography>
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={patients.length}
            icon={<Person sx={{ fontSize: 24 }} />}
            color="primary.main"
            subtitle="Active rehabilitation cases"
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Medical Staff"
            value={users.filter(u => u.role === 'Doctor' || u.role === 'Nurse').length}
            icon={<LocalHospital sx={{ fontSize: 24 }} />}
            color="secondary.main"
            subtitle={`${users.filter(u => u.role === 'Doctor').length} Doctors, ${users.filter(u => u.role === 'Nurse').length} Nurses`}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Medical Buddies"
            value={users.filter(u => u.role === 'Medical Buddy').length}
            icon={<Group sx={{ fontSize: 24 }} />}
            color="success.main"
            subtitle="Student assistants"
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sessions"
            value={sessions.length}
            icon={<Assessment sx={{ fontSize: 24 }} />}
            color="warning.main"
            subtitle="Completed rehab sessions"
            gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          />
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3}>
        {/* Medical Buddy Experience Levels */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2, width: 40, height: 40 }}>
                  <School sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Medical Buddy Experience Levels
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        bgcolor: 'success.main', 
                        width: 32, 
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <Work sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Expert Level ({tierStats.expert})
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {tierStats.total > 0 ? Math.round((tierStats.expert / tierStats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tierStats.total > 0 ? (tierStats.expert / tierStats.total) * 100 : 0}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Seasoned professionals with extensive experience
                  </Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        bgcolor: 'info.main', 
                        width: 32, 
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <Favorite sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Advanced Level ({tierStats.advanced})
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {tierStats.total > 0 ? Math.round((tierStats.advanced / tierStats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tierStats.total > 0 ? (tierStats.advanced / tierStats.total) * 100 : 0}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Skilled practitioners with solid foundation
                  </Typography>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        bgcolor: 'warning.main', 
                        width: 32, 
                        height: 32,
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        <School sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Novice Level ({tierStats.novice})
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {tierStats.total > 0 ? Math.round((tierStats.novice / tierStats.total) * 100) : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={tierStats.total > 0 ? (tierStats.novice / tierStats.total) * 100 : 0}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    New learners building their skills
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Total Medical Buddies: <strong>{tierStats.total}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2, width: 40, height: 40 }}>
                  <TrendingUp sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Activity
                </Typography>
              </Box>
              
              {recentSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ 
                    bgcolor: 'grey.200', 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2 
                  }}>
                    <Assessment sx={{ fontSize: 30, color: 'grey.500' }} />
                  </Avatar>
                  <Typography variant="body1" color="text.secondary">
                    No recent sessions
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {recentSessions.map((session, index) => {
                    const status = getSessionStatus(session.status)
                    return (
                      <React.Fragment key={session.id}>
                        <ListItem sx={{ 
                          px: 0, 
                          py: 1.5,
                          '&:hover': {
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                          },
                          transition: 'background-color 0.2s ease-in-out'
                        }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar sx={{ 
                              bgcolor: `${status.color}.main`,
                              width: 32,
                              height: 32
                            }}>
                              {status.icon}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {session.patientName}
                                </Typography>
                                <Chip
                                  label={status.label}
                                  size="small"
                                  color={status.color}
                                  sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(session.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                  Buddy: {session.buddyName}
                                </Typography>
                              </Box>
                            }
                          />
                          {session.patientRating && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {session.patientRating}/5
                              </Typography>
                            </Box>
                          )}
                        </ListItem>
                        {index < recentSessions.length - 1 && (
                          <Divider sx={{ mx: 2 }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SystemStats 