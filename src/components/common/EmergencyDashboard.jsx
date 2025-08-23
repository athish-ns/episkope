import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ReportProblem,
  Warning,
  Error,
  CheckCircle,
  Schedule,
  LocationOn,
  Person,
  LocalHospital,
  Psychology,
  LocalPhone,
  Email,
  Refresh,
  ExpandMore,
  Close,
  Visibility,
  Edit,
  Delete,
  Notifications,
  NotificationsActive
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import notificationService, { NOTIFICATION_TYPES, PRIORITY_LEVELS } from '../../services/notificationService';
import useAuthStore from '../../store/authStore';
import useStore from '../../store';

const EmergencyDashboard = () => {
  const { profile } = useAuthStore();
  const { patients, users, loadPatients, loadUsers } = useStore();
  
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [emergencyDialog, setEmergencyDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseData, setResponseData] = useState({
    status: '',
    notes: '',
    actionTaken: '',
    followUpRequired: false
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all'
  });

  useEffect(() => {
    loadData();
    loadEmergencies();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadPatients(),
        loadUsers()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadEmergencies = async () => {
    setLoading(true);
    try {
      // Get emergency notifications for the current user
      const result = await notificationService.getUserNotifications(profile?.uid, {
        type: NOTIFICATION_TYPES.EMERGENCY
      });

      if (result.success) {
        setEmergencies(result.data);
      } else {
        console.error('Failed to load emergencies:', result.error);
      }
    } catch (error) {
      console.error('Error loading emergencies:', error);
      toast.error('Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyResponse = async () => {
    try {
      if (!selectedEmergency || !responseData.status) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Update emergency status
      await notificationService.acknowledgeNotification(selectedEmergency.id, profile?.uid);
      
      // Update emergency record with response
      const updatedEmergency = {
        ...selectedEmergency,
        status: responseData.status,
        response: {
          responderId: profile?.uid,
          responderName: profile?.displayName || profile?.name || 'Unknown',
          responderRole: profile?.role || 'Unknown',
          timestamp: new Date().toISOString(),
          notes: responseData.notes,
          actionTaken: responseData.actionTaken,
          followUpRequired: responseData.followUpRequired
        }
      };

      // In a real app, this would update the emergency record in the database
      console.log('Emergency response recorded:', updatedEmergency);
      
      toast.success('Emergency response recorded successfully');
      setResponseDialog(false);
      setResponseData({
        status: '',
        notes: '',
        actionTaken: '',
        followUpRequired: false
      });
      
      // Refresh emergencies
      loadEmergencies();
    } catch (error) {
      console.error('Error recording emergency response:', error);
      toast.error('Failed to record emergency response');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case PRIORITY_LEVELS.CRITICAL:
        return 'error';
      case PRIORITY_LEVELS.URGENT:
        return 'error';
      case PRIORITY_LEVELS.HIGH:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'acknowledged':
        return 'success';
      case 'pending':
        return 'warning';
      case 'resolved':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <LocalHospital />;
      case 'nurse':
        return <LocalHospital />;
      case 'buddy':
        return <Psychology />;
      default:
        return <Person />;
    }
  };

  const getPatientInfo = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? {
      name: `${patient.firstName} ${patient.lastName}`,
      email: patient.email,
      phone: patient.phone,
      assignedDoctor: patient.assignedDoctor,
      assignedNurse: patient.assignedNurse,
      assignedBuddy: patient.assignedBuddy
    } : null;
  };

  const getStaffInfo = (staffId) => {
    const staff = users.find(u => u.id === staffId);
    return staff ? {
      name: staff.displayName || staff.name || 'Unknown',
      email: staff.email,
      role: staff.role
    } : null;
  };

  const filteredEmergencies = emergencies.filter(emergency => {
    if (filters.status !== 'all' && emergency.status !== filters.status) return false;
    if (filters.priority !== 'all' && emergency.priority !== filters.priority) return false;
    if (filters.type !== 'all' && emergency.metadata?.emergencyType !== filters.type) return false;
    return true;
  });

  const emergencyStats = {
    total: emergencies.length,
    pending: emergencies.filter(e => e.status === 'pending').length,
    acknowledged: emergencies.filter(e => e.status === 'acknowledged').length,
    critical: emergencies.filter(e => e.priority === PRIORITY_LEVELS.CRITICAL).length,
    urgent: emergencies.filter(e => e.priority === PRIORITY_LEVELS.URGENT).length
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #d32f2f 0%, #f57c00 100%)', color: 'white' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              🚨 Emergency Dashboard
            </Typography>
            <Typography variant="subtitle1">
              Monitor and respond to emergency situations
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Refresh />}
              onClick={loadEmergencies}
            >
              Refresh
            </Button>
            <Badge badgeContent={emergencyStats.pending} color="error">
              <NotificationsActive color="inherit" />
            </Badge>
          </Box>
        </Box>
      </Paper>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Emergencies
              </Typography>
              <Typography variant="h4" component="h2">
                {emergencyStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Response
              </Typography>
              <Typography variant="h4" component="h2" color="warning.main">
                {emergencyStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Critical Priority
              </Typography>
              <Typography variant="h4" component="h2" color="error.main">
                {emergencyStats.critical}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Urgent Priority
              </Typography>
              <Typography variant="h4" component="h2" color="warning.main">
                {emergencyStats.urgent}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value={PRIORITY_LEVELS.CRITICAL}>Critical</MenuItem>
                <MenuItem value={PRIORITY_LEVELS.URGENT}>Urgent</MenuItem>
                <MenuItem value={PRIORITY_LEVELS.HIGH}>High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="patient_emergency">Patient Emergency</MenuItem>
                <MenuItem value="medical_emergency">Medical Emergency</MenuItem>
                <MenuItem value="system_emergency">System Emergency</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Emergency List */}
      {filteredEmergencies.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No emergency alerts found
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEmergencies.map((emergency) => {
            const patientInfo = getPatientInfo(emergency.metadata?.patientId);
            const isAssigned = emergency.recipientId === profile?.uid;
            
            return (
              <Grid item xs={12} key={emergency.id}>
                <Card 
                  sx={{ 
                    borderLeft: `4px solid ${
                      emergency.priority === PRIORITY_LEVELS.CRITICAL ? '#d32f2f' :
                      emergency.priority === PRIORITY_LEVELS.URGENT ? '#f57c00' : '#ff9800'
                    }`
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <ReportProblem 
                          color={emergency.priority === PRIORITY_LEVELS.CRITICAL ? 'error' : 'warning'} 
                          sx={{ fontSize: 32 }}
                        />
                        <Box>
                          <Typography variant="h6" component="h3">
                            Emergency Alert
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(emergency.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Chip 
                          label={emergency.priority.toUpperCase()} 
                          color={getPriorityColor(emergency.priority)}
                          size="small"
                        />
                        <Chip 
                          label={emergency.status} 
                          color={getStatusColor(emergency.status)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography variant="body1" paragraph>
                      {emergency.message}
                    </Typography>

                    {patientInfo && (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2">Patient Information</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Name:</strong> {patientInfo.name}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Email:</strong> {patientInfo.email}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Phone:</strong> {patientInfo.phone}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2">
                                <strong>Assigned Doctor:</strong> {patientInfo.assignedDoctor ? getStaffInfo(patientInfo.assignedDoctor)?.name : 'Not assigned'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Assigned Nurse:</strong> {patientInfo.assignedNurse ? getStaffInfo(patientInfo.assignedNurse)?.name : 'Not assigned'}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Assigned Buddy:</strong> {patientInfo.assignedBuddy ? getStaffInfo(patientInfo.assignedBuddy)?.name : 'Not assigned'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    )}

                    {emergency.metadata?.location && (
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <LocationOn color="action" />
                        <Typography variant="body2" color="textSecondary">
                          Location: {emergency.metadata.location}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions>
                    {isAssigned && emergency.status === 'pending' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setSelectedEmergency(emergency);
                          setResponseDialog(true);
                        }}
                      >
                        Respond to Emergency
                      </Button>
                    )}
                    
                    {emergency.status === 'acknowledged' && (
                      <Chip 
                        label="Acknowledged" 
                        color="success" 
                        icon={<CheckCircle />}
                      />
                    )}
                    
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedEmergency(emergency);
                        setEmergencyDialog(true);
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Emergency Details Dialog */}
      <Dialog 
        open={emergencyDialog} 
        onClose={() => setEmergencyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Emergency Details
          <IconButton
            onClick={() => setEmergencyDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedEmergency && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Emergency Information
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEmergency.message}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Metadata:
              </Typography>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(selectedEmergency.metadata, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmergencyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Response Dialog */}
      <Dialog 
        open={responseDialog} 
        onClose={() => setResponseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Respond to Emergency</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Response Status</InputLabel>
              <Select
                value={responseData.status}
                label="Response Status"
                onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
              >
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Action Taken"
              multiline
              rows={3}
              value={responseData.actionTaken}
              onChange={(e) => setResponseData({ ...responseData, actionTaken: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={responseData.notes}
              onChange={(e) => setResponseData({ ...responseData, notes: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEmergencyResponse}
            variant="contained"
            disabled={!responseData.status}
          >
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmergencyDashboard;
