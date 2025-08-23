import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Badge,
  Divider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  AlertTitle
} from '@mui/material'
import {
  Add,
  Edit,
  Person,
  Assignment,
  Timeline,
  FitnessCenter,
  Star,
  ExpandMore,
  Visibility,
  Delete,
  CheckCircle,
  Warning,
  Info,
  LocalHospital,
  Psychology,
  Assessment,
  TrendingUp,
  Schedule,
  Notifications,
  LocationOn,
  Phone,
  Email,
  Refresh
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'
import { toast } from 'react-hot-toast'

const PatientCarePlans = () => {
  const { profile } = useAuthStore()
  const { 
    patients, 
    users, 
    updatePatient, 
    loadPatients, 
    loadUsers,
    isLoading 
  } = useStore()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCondition, setFilterCondition] = useState('all')
  const [isDataLoading, setIsDataLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    condition: '',
    assignedNurse: '',
    assignedBuddy: '',
    carePlan: {
      goals: [''],
      timeline: '',
      exercises: [''],
      medications: [''],
      dietaryRestrictions: '',
      followUpSchedule: '',
      riskFactors: [],
      emergencyContacts: []
    },
    progress: {
      mobility: 0,
      speech: 0,
      strength: 0,
      cognitive: 0,
      emotional: 0
    }
  })

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (profile?.uid) {
        setIsDataLoading(true);
        try {
          await Promise.all([
            loadPatients(),
            loadUsers()
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
          toast.error('Failed to load patient data');
        } finally {
          setIsDataLoading(false);
        }
      }
    };

    loadData();
  }, [profile?.uid, loadPatients, loadUsers]);

  // Refresh data manually
  const handleRefreshData = async () => {
    setIsDataLoading(true);
    try {
      await Promise.all([
        loadPatients(),
        loadUsers()
      ]);
      toast.success('Patient data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Get assigned patients for this doctor
  const assignedPatients = (patients || []).filter(p => 
    p.assignedDoctor === profile?.uid || 
    p.treatmentPlan?.assignedDoctor === profile?.uid
  );

  const nurses = (users || []).filter(u => u.role === 'nurse')
  const buddies = (users || []).filter(u => u.role === 'buddy' || u.role === 'medicalBuddy')

  const filteredPatients = assignedPatients.filter(patient => {
    const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase();
    const matchesSearch = patientName.includes(searchQuery.toLowerCase()) ||
                         (patient.currentCondition || patient.condition || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus
    const matchesCondition = filterCondition === 'all' || 
                            (patient.currentCondition || patient.condition) === filterCondition
    return matchesSearch && matchesStatus && matchesCondition
  })

  // Get assigned staff information
  const getAssignedStaff = (patient) => {
    const nurse = users?.find(u => u.id === patient.assignedNurse || u.uid === patient.assignedNurse)
    const buddy = users?.find(u => u.id === patient.assignedBuddy || u.uid === patient.assignedBuddy)
    
    return {
      nurse: nurse ? { name: nurse.displayName || nurse.firstName, id: nurse.id || nurse.uid } : null,
      buddy: buddy ? { 
        name: buddy.displayName || buddy.firstName, 
        id: buddy.id || buddy.uid,
        tier: buddy.tier || 'Bronze'
      } : null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      toast.error('No patient selected')
      return
    }
    
    try {
      const updatedCarePlan = {
        goals: (formData.carePlan.goals || []).filter(goal => goal.trim() !== ''),
        timeline: formData.carePlan.timeline || '',
        exercises: (formData.carePlan.exercises || []).filter(exercise => exercise.trim() !== ''),
        medications: (formData.carePlan.medications || []).filter(med => med.trim() !== ''),
        dietaryRestrictions: formData.carePlan.dietaryRestrictions || '',
        followUpSchedule: formData.carePlan.followUpSchedule || '',
        riskFactors: formData.carePlan.riskFactors || [],
        emergencyContacts: formData.carePlan.emergencyContacts || []
      }

      const patientData = {
        ...selectedPatient,
        carePlan: updatedCarePlan,
        updatedAt: new Date().toISOString()
      }

      await updatePatient(selectedPatient.id, patientData)
      toast.success('Care plan updated successfully')
      handleClose()
    } catch (error) {
      toast.error('Error updating care plan')
      console.error('Error updating care plan:', error)
    }
  }

  const handleEdit = (patient) => {
    setSelectedPatient(patient)
    setFormData({
      name: `${patient.firstName || ''} ${patient.lastName || ''}`,
      age: patient.age || '',
      condition: patient.currentCondition || patient.condition || '',
      assignedNurse: patient.assignedNurse || '',
      assignedBuddy: patient.assignedBuddy || '',
      carePlan: {
        goals: patient.carePlan?.goals || [''],
        timeline: patient.carePlan?.timeline || '',
        exercises: patient.carePlan?.exercises || [''],
        medications: patient.carePlan?.medications || [''],
        dietaryRestrictions: patient.carePlan?.dietaryRestrictions || '',
        followUpSchedule: patient.carePlan?.followUpSchedule || '',
        riskFactors: patient.carePlan?.riskFactors || [],
        emergencyContacts: patient.carePlan?.emergencyContacts || []
      },
      progress: patient.progress || {
        mobility: 0,
        speech: 0,
        strength: 0,
        cognitive: 0,
        emotional: 0
      }
    })
    setOpenDialog(true)
  }

  const handleClose = () => {
    setOpenDialog(false)
    setSelectedPatient(null)
    setFormData({
      name: '',
      age: '',
      condition: '',
      assignedNurse: '',
      assignedBuddy: '',
      carePlan: {
        goals: [''],
        timeline: '',
        exercises: [''],
        medications: [''],
        dietaryRestrictions: '',
        followUpSchedule: '',
        riskFactors: [],
        emergencyContacts: []
      },
      progress: {
        mobility: 0,
        speech: 0,
        strength: 0,
        cognitive: 0,
        emotional: 0
      }
    })
  }

  const addGoal = () => {
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        goals: [...(formData.carePlan.goals || []), ''] 
      } 
    })
  }

  const removeGoal = (index) => {
    const updatedGoals = formData.carePlan.goals.filter((_, i) => i !== index)
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        goals: updatedGoals 
      } 
    })
  }

  const updateGoal = (index, value) => {
    const updatedGoals = [...formData.carePlan.goals]
    updatedGoals[index] = value
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        goals: updatedGoals 
      } 
    })
  }

  const addExercise = () => {
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        exercises: [...(formData.carePlan.exercises || []), ''] 
      } 
    })
  }

  const removeExercise = (index) => {
    const updatedExercises = formData.carePlan.exercises.filter((_, i) => i !== index)
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        exercises: updatedExercises 
      } 
    })
  }

  const updateExercise = (index, value) => {
    const updatedExercises = [...formData.carePlan.exercises]
    updatedExercises[index] = value
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        exercises: updatedExercises 
      } 
    })
  }

  const addMedication = () => {
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        medications: [...(formData.carePlan.medications || []), ''] 
      } 
    })
  }

  const removeMedication = (index) => {
    const updatedMedications = formData.carePlan.medications.filter((_, i) => i !== index)
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        medications: updatedMedications 
      } 
    })
  }

  const updateMedication = (index, value) => {
    const updatedMedications = [...formData.carePlan.medications]
    updatedMedications[index] = value
    setFormData({ 
      ...formData, 
      carePlan: { 
        ...formData.carePlan, 
        medications: updatedMedications 
      } 
    })
  }

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'success'
    if (progress >= 60) return 'warning'
    return 'error'
  }

  const getConditionColor = (condition) => {
    const conditionColors = {
      'stroke': 'error',
      'trauma': 'warning',
      'neurological': 'info',
      'orthopedic': 'secondary',
      'cardiac': 'error',
      'respiratory': 'warning'
    }
    return conditionColors[condition?.toLowerCase()] || 'default'
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Grid container spacing={3}>
            {filteredPatients.map((patient) => {
              const staff = getAssignedStaff(patient)
              return (
                <Grid item xs={12} md={6} key={patient.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">
                              {patient.firstName} {patient.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Age: {patient.age || 'N/A'} | {patient.currentCondition || patient.condition || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Care Plan">
                            <IconButton size="small" onClick={() => handleEdit(patient)}>
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Care Team
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`Nurse: ${staff.nurse?.name || 'Unassigned'}`} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                          {staff.buddy && (
                            <Chip 
                              label={`Buddy: ${staff.buddy.name} (${staff.buddy.tier})`} 
                              size="small" 
                              color={staff.buddy.tier === 'Gold' ? 'warning' : staff.buddy.tier === 'Silver' ? 'default' : 'error'}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>

                      {patient.carePlan && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Care Plan Overview
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Timeline fontSize="small" />
                            <Typography variant="body2">
                              Timeline: {patient.carePlan.timeline || 'Not set'}
                            </Typography>
                          </Box>
                          
                          {(patient.carePlan.goals || []).length > 0 && (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Goals: {(patient.carePlan.goals || []).length}
                              </Typography>
                            </Box>
                          )}

                          {(patient.carePlan.exercises || []).length > 0 && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Exercises: {(patient.carePlan.exercises || []).length}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {patient.overallProgress && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Overall Progress
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" color="primary">
                              {patient.overallProgress.overallPercentage || 0}%
                            </Typography>
                            <Chip 
                              label={patient.overallProgress.approvalStatus || 'pending'} 
                              size="small" 
                              color={patient.overallProgress.approvalStatus === 'approved' ? 'success' : 'warning'}
                            />
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={patient.overallProgress.overallPercentage || 0} 
                            color="primary"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}

                      {patient.progress && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Progress Overview
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {Object.entries(patient.progress).map(([key, value]) => (
                              <Box key={key}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {key}
                                  </Typography>
                                  <Typography variant="body2">{value}%</Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={value} 
                                  color={getProgressColor(value)}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Care Plan Analytics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Patient Distribution by Condition
                    </Typography>
                    {/* This would contain charts/graphs */}
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Chart placeholder</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Progress Trends
                    </Typography>
                    {/* This would contain progress charts */}
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Chart placeholder</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )
      default:
        return null
    }
  }

  // Show loading state
  if (isDataLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show no patients message
  if (!isDataLoading && assignedPatients.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Patients Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You don't have any patients assigned to you yet.
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />}
          onClick={handleRefreshData}
        >
          Refresh Data
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Patient Care Plans
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Managing {assignedPatients.length} assigned patients
          </Typography>
          <Button 
            variant="outlined" 
            size="small"
            startIcon={<Refresh />}
            onClick={handleRefreshData}
            disabled={isDataLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Search Patients"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or condition..."
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="discharged">Discharged</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Condition</InputLabel>
                <Select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  label="Condition"
                >
                  <MenuItem value="all">All Conditions</MenuItem>
                  <MenuItem value="stroke">Stroke</MenuItem>
                  <MenuItem value="trauma">Trauma</MenuItem>
                  <MenuItem value="neurological">Neurological</MenuItem>
                  <MenuItem value="orthopedic">Orthopedic</MenuItem>
                  <MenuItem value="cardiac">Cardiac</MenuItem>
                  <MenuItem value="respiratory">Respiratory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Total: ${assignedPatients.length}`} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Active: ${assignedPatients.filter(p => p.status === 'active').length}`} 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  label={`Pending Approval: ${assignedPatients.filter(p => p.overallProgress?.approvalStatus === 'pending').length}`} 
                  color="warning" 
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Patient List" />
            <Tab label="Analytics" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Content */}
      {renderTabContent()}

      {/* Edit Care Plan Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit Care Plan - {formData.name}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={formData.name}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  value={formData.age}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Condition"
                  value={formData.condition}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Timeline"
                  value={formData.carePlan.timeline}
                  onChange={(e) => setFormData({
                    ...formData,
                    carePlan: { ...formData.carePlan, timeline: e.target.value }
                  })}
                  placeholder="e.g., 3 months, 6 months"
                />
              </Grid>

              {/* Goals */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Treatment Goals
                </Typography>
                {formData.carePlan.goals.map((goal, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={goal}
                      onChange={(e) => updateGoal(index, e.target.value)}
                      placeholder={`Goal ${index + 1}`}
                    />
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => removeGoal(index)}
                      disabled={formData.carePlan.goals.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button 
                  startIcon={<Add />} 
                  onClick={addGoal}
                  variant="outlined"
                  size="small"
                >
                  Add Goal
                </Button>
              </Grid>

              {/* Exercises */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Exercises
                </Typography>
                {formData.carePlan.exercises.map((exercise, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={exercise}
                      onChange={(e) => updateExercise(index, e.target.value)}
                      placeholder={`Exercise ${index + 1}`}
                    />
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => removeExercise(index)}
                      disabled={formData.carePlan.exercises.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button 
                  startIcon={<Add />} 
                  onClick={addExercise}
                  variant="outlined"
                  size="small"
                >
                  Add Exercise
                </Button>
              </Grid>

              {/* Medications */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Medications
                </Typography>
                {formData.carePlan.medications.map((medication, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={medication}
                      onChange={(e) => updateMedication(index, e.target.value)}
                      placeholder={`Medication ${index + 1}`}
                    />
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => removeMedication(index)}
                      disabled={formData.carePlan.medications.length === 1}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button 
                  startIcon={<Add />} 
                  onClick={addMedication}
                  variant="outlined"
                  size="small"
                >
                  Add Medication
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Dietary Restrictions"
                  value={formData.carePlan.dietaryRestrictions}
                  onChange={(e) => setFormData({
                    ...formData,
                    carePlan: { ...formData.carePlan, dietaryRestrictions: e.target.value }
                  })}
                  placeholder="Any dietary restrictions or special requirements..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Follow-up Schedule"
                  value={formData.carePlan.followUpSchedule}
                  onChange={(e) => setFormData({
                    ...formData,
                    carePlan: { ...formData.carePlan, followUpSchedule: e.target.value }
                  })}
                  placeholder="Follow-up schedule and frequency..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Update Care Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PatientCarePlans 