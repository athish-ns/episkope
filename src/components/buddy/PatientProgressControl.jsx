import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Pending,
  Warning,
  Send,
  Assessment,
  Timeline,
  Speed,
  Psychology,
  LocalHospital,
  Person,
  Group,
  Message,
  Star,
  ExpandMore,
  ThumbUp,
  ThumbDown,
  Edit,
  Save,
  Cancel
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useAuthStore from '../../store/authStore';
import useStore from '../../store';
import toast from 'react-hot-toast';

const PatientProgressControl = () => {
  const { profile } = useAuthStore();
  const { patients, loadPatients, updatePatient, updateTreatmentPlan } = useStore();
  
  // State management
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [progressUpdateDialog, setProgressUpdateDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [progressData, setProgressData] = useState({
    physicalProgress: 0,
    mentalProgress: 0,
    painLevel: 0,
    mood: 5,
    energy: 5,
    notes: '',
    recommendations: '',
    nextSteps: ''
  });
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load assigned patients on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadPatients();
      // Filter patients assigned to this medical buddy
      const buddyPatients = patients.filter(p => p.assignedBuddy === profile?.uid);
      setAssignedPatients(buddyPatients);
      
      // Load approval requests for all assigned patients
      const allRequests = [];
      buddyPatients.forEach(patient => {
        if (patient.approvalRequests) {
          allRequests.push(...patient.approvalRequests.map(req => ({
            ...req,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.id
          })));
        }
      });
      setApprovalRequests(allRequests);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load patient data');
    }
  };

  // Handle progress update submission
  const handleProgressUpdate = () => {
    if (selectedPatient) {
      const progressUpdate = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        data: progressData,
        status: 'pending_approval',
        requestedBy: 'medical_buddy',
        requestedByUid: profile?.uid,
        notes: progressData.notes,
        recommendations: progressData.recommendations,
        nextSteps: progressData.nextSteps
      };
      
      // Add to patient's approval requests
      const currentRequests = selectedPatient.approvalRequests || [];
      const updatedRequests = [...currentRequests, progressUpdate];
      
      // Update patient data
      updatePatient(selectedPatient.id, { 
        approvalRequests: updatedRequests,
        lastProgressUpdate: new Date().toISOString(),
        lastUpdatedBy: profile?.uid
      });
      
      // Update local state
      setApprovalRequests(prev => [...prev, {
        ...progressUpdate,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientId: selectedPatient.id
      }]);
      
      setProgressUpdateDialog(false);
      setProgressData({
        physicalProgress: 0,
        mentalProgress: 0,
        painLevel: 0,
        mood: 5,
        energy: 5,
        notes: '',
        recommendations: '',
        nextSteps: ''
      });
      
      toast.success('Progress update submitted for doctor approval');
    }
  };

  // Handle approval request review (medical buddy can review their own requests)
  const handleApprovalReview = (requestId, action) => {
    // Medical buddies can only review their own requests
    const request = approvalRequests.find(req => req.id === requestId);
    if (request && request.requestedByUid === profile?.uid) {
      const updatedRequests = approvalRequests.map(req => 
        req.id === requestId 
          ? { ...req, buddyReview: action, buddyReviewDate: new Date().toISOString() }
          : req
      );
      setApprovalRequests(updatedRequests);
      
      // Update patient data
      const patient = assignedPatients.find(p => p.id === request.patientId);
      if (patient) {
        const patientRequests = patient.approvalRequests.map(req => 
          req.id === requestId 
            ? { ...req, buddyReview: action, buddyReviewDate: new Date().toISOString() }
            : req
        );
        updatePatient(patient.id, { approvalRequests: patientRequests });
      }
      
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} by medical buddy`);
    }
  };



  if (assignedPatients.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="info.main">
            No patients assigned to you yet. Please contact the administration.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Patient Progress Control
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Manage your assigned patients' progress and submit updates for doctor approval
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Patient Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assigned Patients ({assignedPatients.length})
              </Typography>
              <List>
                {assignedPatients.map((patient) => (
                  <ListItem
                    key={patient.id}
                    button
                    selected={selectedPatient?.id === patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    sx={{ mb: 1, borderRadius: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${patient.firstName} ${patient.lastName}`}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            Progress: {patient.treatmentPlan?.progress || 0}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Last Update: {patient.lastProgressUpdate ? 
                              new Date(patient.lastProgressUpdate).toLocaleDateString() : 'Never'
                            }
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<TrendingUp />}
                onClick={() => setProgressUpdateDialog(true)}
                disabled={!selectedPatient}
                sx={{ mb: 2 }}
              >
                Update Patient Progress
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => setApprovalDialog(true)}
                sx={{ mb: 2 }}
              >
                Review Approval Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Details and Progress */}
        <Grid item xs={12} md={8}>
          {selectedPatient ? (
            <Grid container spacing={3}>
              {/* Patient Info */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </Typography>
                      <Chip 
                        label={`Progress: ${selectedPatient.treatmentPlan?.progress || 0}%`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Diagnosis:</strong> {selectedPatient.treatmentPlan?.diagnosis || 'Not specified'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Current Phase:</strong> {selectedPatient.treatmentPlan?.currentPhase || 'Initial'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Start Date:</strong> {selectedPatient.treatmentPlan?.startDate ? 
                            new Date(selectedPatient.treatmentPlan.startDate).toLocaleDateString() : 'Not set'
                          }
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Last Updated:</strong> {selectedPatient.lastUpdated ? 
                            new Date(selectedPatient.lastUpdated).toLocaleDateString() : 'Never'
                          }
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Progress Charts */}
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Progress Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="physical" stroke="#8884d8" strokeWidth={3} name="Physical" />
                        <Line type="monotone" dataKey="mental" stroke="#82ca9d" strokeWidth={3} name="Mental" />
                        <Line type="monotone" dataKey="mood" stroke="#ffc658" strokeWidth={3} name="Mood" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Current Status */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Status
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Physical Progress</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedPatient.treatmentPlan?.progress || 0} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.treatmentPlan?.progress || 0}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Pain Level</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(selectedPatient.currentPainLevel || 0) * 10} 
                        color="error"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.currentPainLevel || 0}/10
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">Mood</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(selectedPatient.currentMood || 5) * 10} 
                        color="success"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {selectedPatient.currentMood || 5}/10
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Updates */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Progress Updates
                    </Typography>
                    <List>
                      {(selectedPatient.approvalRequests || []).slice(-3).reverse().map((request) => (
                        <ListItem key={request.id} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: request.status === 'approved' ? 'success.main' : 
                                       request.status === 'rejected' ? 'error.main' : 'warning.main' 
                            }}>
                              {request.status === 'approved' ? <CheckCircle /> : 
                               request.status === 'rejected' ? <Warning /> : <Pending />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`Progress Update - ${new Date(request.timestamp).toLocaleDateString()}`}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Physical: {request.data.physicalProgress}% | Mental: {request.data.mentalProgress}%
                                </Typography>
                                <Typography variant="body2">
                                  Pain: {request.data.painLevel}/10 | Mood: {request.data.mood}/10
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Status: {request.status === 'approved' ? 'Approved by Doctor' : 
                                           request.status === 'rejected' ? 'Rejected by Doctor' : 'Pending Approval'}
                                </Typography>
                                {request.notes && (
                                  <Typography variant="body2" color="text.secondary">
                                    Notes: {request.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  Select a patient to view details and manage progress
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Progress Update Dialog */}
      <Dialog open={progressUpdateDialog} onClose={() => setProgressUpdateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Patient Progress</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Update {selectedPatient?.firstName}'s progress. This will be submitted for doctor approval.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Physical Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Progress: {progressData.physicalProgress}%</Typography>
                <Slider
                  value={progressData.physicalProgress}
                  onChange={(e, value) => setProgressData(prev => ({ ...prev, physicalProgress: value }))}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Mental Progress</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Progress: {progressData.mentalProgress}%</Typography>
                <Slider
                  value={progressData.mentalProgress}
                  onChange={(e, value) => setProgressData(prev => ({ ...prev, mentalProgress: value }))}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Pain Level</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Pain: {progressData.painLevel}/10</Typography>
                <Slider
                  value={progressData.painLevel}
                  onChange={(e, value) => setProgressData(prev => ({ ...prev, painLevel: value }))}
                  min={0}
                  max={10}
                  marks={[
                    { value: 0, label: 'No Pain' },
                    { value: 5, label: 'Moderate' },
                    { value: 10, label: 'Severe' }
                  ]}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Mood & Energy</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Mood: {progressData.mood}/10</Typography>
                <Rating
                  value={progressData.mood}
                  onChange={(e, value) => setProgressData(prev => ({ ...prev, mood: value }))}
                  max={10}
                  size="large"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Energy: {progressData.energy}/10</Typography>
                <Rating
                  value={progressData.energy}
                  onChange={(e, value) => setProgressData(prev => ({ ...prev, energy: value }))}
                  max={10}
                  size="large"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Progress Notes"
                value={progressData.notes}
                onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Recommendations"
                value={progressData.recommendations}
                onChange={(e) => setProgressData(prev => ({ ...prev, recommendations: e.target.value }))}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Next Steps"
                value={progressData.nextSteps}
                onChange={(e) => setProgressData(prev => ({ ...prev, nextSteps: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleProgressUpdate} variant="contained">
            Submit for Doctor Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Requests Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Review Approval Requests</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review and manage progress update requests. You can review your own requests, but only doctors can approve them.
          </Typography>
          
          <List>
            {approvalRequests.map((request) => (
              <Accordion key={request.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      mr: 2,
                      bgcolor: request.status === 'approved' ? 'success.main' : 
                               request.status === 'rejected' ? 'error.main' : 'warning.main' 
                    }}>
                      {request.status === 'approved' ? <CheckCircle /> : 
                       request.status === 'rejected' ? <Warning /> : <Pending />}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">
                        {request.patientName} - {new Date(request.timestamp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Status: {request.status === 'approved' ? 'Approved' : 
                                 request.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                      </Typography>
                    </Box>
                    {request.requestedByUid === profile?.uid && request.status === 'pending_approval' && (
                      <Box>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprovalReview(request.id, 'approve');
                          }}
                        >
                          <ThumbUp />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprovalReview(request.id, 'reject');
                          }}
                        >
                          <ThumbDown />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Progress Data</Typography>
                      <Typography variant="body2">
                        Physical Progress: {request.data.physicalProgress}%
                      </Typography>
                      <Typography variant="body2">
                        Mental Progress: {request.data.mentalProgress}%
                      </Typography>
                      <Typography variant="body2">
                        Pain Level: {request.data.painLevel}/10
                      </Typography>
                      <Typography variant="body2">
                        Mood: {request.data.mood}/10
                      </Typography>
                      <Typography variant="body2">
                        Energy: {request.data.energy}/10
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>Additional Information</Typography>
                      {request.notes && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Notes:</strong> {request.notes}
                        </Typography>
                      )}
                      {request.recommendations && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Recommendations:</strong> {request.recommendations}
                        </Typography>
                      )}
                      {request.nextSteps && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Next Steps:</strong> {request.nextSteps}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PatientProgressControl;
