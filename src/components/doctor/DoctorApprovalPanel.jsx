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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Warning,
  ExpandMore,
  ThumbUp,
  ThumbDown,
  Person,
  Group,
  LocalHospital,
  TrendingUp,
  Assessment,
  Message,
  Star
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import useStore from '../../store';
import toast from 'react-hot-toast';

const DoctorApprovalPanel = () => {
  const { profile } = useAuthStore();
  const { patients, loadPatients, updatePatient, updateTreatmentPlan } = useStore();
  
  // State management
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load assigned patients on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await loadPatients();
      // Filter patients assigned to this doctor
      const doctorPatients = patients.filter(p => p.assignedDoctor === profile?.uid);
      setAssignedPatients(doctorPatients);
      
      // Load all approval requests for assigned patients
      const allRequests = [];
      doctorPatients.forEach(patient => {
        if (patient.approvalRequests) {
          allRequests.push(...patient.approvalRequests.map(req => ({
            ...req,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.id,
            patientEmail: patient.email
          })));
        }
      });
      setPendingApprovals(allRequests);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load patient data');
    }
  };

  // Handle approval decision
  const handleApprovalDecision = (requestId, decision, notes = '') => {
    const request = pendingApprovals.find(req => req.id === requestId);
    if (!request) return;

    const updatedRequest = {
      ...request,
      status: decision,
      approvedBy: profile?.uid,
      approvedByRole: 'doctor',
      approvalDate: new Date().toISOString(),
      approvalNotes: notes
    };

    // Update patient's approval requests
    const patient = assignedPatients.find(p => p.id === request.patientId);
    if (patient) {
      const patientRequests = patient.approvalRequests.map(req => 
        req.id === requestId ? updatedRequest : req
      );
      
      // If approved, update patient's treatment plan progress
      if (decision === 'approved') {
        const progressData = request.data;
        const currentProgress = patient.treatmentPlan?.progress || 0;
        
        // Calculate new progress based on the update
        const newProgress = Math.max(
          currentProgress,
          Math.max(progressData.physicalProgress, progressData.mentalProgress)
        );
        
        // Update treatment plan
        updateTreatmentPlan(patient.id, {
          progress: newProgress,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: profile?.uid
        });
        
        // Update patient with new progress data
        updatePatient(patient.id, {
          approvalRequests: patientRequests,
          currentPainLevel: progressData.painLevel,
          currentMood: progressData.mood,
          currentEnergy: progressData.energy,
          lastProgressUpdate: new Date().toISOString(),
          lastUpdatedBy: profile?.uid
        });
      } else {
        // Just update approval requests for rejected requests
        updatePatient(patient.id, { approvalRequests: patientRequests });
      }
    }

    // Update local state
    setPendingApprovals(prev => prev.map(req => 
      req.id === requestId ? updatedRequest : req
    ));

    setApprovalDialog(false);
    setSelectedApproval(null);
    setApprovalNotes('');
    
    toast.success(`Progress update ${decision} successfully`);
  };

  // Filter approvals by status
  const filteredApprovals = pendingApprovals.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  // Get approval statistics
  const approvalStats = {
    total: pendingApprovals.length,
    pending: pendingApprovals.filter(req => req.status === 'pending_approval').length,
    approved: pendingApprovals.filter(req => req.status === 'approved').length,
    rejected: pendingApprovals.filter(req => req.status === 'rejected').length
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
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Progress Approval Panel
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Review and approve progress updates from your assigned patients and medical buddies
        </Typography>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {approvalStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {approvalStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {approvalStats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {approvalStats.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="h6">Filter by Status:</Typography>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Requests</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs />
          <Grid item>
            <Button
              variant="outlined"
              onClick={loadData}
              startIcon={<Assessment />}
            >
              Refresh Data
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Approval Requests List */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress Update Requests ({filteredApprovals.length})
              </Typography>
              
              {filteredApprovals.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No {filterStatus === 'all' ? '' : filterStatus.replace('_', ' ')} requests found.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredApprovals.map((request) => (
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
                             request.status === 'rejected' ? <Cancel /> : <Pending />}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1">
                              {request.patientName} - {new Date(request.timestamp).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Requested by: {request.requestedBy === 'patient' ? 'Patient' : 'Medical Buddy'} • 
                              Status: {request.status === 'approved' ? 'Approved' : 
                                       request.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
                            </Typography>
                          </Box>
                          {request.status === 'pending_approval' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<ThumbUp />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApproval(request);
                                  setApprovalDialog(true);
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<ThumbDown />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedApproval(request);
                                  setApprovalDialog(true);
                                }}
                              >
                                Reject
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={3}>
                          {/* Progress Data */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Progress Data</Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">Physical Progress: {request.data.physicalProgress}%</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={request.data.physicalProgress} 
                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                              />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">Mental Progress: {request.data.mentalProgress}%</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={request.data.mentalProgress} 
                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                              />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">Pain Level: {request.data.painLevel}/10</Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={request.data.painLevel * 10} 
                                color="error"
                                sx={{ height: 8, borderRadius: 4, mb: 1 }}
                              />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">Mood: {request.data.mood}/10</Typography>
                              <Rating value={request.data.mood} max={10} readOnly />
                            </Box>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">Energy: {request.data.energy}/10</Typography>
                              <Rating value={request.data.energy} max={10} readOnly />
                            </Box>
                          </Grid>
                          
                          {/* Additional Information */}
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>Additional Information</Typography>
                            {request.notes && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Notes:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {request.notes}
                                </Typography>
                              </Box>
                            )}
                            {request.recommendations && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Recommendations:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {request.recommendations}
                                </Typography>
                              </Box>
                            )}
                            {request.nextSteps && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Next Steps:</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {request.nextSteps}
                                </Typography>
                              </Box>
                            )}
                            
                            {/* Approval Information */}
                            {request.status !== 'pending_approval' && (
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {request.status === 'approved' ? 'Approval' : 'Rejection'} Details:
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Date: {new Date(request.approvalDate).toLocaleDateString()}
                                </Typography>
                                {request.approvalNotes && (
                                  <Typography variant="body2" color="text.secondary">
                                    Notes: {request.approvalNotes}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedApproval ? `Review Progress Update for ${selectedApproval.patientName}` : 'Review Progress Update'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please review the progress update and provide approval notes if needed.
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Approval Notes (Optional)"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add any notes or comments about this progress update..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleApprovalDecision(selectedApproval?.id, 'rejected', approvalNotes)}
            color="error"
            variant="outlined"
          >
            Reject
          </Button>
          <Button 
            onClick={() => handleApprovalDecision(selectedApproval?.id, 'approved', approvalNotes)}
            color="success"
            variant="contained"
          >
            Approve
          </Button>
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

export default DoctorApprovalPanel;
