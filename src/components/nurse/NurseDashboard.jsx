import React, { useState } from 'react'
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Avatar,
  Chip,
  LinearProgress
} from '@mui/material'
import {
  LocalHospital,
  Person,
  Assessment,
  Group,
  Logout,
  Add,
  Edit,
  Star,
  Schedule
} from '@mui/icons-material'
import useStore from '../../store'
import { toast } from 'react-hot-toast'
import PatientCare from './PatientCare'
import SessionSupervision from './SessionSupervision'
import BuddyOversight from './BuddyOversight'
import LogVerification from './LogVerification'
import useAuthStore from '../../store/authStore'
import NotificationCenter from '../common/NotificationCenter'

const NurseDashboard = () => {
  const { profile, logout } = useAuthStore();
  const { patients, sessions, stats } = useStore();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
  };

  const nurseStats = stats.nurse;

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <PatientCare />
      case 1:
        return <SessionSupervision />
      case 2:
        return <BuddyOversight />
      case 3:
        return <LogVerification />
      default:
        return <PatientCare />
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'secondary.main' }}>
        <Toolbar>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Nurse Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Nurse {profile?.name}
          </Typography>
          <NotificationCenter />
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {nurseStats.totalPatients}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Assigned Patients
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {nurseStats.sessionsToday}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Total Sessions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Schedule />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {nurseStats.sessionsToday}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Today's Sessions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Navigation Tabs */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Patient Care" />
                  <Tab label="Session Supervision" />
                  <Tab label="Buddy Oversight" />
                  <Tab label="Log Verification" />
                </Tabs>
              </CardContent>
            </Card>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            {renderTabContent()}
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default NurseDashboard 