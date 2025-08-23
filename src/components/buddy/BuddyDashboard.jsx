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
  LinearProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem
} from '@mui/material'
import {
  Person,
  Assessment,
  Star,
  Logout,
  Add,
  TrendingUp,
  TrendingDown,
  EmojiEvents,
  Summarize,
  ExpandMore
} from '@mui/icons-material'
import useStore from '../../store'
import { toast } from 'react-hot-toast'
import SessionManagement from './SessionManagement'
import PatientInteraction from './PatientInteraction'
import PerformanceTracking from './PerformanceTracking'
import PatientProgressControl from './PatientProgressControl'
import useAuthStore from '../../store/authStore'
import NotificationCenter from '../common/NotificationCenter'
import groqService from '../../services/groqService'

const BuddyDashboard = () => {
  const { profile, logout } = useAuthStore();
  const { patients, sessions, stats, users } = useStore();
  const [activeTab, setActiveTab] = useState(0);
  const [summaryDialog, setSummaryDialog] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [summaryType, setSummaryType] = useState('reviews');

  const handleLogout = () => {
    logout();
  };

  const buddyStats = stats?.buddy || {
    totalSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    assignedPatients: 0
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold':
        return 'warning'
      case 'Silver':
        return 'info'
      case 'Bronze':
        return 'error'
      default:
        return 'default'
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Gold':
        return '🥇'
      case 'Silver':
        return '🥈'
      case 'Bronze':
        return '🥉'
      default:
        return '🥉'
    }
  }

  // Review Summary Functions
  const handleGenerateSummary = async () => {
    if (!groqService.isConfigured()) {
      toast.error('Groq API not configured. Please contact administrator.');
      return;
    }

    setSummaryLoading(true);
    setSummaryResult(null);

    try {
      let summaryData;
      
      if (summaryType === 'reviews') {
        // Get all reviews for this buddy
        const buddyReviews = [];
        patients.forEach(patient => {
          if (patient.buddyReviews) {
            const patientReviews = patient.buddyReviews.filter(review => review.buddyId === profile.uid);
            buddyReviews.push(...patientReviews);
          }
        });
        
        if (buddyReviews.length === 0) {
          toast.error('No reviews found to summarize.');
          setSummaryLoading(false);
          return;
        }
        
        summaryData = await groqService.summarizeReviews(buddyReviews);
      } else if (summaryType === 'sessions') {
        // Get all session notes for this buddy
        const buddySessions = sessions.filter(session => session.buddyId === profile.uid);
        
        if (buddySessions.length === 0) {
          toast.error('No session notes found to summarize.');
          setSummaryLoading(false);
          return;
        }
        
        summaryData = await groqService.summarizeSessionNotes(buddySessions);
      }

      if (summaryData.success) {
        setSummaryResult(summaryData);
        toast.success('Summary generated successfully!');
      } else {
        setSummaryResult({
          success: false,
          summary: summaryData.fallback,
          error: summaryData.error,
          isFallback: true
        });
        toast.warning('API failed, showing fallback summary.');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary. Please try again.');
      setSummaryResult({
        success: false,
        summary: 'Failed to generate summary. Please try again later.',
        error: error.message
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const resetSummary = () => {
    setSummaryResult(null);
    setSummaryType('reviews');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <SessionManagement />
      case 1:
        return <PatientInteraction />
      case 2:
        return <PerformanceTracking />
      case 3:
        return <PatientProgressControl />
      case 4:
        return (
          <Box sx={{ p: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Review Summary
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Summarize />}
                    onClick={() => setSummaryDialog(true)}
                  >
                    Generate Summary
                  </Button>
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Use AI-powered summarization to get insights from your patient reviews and session notes.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Patient Reviews
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Summarize feedback from patient reviews to identify areas for improvement.
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSummaryType('reviews');
                            setSummaryDialog(true);
                          }}
                        >
                          Summarize Reviews
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Session Notes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Get insights from your session notes and patient interactions.
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSummaryType('sessions');
                            setSummaryDialog(true);
                          }}
                        >
                          Summarize Notes
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {summaryResult && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Latest Summary
                    </Typography>
                    <Card variant="outlined">
                      <CardContent>
                        {summaryResult.isFallback && (
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            API unavailable - showing fallback summary
                          </Alert>
                        )}
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {summaryResult.summary}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`Type: ${summaryType === 'reviews' ? 'Patient Reviews' : 'Session Notes'}`} 
                            color="primary" 
                            variant="outlined" 
                          />
                          {summaryResult.originalLength > 0 && (
                            <Chip 
                              label={`Original: ${summaryResult.originalLength} chars`} 
                              color="secondary" 
                              variant="outlined" 
                            />
                          )}
                          {summaryResult.summaryLength > 0 && (
                            <Chip 
                              label={`Summary: ${summaryResult.summaryLength} chars`} 
                              color="success" 
                              variant="outlined" 
                            />
                          )}
                          {summaryResult.model && (
                            <Chip 
                              label={`Model: ${summaryResult.model}`} 
                              color="info" 
                              variant="outlined" 
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )
      default:
        return <SessionManagement />
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'success.main' }}>
        <Toolbar>
          <Person sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Medical Buddy Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Typography variant="body2">
              {getTierIcon(profile?.tier || 'Bronze')} {profile?.tier || 'Bronze'} Tier
            </Typography>
            <Chip 
              label={profile?.tier || 'Bronze'} 
              size="small" 
              color={getTierColor(profile?.tier || 'Bronze')}
            />
          </Box>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {profile?.name}
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
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {buddyStats?.assignedPatients || 0}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Assigned Patients
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Assessment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {buddyStats?.completedSessions || 0}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Total Sessions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Star />
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star fontSize="small" color="warning" />
                      <Typography variant="h4" component="div">
                        {buddyStats?.averageRating || 0}
                      </Typography>
                    </Box>
                    <Typography color="text.secondary" variant="body2">
                      Avg Rating
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <TrendingUp />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {buddyStats?.totalSessions || 0}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Today's Sessions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Tier Progress */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <EmojiEvents fontSize="large" color="warning" />
                  <Box>
                    <Typography variant="h6">
                      Tier Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current: {profile?.tier || 'Bronze'} Tier • Sessions: {buddyStats?.totalSessions || 0}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Progress to Next Tier</Typography>
                    <Typography variant="body2">
                      {buddyStats?.totalSessions || 0}/15 sessions
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(((buddyStats?.totalSessions || 0) / 15) * 100, 100)} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip 
                    label="🥉 Bronze (0-9 sessions)" 
                    variant={(profile?.tier || 'Bronze') === 'Bronze' ? 'filled' : 'outlined'}
                    color={(profile?.tier || 'Bronze') === 'Bronze' ? 'error' : 'default'}
                  />
                  <Chip 
                    label="🥈 Silver (10+ sessions, 4.0+ rating)" 
                    variant={(profile?.tier || 'Bronze') === 'Silver' ? 'filled' : 'outlined'}
                    color={(profile?.tier || 'Bronze') === 'Silver' ? 'info' : 'default'}
                  />
                  <Chip 
                    label="🥇 Gold (15+ sessions, 4.8+ rating)" 
                    variant={(profile?.tier || 'Bronze') === 'Gold' ? 'filled' : 'outlined'}
                    color={(profile?.tier || 'Bronze') === 'Gold' ? 'warning' : 'default'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Navigation Tabs */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ flexGrow: 1 }}>
                  <Tab label="Session Management" />
                  <Tab label="Patient Interaction" />
                  <Tab label="Performance Tracking" />
                  <Tab label="Patient Progress Control" />
                  <Tab label="Review Summary" />
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

      {/* Summary Generation Dialog */}
      <Dialog open={summaryDialog} onClose={() => setSummaryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Generate AI Summary
          <Typography variant="body2" color="text.secondary">
            {summaryType === 'reviews' ? 'Summarize patient reviews' : 'Summarize session notes'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              This will use the Groq AI API to generate a concise summary of your {summaryType === 'reviews' ? 'patient reviews' : 'session notes'}.
            </Typography>
            
            {!groqService.isConfigured() && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Groq API key not configured. Please contact your administrator to set up the REACT_APP_GROQ_API_KEY environment variable.
              </Alert>
            )}
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Summary Type"
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value)}
                disabled={summaryLoading}
              >
                <MenuItem value="reviews">Patient Reviews</MenuItem>
                <MenuItem value="sessions">Session Notes</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Summary Preview"
                value={summaryResult?.summary || ''}
                InputProps={{
                  readOnly: true,
                }}
                placeholder="Summary will appear here after generation..."
              />
            </Grid>
          </Grid>

          {summaryResult?.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Error: {summaryResult.error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryDialog(false)} disabled={summaryLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateSummary} 
            variant="contained" 
            color="primary"
            disabled={summaryLoading || !groqService.isConfigured()}
            startIcon={summaryLoading ? <CircularProgress size={20} /> : <Summarize />}
          >
            {summaryLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BuddyDashboard 