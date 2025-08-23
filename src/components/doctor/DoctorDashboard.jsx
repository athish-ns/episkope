import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  People,
  LocalHospital,
  Event,
  Assessment,
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  AdminPanelSettings,
  MedicalServices,
  LocalPharmacy,
  Psychology,
  PersonAdd,
  Search,
  Logout,
  Star,
  Refresh
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useStore from '../../store';
import PatientCarePlans from './PatientCarePlans'
import SessionReviews from './SessionReviews'
import BuddySupervision from './BuddySupervision'
import BuddySelection from './BuddySelection'
import BuddyRatingDashboard from './BuddyRatingDashboard'
import DoctorApprovalPanel from './DoctorApprovalPanel'
import NotificationCenter from '../common/NotificationCenter'

const DoctorDashboard = () => {
  const { profile, logout } = useAuthStore();
  const { 
    patients, 
    sessions, 
    stats, 
    loadPatients, 
    loadUsers, 
    loadSessions,
    isLoading 
  } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      if (profile?.uid) {
        setIsDataLoading(true);
        try {
          // Load all required data
          await Promise.all([
            loadPatients(),
            loadUsers(),
            loadSessions()
          ]);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [profile?.uid, loadPatients, loadUsers, loadSessions]);

  // Refresh data manually
  const handleRefreshData = async () => {
    setIsDataLoading(true);
    try {
      await Promise.all([
        loadPatients(),
        loadUsers(),
        loadSessions()
      ]);
      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Get doctor-specific data
  const assignedPatients = (patients || []).filter(p => 
    p.assignedDoctor === profile?.uid || 
    p.treatmentPlan?.assignedDoctor === profile?.uid
  );

  const completedSessions = (sessions || []).filter(s => 
    s.status === 'completed' && 
    (s.assignedDoctor === profile?.uid || s.doctorId === profile?.uid)
  );

  const pendingApprovals = (patients || []).filter(p => 
    (p.assignedDoctor === profile?.uid || p.treatmentPlan?.assignedDoctor === profile?.uid) &&
    p.overallProgress?.approvalStatus === 'pending'
  );

  // Calculate doctor-specific stats
  const doctorStats = {
    totalPatients: assignedPatients.length,
    activePatients: assignedPatients.filter(p => p.status === 'active').length,
    completedSessions: completedSessions.length,
    averageRating: completedSessions.length > 0 
      ? (completedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / completedSessions.length).toFixed(1)
      : 0,
    pendingApprovals: pendingApprovals.length
  };

  const renderTabContent = () => {
    if (isDataLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={60} />
        </Box>
      );
    }

    switch (activeTab) {
      case 0:
        return <PatientCarePlans />
      case 1:
        return <SessionReviews />
      case 2:
        return <BuddySupervision />
      case 3:
        return <BuddySelection />
      case 4:
        return <BuddyRatingDashboard />
      case 5:
        return <DoctorApprovalPanel />
      default:
        return <PatientCarePlans />
    }
  }

  // Show loading state while data is being fetched
  if (isDataLoading && (!patients || patients.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <LocalHospital sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Doctor Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Dr. {profile?.displayName || profile?.name || 'Doctor'}
          </Typography>
          <NotificationCenter />
          <IconButton color="inherit" onClick={handleRefreshData} disabled={isDataLoading}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar> 

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Data Loading Alert */}
        {isDataLoading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Loading Dashboard Data</AlertTitle>
            Please wait while we load your patient information and statistics...
          </Alert>
        )}

        {/* No Patients Alert */}
        {!isDataLoading && assignedPatients.length === 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>No Assigned Patients</AlertTitle>
            You don't have any patients assigned to you yet. Patients will be assigned during registration or by administrators.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Assigned Patients
                </Typography>
                <Typography variant="h4" color="primary">
                  {doctorStats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctorStats.activePatients} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Completed Sessions
                </Typography>
                <Typography variant="h4" color="secondary">
                  {doctorStats.completedSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Patient Rating
                </Typography>
                <Typography variant="h4" color="success">
                  {doctorStats.averageRating}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average rating
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Pending Approvals
                </Typography>
                <Typography variant="h4" color="warning">
                  {doctorStats.pendingApprovals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progress updates
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Patient Overview */}
          {assignedPatients.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Patient Overview
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Patient Name</TableCell>
                          <TableCell>Condition</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Session</TableCell>
                          <TableCell>Progress</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {assignedPatients.slice(0, 5).map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  <Person />
                                </Avatar>
                                <Typography variant="body2">
                                  {patient.firstName} {patient.lastName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={patient.currentCondition || patient.condition || 'N/A'} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={patient.status || 'Active'} 
                                size="small" 
                                color={patient.status === 'active' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {patient.lastSessionDate ? 
                                new Date(patient.lastSessionDate).toLocaleDateString() : 
                                'No sessions'
                              }
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {patient.overallProgress?.overallPercentage || 0}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {assignedPatients.length > 5 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Showing 5 of {assignedPatients.length} patients
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Navigation Tabs */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Patient Care Plans" />
                  <Tab label="Session Reviews" />
                  <Tab label="Buddy Supervision" />
                  <Tab label="Buddy Assignment" />
                  <Tab label="Rating Dashboard" />
                  <Tab label="Progress Approvals" />
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

export default DoctorDashboard 