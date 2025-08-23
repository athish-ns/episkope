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
  Badge,
  Tabs,
  Tab,
  Fab,
  Tooltip,
  Alert,
  Snackbar,
  Slider,
  Rating,
  useTheme,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  ReportProblem,
  Phone,
  Notifications,
  Send,
  AttachFile,
  EmojiEmotions,
  TrendingUp,
  FitnessCenter,
  CalendarToday,
  CheckCircle,
  Pending,
  Warning,
  Chat,
  VideoCall,
  VoiceChat,
  Assessment,
  Timeline,
  Speed,
  Psychology,
  LocalHospital,
  Person,
  Group,
  Message,
  Star,
  StarBorder,
  ThumbUp,
  ThumbDown,
  RateReview,
  Logout,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import useAuthStore from '../../store/authStore';
import useStore from '../../store';
import toast from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import patientEmailService from '../../services/patientEmailService';

const PatientDashboard = () => {
  const { profile, logout } = useAuthStore();
  const { patients, users, loadPatients, updatePatient, addSession } = useStore();
  
  // State management
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [progressUpdateDialog, setProgressUpdateDialog] = useState(false);
  const [progressData, setProgressData] = useState({
    physicalProgress: 0,
    mentalProgress: 0,
    painLevel: 0,
    mood: 5,
    energy: 5,
    notes: ''
  });
  const [approvalRequests, setApprovalRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [buddyReviewDialog, setBuddyReviewDialog] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    comments: '',
    communication: 0,
    professionalism: 0,
    effectiveness: 0
  });

  // Function to get staff name by ID and role
  const getStaffName = (staffId, role) => {
    if (!staffId || !users) return 'Not assigned';
    
    // First try to find in users array
    const user = users.find(u => u.id === staffId || u.uid === staffId);
    if (user) {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      } else if (user.displayName) {
        return user.displayName;
      } else if (user.name) {
        return user.name;
      }
    }
    
    // If not found in users, return the ID as fallback
    return staffId;
  };

  // Function to get staff display info
  const getStaffDisplayInfo = (staffId, role) => {
    if (!staffId) return { name: 'Not assigned', available: false };
    
    const name = getStaffName(staffId, role);
    const available = name !== 'Not assigned';
    
    return { name, available };
  };

  // Load patient data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load data function
  const loadData = async () => {
    try {
      await loadPatients();
      // Find patient data by email or uid
      const foundPatient = patients.find(p => 
        p.email === profile?.email || p.uid === profile?.uid
      );
      
      if (foundPatient) {
        setPatientData(foundPatient);
        // Load chat messages if they exist
        if (foundPatient.chatHistory) {
          setChatMessages(foundPatient.chatHistory);
        }
        // Load approval requests if they exist
        if (foundPatient.approvalRequests) {
          setApprovalRequests(foundPatient.approvalRequests);
        }
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      toast.error('Failed to load patient data');
    }
  };

  // Real-time chat updates - reload chat messages when patient data changes
  useEffect(() => {
    if (patientData && patientData.chatHistory) {
      setChatMessages(patientData.chatHistory);
    }
  }, [patientData?.chatHistory]);

  // Auto-refresh chat messages every 10 seconds to get updates from staff
  useEffect(() => {
    const chatRefreshInterval = setInterval(() => {
      if (patientData && patientData.id) {
        // Reload patient data to get latest chat messages
        loadData();
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(chatRefreshInterval);
  }, [patientData?.id]);

  // Emergency and Contact Functions
  const handleEmergency = async () => {
    setEmergencyMode(true);
    
    if (patientData) {
      // Get patient location (in a real app, this would come from GPS)
      const patientLocation = 'Patient Home'; // This would be dynamic
      
      const emergencyData = {
        patientId: patientData.id,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        severity: 'high', // Default to high severity for patient-initiated emergencies
        description: 'Patient has reported an emergency situation requiring immediate medical attention',
        location: patientLocation,
        timestamp: new Date().toISOString()
      };
      
      // Debug logging
      console.log('🚨 Emergency triggered with data:', emergencyData);
      console.log('🔍 Patient ID being used:', patientData.id);
      console.log('🔍 Assigned staff IDs:', {
        doctor: patientData.assignedDoctor,
        nurse: patientData.assignedNurse,
        buddy: patientData.assignedBuddy
      });
      
      try {
        // Send emergency emails to all assigned staff using our email service
        console.log('📧 Attempting to send emergency notification...');
        const emailResult = await patientEmailService.sendEmergencyNotification(
          patientData.id,
          emergencyData
        );
        
        console.log('📧 Emergency notification result:', emailResult);
        
        if (emailResult.success) {
          toast.success(`🚨 Emergency alert sent to ${emailResult.totalStaff} assigned medical staff members!`);
          
          // Log emergency for tracking
          console.log('Emergency alert triggered:', emergencyData);
          console.log('Email results:', emailResult);
          
          // Also send notification through existing service for consistency
          await notificationService.createEmergencyAlert({
            ...emergencyData,
            assignedDoctor: patientData.assignedDoctor,
            assignedNurse: patientData.assignedNurse,
            assignedBuddy: patientData.assignedBuddy,
            type: 'patient_emergency'
          });
          
        } else {
          console.error('❌ Emergency email failed:', emailResult.error);
          toast.error(`Emergency alert failed: ${emailResult.error}`);
        }
        
      } catch (error) {
        console.error('❌ Error sending emergency alert:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          patientId: patientData.id,
          assignedStaff: {
            doctor: patientData.assignedDoctor,
            nurse: patientData.assignedNurse,
            buddy: patientData.assignedBuddy
          }
        });
        toast.error('Failed to send emergency alert. Please try again or contact staff directly.');
      }
    } else {
      console.error('❌ Patient data not available for emergency');
      toast.error('Patient data not available. Please refresh the page and try again.');
    }
  };

  const handleContact = () => {
    setContactDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleContactSubmit = (contactType, message) => {
    // Send contact request to assigned staff
    if (patientData) {
      const contactData = {
        patientId: patientData.id,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        contactType,
        message,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      toast.success('Contact request sent successfully!');
      setContactDialogOpen(false);
    }
  };

  // Chat Functions
  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'patient',
        senderId: profile?.uid,
        senderName: `${patientData.firstName} ${patientData.lastName}`,
        content: message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Save to patient data
      if (patientData) {
        const updatedChatHistory = [...chatMessages, newMessage];
        try {
          await updatePatient(patientData.id, { chatHistory: updatedChatHistory });
        } catch (error) {
          console.error('Error saving chat message:', error);
          toast.error('Failed to save message. Please try again.');
        }
      }
    }
  };

  // Buddy Review Functions
  const handleBuddyReview = (buddyId) => {
    const buddy = users?.find(u => u.id === buddyId);
    if (buddy) {
      setSelectedBuddy(buddy);
      setReviewData({
        rating: 0,
        comments: '',
        communication: 0,
        professionalism: 0,
        effectiveness: 0
      });
      setBuddyReviewDialog(true);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedBuddy || reviewData.rating === 0) {
      toast.error('Please provide a rating and select a buddy');
      return;
    }

    try {
      const newReview = {
        id: Date.now().toString(),
        buddyId: selectedBuddy.id,
        buddyName: `${selectedBuddy.firstName} ${selectedBuddy.lastName}`,
        patientId: patientData.id,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        rating: reviewData.rating,
        comments: reviewData.comments,
        communication: reviewData.communication,
        professionalism: reviewData.professionalism,
        effectiveness: reviewData.effectiveness,
        timestamp: new Date().toISOString(),
        status: 'submitted'
      };

      // Add review to patient data
      const updatedReviews = [...(patientData.buddyReviews || []), newReview];
      await updatePatient(patientData.id, { buddyReviews: updatedReviews });

      // Update buddy's overall rating in users collection
      const buddyReviews = users?.find(u => u.id === selectedBuddy.id)?.reviews || [];
      const updatedBuddyReviews = [...buddyReviews, newReview];
      const averageRating = updatedBuddyReviews.reduce((sum, review) => sum + review.rating, 0) / updatedBuddyReviews.length;
      
      // Update buddy's rating in the store (this would need to be implemented in the store)
      // For now, we'll just show a success message
      
      toast.success('Buddy review submitted successfully!');
      setBuddyReviewDialog(false);
      setSelectedBuddy(null);
      setReviewData({
        rating: 0,
        comments: '',
        communication: 0,
        professionalism: 0,
        effectiveness: 0
      });
      
      // Reload data to show the new review
      loadData();
    } catch (error) {
      console.error('Error submitting buddy review:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  // Progress Tracking Functions
  const handleProgressUpdate = async () => {
    if (patientData) {
      const progressUpdate = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        data: progressData,
        status: 'pending_approval',
        requestedBy: 'patient',
        notes: progressData.notes
      };
      
      try {
        // Send progress update emails to assigned staff
        const progressDataForEmail = {
          patientId: patientData.id,
          patientName: `${patientData.firstName} ${patientData.lastName}`,
          updateType: 'Patient Self-Reported Progress Update',
          summary: `Physical: ${progressData.physicalProgress}%, Mental: ${progressData.mentalProgress}%, Pain: ${progressData.painLevel}/10, Mood: ${progressData.mood}/10, Energy: ${progressData.energy}/10. Notes: ${progressData.notes || 'None'}`,
          timestamp: new Date().toISOString()
        };
        
        const emailResult = await patientEmailService.sendProgressUpdate(
          patientData.id,
          progressDataForEmail
        );
        
        if (emailResult.success) {
          toast.success(`📊 Progress update sent to ${emailResult.totalStaff} assigned staff members!`);
        } else {
          console.warn('Progress update email failed:', emailResult.error);
        }
        
      } catch (error) {
        console.error('Error sending progress update emails:', error);
        // Don't fail the progress update if email fails
      }
      
             // Add to approval requests
       const updatedRequests = [...approvalRequests, progressUpdate];
       setApprovalRequests(updatedRequests);
       
       // Update patient data
       try {
         await updatePatient(patientData.id, { 
           approvalRequests: updatedRequests,
           lastProgressUpdate: new Date().toISOString()
         });
       } catch (error) {
         console.error('Error updating patient data:', error);
         toast.error('Failed to save patient data. Please try again.');
         return; // Don't proceed if update fails
       }
      
      setProgressUpdateDialog(false);
      setProgressData({
        physicalProgress: 0,
        mentalProgress: 0,
        painLevel: 0,
        mood: 5,
        energy: 5,
        notes: ''
      });
      
      toast.success('Progress update submitted for doctor approval');
    }
  };

  // Mock data for charts
  const progressChartData = [
    { name: 'Week 1', physical: 20, mental: 15, pain: 8, mood: 3, energy: 2 },
    { name: 'Week 2', physical: 35, mental: 30, pain: 6, mood: 4, energy: 3 },
    { name: 'Week 3', physical: 50, mental: 45, pain: 4, mood: 5, energy: 4 },
    { name: 'Week 4', physical: 65, mental: 60, pain: 3, mood: 6, energy: 5 },
    { name: 'Week 5', physical: 75, mental: 70, pain: 2, mood: 7, energy: 6 },
    { name: 'Week 6', physical: 85, mental: 80, pain: 1, mood: 8, energy: 7 }
  ];

  const sessionData = [
    { name: 'Physical Therapy', completed: 12, total: 20, rating: 4.5 },
    { name: 'Mental Health', completed: 8, total: 15, rating: 4.8 },
    { name: 'Exercise', completed: 18, total: 25, rating: 4.2 },
    { name: 'Meditation', completed: 10, total: 12, rating: 4.6 }
  ];

  const moodData = [
    { name: 'Happy', value: 40, color: '#4CAF50' },
    { name: 'Calm', value: 30, color: '#2196F3' },
    { name: 'Neutral', value: 20, color: '#FF9800' },
    { name: 'Anxious', value: 10, color: '#F44336' }
  ];

  if (!patientData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="black">
            Loading... if this takes too long, please contact the receptionist.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Emergency and Contact Buttons */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Tooltip title="Emergency Alert" placement="left">
          <Fab
            color="error"
            size="large"
            onClick={handleEmergency}
            sx={{ mb: 2 }}
          >
            <ReportProblem />
          </Fab>
        </Tooltip>
        <Tooltip title="Contact Medical Staff" placement="left">
          <Fab
            color="primary"
            size="large"
            onClick={handleContact}
          >
            <Chat />
          </Fab>
        </Tooltip>
      </Box>

      {/* Header Section */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Person sx={{ fontSize: 40 }} />
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" gutterBottom>
              Welcome back, {patientData.firstName}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Your health journey continues with dedicated support from our medical team
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip 
                icon={<LocalHospital />} 
                label={`Assigned Doctor: ${getStaffName(patientData.assignedDoctor, 'doctor')}`} 
                sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }} 
              />
              <Chip 
                icon={<Group />} 
                label={`Medical Buddy: ${getStaffName(patientData.assignedBuddy, 'buddy')}`} 
                sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.2)' }} 
              />
              <Chip 
                icon={<Person />} 
                label={`Nurse: ${getStaffName(patientData.assignedNurse, 'nurse')}`} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} 
              />
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Logout />}
              onClick={handleLogout}
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Logout
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Dashboard Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Overview" icon={<Assessment />} />
          <Tab label="Progress Tracking" icon={<Timeline />} />
          <Tab label="Chat & Support" icon={<Message />} />
          <Tab label="Sessions" icon={<FitnessCenter />} />
          <Tab label="Treatment Plan" icon={<LocalHospital />} />
          <Tab label="Buddy Reviews" icon={<RateReview />} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="primary">
                  {patientData.totalSessions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {patientData.completedSessions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {patientData.upcomingSessions?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Sessions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="info.main">
                  {patientData.treatmentPlan?.progress || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Treatment Progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overall Progress Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="physical" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="mental" stroke="#82ca9d" strokeWidth={3} />
                    <Line type="monotone" dataKey="mood" stroke="#ffc658" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Mood Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mood Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Progress Update Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Update Your Progress
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Track your daily progress. Medical buddy can review and doctor approval is required for major updates.
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Physical Progress: {progressData.physicalProgress}%</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.physicalProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressData.physicalProgress}
                    onChange={(e) => setProgressData(prev => ({ ...prev, physicalProgress: parseInt(e.target.value) }))}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Mental Progress: {progressData.mentalProgress}%</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.mentalProgress} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressData.mentalProgress}
                    onChange={(e) => setProgressData(prev => ({ ...prev, mentalProgress: parseInt(e.target.value) }))}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Pain Level: {progressData.painLevel}/10</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressData.painLevel * 10} 
                    color="error"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={progressData.painLevel}
                    onChange={(e) => setProgressData(prev => ({ ...prev, painLevel: parseInt(e.target.value) }))}
                    style={{ width: '100%', marginTop: 8 }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Mood: {progressData.mood}/10</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <IconButton
                        key={value}
                        size="small"
                        onClick={() => setProgressData(prev => ({ ...prev, mood: value }))}
                        color={progressData.mood >= value ? 'primary' : 'default'}
                      >
                        {progressData.mood >= value ? <Star /> : <StarBorder />}
                      </IconButton>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Energy Level: {progressData.energy}/10</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <IconButton
                        key={value}
                        size="small"
                        onClick={() => setProgressData(prev => ({ ...prev, energy: value }))}
                        color={progressData.energy >= value ? 'success' : 'default'}
                      >
                        {progressData.energy >= value ? <Star /> : <StarBorder />}
                      </IconButton>
                    ))}
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={progressData.notes}
                  onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setProgressUpdateDialog(true)}
                  startIcon={<TrendingUp />}
                >
                  Submit Progress Update
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Progress History */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Progress History
                </Typography>
                <List>
                  {approvalRequests.slice(-5).reverse().map((request) => (
                    <ListItem key={request.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: request.status === 'approved' ? 'success.main' : 'warning.main' }}>
                          {request.status === 'approved' ? <CheckCircle /> : <Pending />}
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
                              Status: {request.status === 'approved' ? 'Approved by Doctor' : 'Pending Approval'}
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
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Enhanced Chat Interface */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 600, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
              {/* Chat Header */}
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  <LocalHospital />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Medical Team Chat
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    🟢 Connected to your care team
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <Phone />
                  </IconButton>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <VideoCall />
                  </IconButton>
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Chat Messages */}
                <Box sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto', 
                  p: 2, 
                  bgcolor: 'grey.50',
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '3px',
                  },
                }}>
                  {chatMessages.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: 'text.secondary'
                    }}>
                      <Chat sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                      <Typography variant="h5" gutterBottom>
                        Welcome to your medical chat!
                      </Typography>
                      <Typography variant="body1" textAlign="center" sx={{ mb: 2 }}>
                        Start a conversation with your medical team
                      </Typography>
                      <Typography variant="body2" textAlign="center" color="text.secondary">
                        Your medical buddy, doctors, and nurses are here to help
                      </Typography>
                    </Box>
                  ) : (
                    chatMessages.map((msg, index) => {
                      // Determine if message is from patient or staff
                      const isFromPatient = msg.sender === 'patient' || msg.senderId === profile?.uid;
                      const isFromStaff = !isFromPatient;
                      const isLastMessage = index === chatMessages.length - 1;
                      
                      // Get sender name - handle different message formats
                      let senderName = msg.senderName || 'Unknown';
                      if (isFromStaff && msg.senderRole) {
                        // For staff messages, show role + name
                        const roleDisplay = msg.senderRole === 'buddy' ? 'Medical Buddy' : 
                                          msg.senderRole === 'doctor' ? 'Doctor' : 
                                          msg.senderRole === 'nurse' ? 'Nurse' : msg.senderRole;
                        senderName = `${roleDisplay}: ${msg.senderName || 'Staff Member'}`;
                      }
                      
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent: isFromPatient ? 'flex-end' : 'flex-start',
                            mb: 2,
                            animation: isLastMessage ? 'fadeInUp 0.3s ease-out' : 'none',
                            '@keyframes fadeInUp': {
                              '0%': {
                                opacity: 0,
                                transform: 'translateY(10px)',
                              },
                              '100%': {
                                opacity: 1,
                                transform: 'translateY(0)',
                              },
                            },
                          }}
                        >
                          {!isFromPatient && (
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                mr: 1, 
                                bgcolor: isFromStaff && msg.senderRole === 'buddy' ? 'secondary.main' : 
                                         isFromStaff && msg.senderRole === 'doctor' ? 'error.main' :
                                         isFromStaff && msg.senderRole === 'nurse' ? 'info.main' : 'primary.main',
                                fontSize: '0.875rem'
                              }}
                            >
                              {msg.senderRole === 'buddy' ? 'B' : 
                               msg.senderRole === 'doctor' ? 'D' : 
                               msg.senderRole === 'nurse' ? 'N' : 'S'}
                            </Avatar>
                          )}
                          
                          <Box sx={{ maxWidth: '70%' }}>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                bgcolor: isFromPatient ? 'primary.main' : 'white',
                                color: isFromPatient ? 'white' : 'text.primary',
                                borderRadius: isFromPatient ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                position: 'relative',
                                border: isFromStaff ? '1px solid' : 'none',
                                borderColor: 'divider',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  [isFromPatient ? 'right' : 'left']: -8,
                                  width: 0,
                                  height: 0,
                                  border: `8px solid transparent`,
                                  borderTopColor: isFromPatient ? 'primary.main' : 'white',
                                  borderBottom: 'none',
                                  borderLeft: 'none',
                                  borderRight: 'none',
                                  transform: 'rotate(45deg)',
                                }
                              }}
                            >
                              {isFromStaff && (
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    mb: 1,
                                    color: msg.senderRole === 'buddy' ? 'secondary.main' : 
                                           msg.senderRole === 'doctor' ? 'error.main' :
                                           msg.senderRole === 'nurse' ? 'info.main' : 'primary.main'
                                  }}
                                >
                                  {senderName}
                                </Typography>
                              )}
                              <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                                {msg.content}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  opacity: 0.7, 
                                  display: 'block',
                                  mt: 1,
                                  textAlign: isFromPatient ? 'right' : 'left'
                                }}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </Paper>
                          </Box>
                          
                          {isFromPatient && (
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                ml: 1, 
                                bgcolor: 'primary.dark',
                                fontSize: '0.875rem'
                              }}
                            >
                              {patientData?.firstName?.charAt(0) || 'P'}
                            </Avatar>
                          )}
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* Enhanced Message Input */}
                <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <EmojiEmotions />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <AttachFile />
                      </IconButton>
                    </Box>
                    
                    <TextField
                      fullWidth
                      placeholder="Type your message to your medical team..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      multiline
                      maxRows={4}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          },
                        },
                      }}
                    />
                    
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      startIcon={<Send />}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        minWidth: 'auto',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      Send
                    </Button>
                  </Box>
                  
                  {/* Typing indicator or status */}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Press Enter to send, Shift+Enter for new line
                    </Typography>
                    <Chip 
                      label="Connected to Medical Team" 
                      size="small" 
                      color="success" 
                      icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VideoCall />}
                  sx={{ mb: 2, borderRadius: 2, py: 1.5 }}
                >
                  Start Video Call
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VoiceChat />}
                  sx={{ mb: 2, borderRadius: 2, py: 1.5 }}
                >
                  Voice Call
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  sx={{ mb: 2, borderRadius: 2, py: 1.5 }}
                >
                  Schedule Session
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Assessment />}
                  onClick={() => setProgressUpdateDialog(true)}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Update Progress
                </Button>
              </CardContent>
            </Card>

            {/* Chat Tips */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'info.main', fontWeight: 600 }}>
                  💡 Chat Tips
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Be specific about your symptoms
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Ask questions about your treatment
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Report any side effects
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Share your progress updates
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Session Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Session Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#8884d8" />
                    <Bar dataKey="total" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Session History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Sessions
                </Typography>
                <List>
                  {patientData.sessionHistory?.slice(-5).reverse().map((session) => (
                    <ListItem key={session.id} divider>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: session.status === 'completed' ? 'success.main' : 'warning.main' }}>
                          {session.status === 'completed' ? <CheckCircle /> : <Pending />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={session.type}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              Date: {new Date(session.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2">
                              Duration: {session.duration} minutes
                            </Typography>
                            <Typography variant="body2">
                              Status: {session.status}
                            </Typography>
                            {session.rating && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Typography variant="body2" sx={{ mr: 1 }}>
                                  Rating:
                                </Typography>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    color={star <= session.rating ? 'primary' : 'disabled'}
                                    fontSize="small"
                                  />
                                ))}
                              </Box>
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
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          {/* Treatment Plan Overview */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Treatment Plan
                </Typography>
                
                {patientData.treatmentPlan ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Diagnosis:</strong> {patientData.treatmentPlan.diagnosis || 'Not specified'}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Current Phase:</strong> {patientData.treatmentPlan.currentPhase || 'Initial'}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Start Date:</strong> {new Date(patientData.treatmentPlan.startDate).toLocaleDateString()}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Estimated Duration:</strong> {patientData.treatmentPlan.estimatedDuration || '3 months'}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Progress:</strong> {patientData.treatmentPlan.progress || 0}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={patientData.treatmentPlan.progress || 0} 
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Notes:</strong> {patientData.treatmentPlan.notes || 'No additional notes'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No treatment plan available. Please contact your doctor.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Treatment Goals */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Treatment Goals
                </Typography>
                
                {patientData.treatmentPlan?.treatmentGoals?.length > 0 ? (
                  <List>
                    {patientData.treatmentPlan.treatmentGoals.map((goal, index) => (
                      <ListItem key={index}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <CheckCircle />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={goal} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific goals set yet. Your doctor will define treatment goals.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Milestones and Achievements */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Milestones & Achievements
                </Typography>
                
                {patientData.milestones?.length > 0 ? (
                  <Grid container spacing={2}>
                    {patientData.milestones.map((milestone) => (
                      <Grid item xs={12} md={4} key={milestone.id}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                          <Typography variant="h6">{milestone.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {milestone.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(milestone.date).toLocaleDateString()}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No milestones achieved yet. Keep working towards your goals!
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Buddy Reviews
                  </Typography>
                  {patientData?.assignedBuddy && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RateReview />}
                      onClick={() => handleBuddyReview(patientData.assignedBuddy)}
                    >
                      Review My Buddy
                    </Button>
                  )}
                </Box>
                
                {patientData?.assignedBuddy ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      You can review your assigned medical buddy: {getStaffName(patientData.assignedBuddy, 'buddy')}
                    </Typography>
                    
                    {patientData.buddyReviews && patientData.buddyReviews.length > 0 ? (
                      <List>
                        {patientData.buddyReviews.slice(-5).reverse().map((review) => (
                          <ListItem key={review.id} divider>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <RateReview />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`Review from ${review.buddyName} on ${new Date(review.timestamp).toLocaleDateString()}`}
                              secondary={
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                      Overall Rating:
                                    </Typography>
                                    <Rating value={review.rating} readOnly size="small" />
                                  </Box>
                                  {review.communication > 0 && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      Communication: <Rating value={review.communication} readOnly size="small" />
                                    </Typography>
                                  )}
                                  {review.professionalism > 0 && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      Professionalism: <Rating value={review.professionalism} readOnly size="small" />
                                    </Typography>
                                  )}
                                  {review.effectiveness > 0 && (
                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                      Effectiveness: <Rating value={review.effectiveness} readOnly size="small" />
                                    </Typography>
                                  )}
                                  {review.comments && (
                                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                      "{review.comments}"
                                    </Typography>
                                  )}
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Status: {review.status}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <RateReview sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          No Reviews Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          You haven't submitted any reviews for your medical buddy yet.
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={() => handleBuddyReview(patientData.assignedBuddy)}
                        >
                          Submit Your First Review
                        </Button>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Buddy Assigned
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You don't have a medical buddy assigned yet. Please contact the receptionist.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Progress Update Dialog */}
      <Dialog open={progressUpdateDialog} onClose={() => setProgressUpdateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Progress</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Physical Progress: {progressData.physicalProgress}%
              </Typography>
              <Slider
                value={progressData.physicalProgress}
                onChange={(e, value) => setProgressData(prev => ({ ...prev, physicalProgress: value }))}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Mental Progress: {progressData.mentalProgress}%
              </Typography>
              <Slider
                value={progressData.mentalProgress}
                onChange={(e, value) => setProgressData(prev => ({ ...prev, mentalProgress: value }))}
                min={0}
                max={100}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0%' },
                  { value: 25, label: '25%' },
                  { value: 50, label: '50%' },
                  { value: 75, label: '75%' },
                  { value: 100, label: '100%' },
                  { value: 100, label: '100%' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Pain Level: {progressData.painLevel}/10
              </Typography>
              <Slider
                value={progressData.painLevel}
                onChange={(e, value) => setProgressData(prev => ({ ...prev, painLevel: value }))}
                min={0}
                max={10}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: 'No Pain' },
                  { value: 5, label: 'Moderate' },
                  { value: 10, label: 'Severe' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Mood: {progressData.mood}/10
              </Typography>
              <Slider
                value={progressData.mood}
                onChange={(e, value) => setProgressData(prev => ({ ...prev, mood: value }))}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: 'Poor' },
                  { value: 5, label: 'Neutral' },
                  { value: 10, label: 'Excellent' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Energy Level: {progressData.energy}/10
              </Typography>
              <Slider
                value={progressData.energy}
                onChange={(e, value) => setProgressData(prev => ({ ...prev, energy: value }))}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                marks={[
                  { value: 1, label: 'Low' },
                  { value: 5, label: 'Moderate' },
                  { value: 10, label: 'High' }
                ]}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Notes"
                value={progressData.notes}
                onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describe your current condition, any concerns, or observations..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleProgressUpdate} variant="contained" color="primary">
            Submit Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Buddy Review Dialog */}
      <Dialog open={buddyReviewDialog} onClose={() => setBuddyReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Medical Buddy</DialogTitle>
        <DialogContent>
          {selectedBuddy && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Reviewing: {selectedBuddy.firstName} {selectedBuddy.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please provide your honest feedback about your medical buddy's performance
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Rating *
              </Typography>
              <Rating
                value={reviewData.rating}
                onChange={(e, value) => setReviewData(prev => ({ ...prev, rating: value }))}
                size="large"
                precision={0.5}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Communication Skills
              </Typography>
              <Rating
                value={reviewData.communication}
                onChange={(e, value) => setReviewData(prev => ({ ...prev, communication: value }))}
                precision={0.5}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Professionalism
              </Typography>
              <Rating
                value={reviewData.professionalism}
                onChange={(e, value) => setReviewData(prev => ({ ...prev, professionalism: value }))}
                precision={0.5}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Effectiveness
              </Typography>
              <Rating
                value={reviewData.effectiveness}
                onChange={(e, value) => setReviewData(prev => ({ ...prev, effectiveness: value }))}
                precision={0.5}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Additional Comments"
                value={reviewData.comments}
                onChange={(e) => setReviewData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Share your experience, suggestions, or any specific feedback..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuddyReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleReviewSubmit} variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onClose={() => setContactDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Medical Staff</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose how you'd like to contact your medical team:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Phone />}
                onClick={() => handleContactSubmit('phone', 'Requesting phone call')}
                sx={{ height: 80 }}
              >
                Phone Call
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<VideoCall />}
                onClick={() => handleContactSubmit('video', 'Requesting video call')}
                sx={{ height: 80 }}
              >
                Video Call
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Message />}
                onClick={() => handleContactSubmit('message', 'General inquiry')}
                sx={{ height: 80 }}
              >
                Message
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ReportProblem />}
                onClick={() => handleContactSubmit('urgent', 'Urgent matter')}
                sx={{ height: 80 }}
              >
                Urgent Matter
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>Cancel</Button>
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

export default PatientDashboard; 