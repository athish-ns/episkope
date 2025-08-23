import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  LinearProgress,
  Alert,
  Paper,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Slider,
  CardActions
} from '@mui/material'
import {
  Send,
  FitnessCenter,
  Psychology,
  EmojiEmotions,
  TrendingUp,
  Message,
  Phone,
  VideoCall,
  LocationOn,
  Warning,
  CheckCircle,
  Star,
  ExpandMore,
  Add,
  Edit,
  Delete,
  Notifications,
  Schedule,
  Assessment,
  DirectionsRun,
  Favorite,
  ThumbUp,
  ThumbDown,
  AttachFile
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const PatientInteraction = () => {
  const { profile } = useAuthStore()
  const { patients, sessions, updateSession, addSession } = useStore()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [chatMessage, setChatMessage] = useState('')
  const [openConcernDialog, setOpenConcernDialog] = useState(false)
  const [openMotivationDialog, setOpenMotivationDialog] = useState(false)

  // Concern reporting state
  const [concernData, setConcernData] = useState({
    type: 'medical',
    severity: 'medium',
    description: '',
    urgency: 'normal'
  })

  // Motivation tracking state
  const [motivationData, setMotivationData] = useState({
    level: 3,
    factors: [],
    goals: '',
    encouragement: ''
  })

  const messagesEndRef = useRef(null)
  const buddyPatients = patients.filter(p => p.assignedBuddy === profile?.uid)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedPatient])

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedPatient) return

    try {
      console.log('🔍 Debug: Starting message send process...');
      console.log('🔍 Debug: selectedPatient:', selectedPatient);
      console.log('🔍 Debug: selectedPatient.id:', selectedPatient.id);
      console.log('🔍 Debug: selectedPatient.uid:', selectedPatient.uid);
      
      const messageData = {
        id: Date.now().toString(),
        senderId: profile.uid,
        senderName: profile.displayName || profile.name || `${profile.firstName} ${profile.lastName}`,
        senderRole: 'buddy',
        content: chatMessage,
        timestamp: new Date().toISOString(),
        type: 'text'
      }

      console.log('🔍 Debug: Message data created:', messageData);

      // Add message to patient's chat history
      const updatedChatHistory = [...(selectedPatient.chatHistory || []), messageData];
      
      // Determine the correct patient ID to use
      // Patients might be stored with either 'id' or 'uid' field
      const patientIdToUse = selectedPatient.id || selectedPatient.uid;
      
      if (!patientIdToUse) {
        console.error('❌ No valid patient ID found');
        toast.error('Patient ID not found. Please refresh and try again.');
        return;
      }
      
      console.log('🔍 Debug: Using patient ID:', patientIdToUse);
      
      // Update patient in the database with the new chat history
      try {
        const { updatePatient } = useStore.getState();
        
        console.log('🔍 Debug: Calling updatePatient with ID:', patientIdToUse);
        const updateResult = await updatePatient(patientIdToUse, { 
          chatHistory: updatedChatHistory 
        });
        
        console.log('🔍 Debug: Update result:', updateResult);
        
        if (updateResult.success) {
          // Update local state to show the message immediately
          setSelectedPatient(prev => ({
            ...prev,
            chatHistory: updatedChatHistory
          }));
          
          console.log('✅ Message saved to patient chat history:', messageData);
          setChatMessage('');
          toast.success('Message sent successfully');
        } else {
          console.error('❌ Failed to update patient:', updateResult.error);
          toast.error(`Message sent but failed to save: ${updateResult.error}`);
        }
        
      } catch (updateError) {
        console.error('❌ Error updating patient chat history:', updateError);
        toast.error(`Message sent but failed to save: ${updateError.message}`);
      }
      
    } catch (error) {
      toast.error('Error sending message');
      console.error('Error sending message:', error);
    }
  }



  const handleConcernSubmit = async () => {
    try {
      const concernReport = {
        patientId: selectedPatient.id,
        buddyId: profile.uid,
        concernData,
        reportedAt: new Date().toISOString(),
        status: 'reported',
        priority: concernData.urgency === 'urgent' ? 'high' : 'normal'
      }

      // This would typically be sent to nurses/doctors
      console.log('Concern reported:', concernReport)
      
      setOpenConcernDialog(false)
      setConcernData({
        type: 'medical',
        severity: 'medium',
        description: '',
        urgency: 'normal'
      })
      toast.success('Concern reported successfully')
    } catch (error) {
      toast.error('Error reporting concern')
      console.error('Error reporting concern:', error)
    }
  }

  const handleMotivationSubmit = async () => {
    try {
      const motivationEntry = {
        patientId: selectedPatient.id,
        buddyId: profile.uid,
        motivationData,
        recordedAt: new Date().toISOString(),
        type: 'motivation_tracking'
      }

      // This would typically be stored in the database
      console.log('Motivation recorded:', motivationEntry)
      
      setOpenMotivationDialog(false)
      setMotivationData({
        level: 3,
        factors: [],
        goals: '',
        encouragement: ''
      })
      toast.success('Motivation level recorded')
    } catch (error) {
      toast.error('Error recording motivation')
      console.error('Error recording motivation:', error)
    }
  }

  const getPatientStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'default'
      case 'emergency': return 'error'
      default: return 'default'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'normal': return 'info'
      default: return 'default'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
              Patient Communication
            </Typography>
            {selectedPatient ? (
              <Box>
                {/* Enhanced Chat Interface */}
                <Paper 
                  elevation={3}
                  sx={{ 
                    height: 500, 
                    overflow: 'hidden', 
                    mb: 2, 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {/* Chat Header */}
                  <Box 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
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
                      {selectedPatient.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {selectedPatient.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {selectedPatient.status === 'active' ? '🟢 Online' : '⚪ Offline'}
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
                  
                  {/* Chat Messages Container */}
                  <Box 
                    sx={{ 
                      height: 380, 
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
                    }}
                  >
                    {(selectedPatient.chatHistory || []).length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.secondary'
                      }}>
                        <Message sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="h6" gutterBottom>
                          Start a conversation
                        </Typography>
                        <Typography variant="body2" textAlign="center">
                          Send your first message to {selectedPatient.name} to begin your communication
                        </Typography>
                      </Box>
                    ) : (
                      (selectedPatient.chatHistory || []).map((message, index) => {
                        const isFromBuddy = message.senderRole === 'buddy';
                        const isLastMessage = index === (selectedPatient.chatHistory || []).length - 1;
                        
                        return (
                          <Box
                            key={message.id}
                            sx={{
                              display: 'flex',
                              justifyContent: isFromBuddy ? 'flex-end' : 'flex-start',
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
                            {!isFromBuddy && (
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1, 
                                  bgcolor: 'secondary.main',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {selectedPatient.name?.charAt(0)}
                              </Avatar>
                            )}
                            
                            <Box sx={{ maxWidth: '70%' }}>
                              <Paper
                                elevation={1}
                                sx={{
                                  p: 2,
                                  bgcolor: isFromBuddy ? 'primary.main' : 'white',
                                  color: isFromBuddy ? 'white' : 'text.primary',
                                  borderRadius: isFromBuddy ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    [isFromBuddy ? 'right' : 'left']: -8,
                                    width: 0,
                                    height: 0,
                                    border: `8px solid transparent`,
                                    borderTopColor: isFromBuddy ? 'primary.main' : 'white',
                                    borderBottom: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    transform: 'rotate(45deg)',
                                  }
                                }}
                              >
                                <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                                  {message.content}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    opacity: 0.7, 
                                    display: 'block',
                                    mt: 1,
                                    textAlign: isFromBuddy ? 'right' : 'left'
                                  }}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </Typography>
                              </Paper>
                            </Box>
                            
                            {isFromBuddy && (
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  ml: 1, 
                                  bgcolor: 'primary.dark',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {profile?.displayName?.charAt(0) || profile?.firstName?.charAt(0) || 'B'}
                              </Avatar>
                            )}
                          </Box>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </Box>
                </Paper>

                {/* Enhanced Message Input */}
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 2, 
                    borderRadius: 3,
                    bgcolor: 'white',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
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
                      placeholder="Type your message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
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
                      disabled={!chatMessage.trim()}
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
                      <Send />
                    </Button>
                  </Box>
                  
                  {/* Typing indicator or status */}
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Press Enter to send, Shift+Enter for new line
                    </Typography>
                    <Chip 
                      label="Connected" 
                      size="small" 
                      color="success" 
                      icon={<CheckCircle sx={{ fontSize: 16 }} />}
                    />
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: 400,
                bgcolor: 'grey.50',
                borderRadius: 3,
                border: '2px dashed',
                borderColor: 'divider'
              }}>
                <Message sx={{ fontSize: 64, mb: 2, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Select a patient to start communicating
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Choose a patient from the list to begin your conversation
                </Typography>
              </Box>
            )}
          </Box>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Exercise Guidance
            </Typography>
            {selectedPatient ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Current Exercise Plan
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Last updated: {selectedPatient.lastExerciseUpdate || 'Never'}
                        </Typography>
                      </Box>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Exercise sessions are scheduled by your assigned doctor based on the treatment plan.
                      </Alert>
                      <Typography variant="body2" color="text.secondary">
                        You can guide patients through assigned exercises but cannot schedule new ones.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Exercise Progress
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Weekly Goal: 3 sessions
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={70}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          2 of 3 sessions completed
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Select a patient to view exercise guidance
              </Alert>
            )}
          </Box>
        )
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Motivation & Support
            </Typography>
            {selectedPatient ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Motivation Level
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          Current Level: {selectedPatient.motivationLevel || 'Not recorded'}
                        </Typography>
                        <Rating
                          value={selectedPatient.motivationLevel || 0}
                          readOnly
                          size="large"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<EmojiEmotions />}
                        onClick={() => setOpenMotivationDialog(true)}
                        fullWidth
                      >
                        Record Motivation Level
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Encouragement Tools
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<TrendingUp />}
                          size="small"
                        >
                          Send Progress Reminder
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Star />}
                          size="small"
                        >
                          Celebrate Achievement
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Favorite />}
                          size="small"
                        >
                          Send Encouragement
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Select a patient to view motivation tools
              </Alert>
            )}
          </Box>
        )
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Feedback & Concerns
            </Typography>
            {selectedPatient ? (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Recent Feedback
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Last feedback: {selectedPatient.lastFeedback || 'No feedback yet'}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        startIcon={<Assessment />}
                        fullWidth
                      >
                        Request Feedback
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Report Concern
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Report any patient concerns to medical staff
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="warning"
                        startIcon={<Warning />}
                        onClick={() => setOpenConcernDialog(true)}
                        fullWidth
                      >
                        Report Concern
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Select a patient to view feedback and concerns
              </Alert>
            )}
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Interaction
      </Typography>

      <Grid container spacing={3}>
        {/* Patient List */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Assigned Patients
              </Typography>
              <List>
                {buddyPatients.map((patient) => (
                  <ListItem
                    key={patient.id}
                    button
                    selected={selectedPatient?.id === patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {patient.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={patient.name}
                      secondary={
                        <Box>
                          <Chip
                            label={patient.status}
                            size="small"
                            color={getPatientStatusColor(patient.status)}
                            sx={{ mr: 1 }}
                          />
                          <Typography variant="caption" display="block">
                            {patient.condition}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemIcon>
                      <Badge badgeContent={patient.unreadMessages || 0} color="primary">
                        <Message />
                      </Badge>
                    </ListItemIcon>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {/* Patient Info Header */}
              {selectedPatient && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                        {selectedPatient.name?.charAt(0)}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6">{selectedPatient.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedPatient.condition} • {selectedPatient.age} years old
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          icon={<Phone />}
                          label="Call"
                          size="small"
                          variant="outlined"
                          clickable
                        />
                        <Chip
                          icon={<VideoCall />}
                          label="Video Call"
                          size="small"
                          variant="outlined"
                          clickable
                        />
                        <Chip
                          icon={<LocationOn />}
                          label="Location"
                          size="small"
                          variant="outlined"
                          clickable
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Navigation Tabs */}
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Communication" />
                <Tab label="Exercise Guidance" />
                <Tab label="Motivation" />
                <Tab label="Feedback & Concerns" />
              </Tabs>

              <Box sx={{ mt: 2 }}>
                {renderTabContent()}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Concern Dialog */}
      <Dialog open={openConcernDialog} onClose={() => setOpenConcernDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Patient Concern</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Concern Type</InputLabel>
                <Select
                  value={concernData.type}
                  onChange={(e) => setConcernData({ ...concernData, type: e.target.value })}
                  label="Concern Type"
                >
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="behavioral">Behavioral</MenuItem>
                  <MenuItem value="emotional">Emotional</MenuItem>
                  <MenuItem value="safety">Safety</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={concernData.severity}
                  onChange={(e) => setConcernData({ ...concernData, severity: e.target.value })}
                  label="Severity"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Urgency</InputLabel>
                <Select
                  value={concernData.urgency}
                  onChange={(e) => setConcernData({ ...concernData, urgency: e.target.value })}
                  label="Urgency"
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={concernData.description}
                onChange={(e) => setConcernData({ ...concernData, description: e.target.value })}
                placeholder="Please describe the concern in detail..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConcernDialog(false)}>Cancel</Button>
          <Button onClick={handleConcernSubmit} variant="contained" color="warning">
            Report Concern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Motivation Dialog */}
      <Dialog open={openMotivationDialog} onClose={() => setOpenMotivationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Record Motivation Level</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Current Motivation Level
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Rating
                  value={motivationData.level}
                  onChange={(e, newValue) => setMotivationData({ ...motivationData, level: newValue })}
                  size="large"
                />
                <Typography variant="h6">
                  {motivationData.level}/5
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivational Factors"
                multiline
                rows={2}
                value={motivationData.factors.join(', ')}
                onChange={(e) => setMotivationData({ 
                  ...motivationData, 
                  factors: e.target.value.split(',').map(f => f.trim()).filter(f => f)
                })}
                placeholder="What factors are affecting motivation? (comma-separated)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goals & Aspirations"
                multiline
                rows={2}
                value={motivationData.goals}
                onChange={(e) => setMotivationData({ ...motivationData, goals: e.target.value })}
                placeholder="What are the patient's current goals?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Encouragement Notes"
                multiline
                rows={3}
                value={motivationData.encouragement}
                onChange={(e) => setMotivationData({ ...motivationData, encouragement: e.target.value })}
                placeholder="Notes for encouragement and support..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMotivationDialog(false)}>Cancel</Button>
          <Button onClick={handleMotivationSubmit} variant="contained">
            Record Motivation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PatientInteraction 