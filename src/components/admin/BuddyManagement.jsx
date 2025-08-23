import React, { useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress
} from '@mui/material'
import {
  AutoAwesome,
  Person,
  Assignment,
  Work,
  Favorite,
  School,
  CheckCircle,
  Warning,
  Info,
  Add
} from '@mui/icons-material'
import useStore from '../../store'
import toast from 'react-hot-toast'

const BuddyManagement = () => {
  const { 
    users, 
    autoAssignBuddies, 
    getUnassignedPatients, 
    getAvailableBuddies,
    getBuddyWorkload,
    addUser
  } = useStore()
  
  const [showAutoAssignDialog, setShowAutoAssignDialog] = useState(false)
  const [showAddBuddyDialog, setShowAddBuddyDialog] = useState(false)
  const [newBuddy, setNewBuddy] = useState({
    name: '',
    email: '',
    password: 'buddy123'
  })

  const buddies = users.filter(u => u.role === 'buddy')
  const unassignedPatients = getUnassignedPatients()
  const availableBuddies = getAvailableBuddies().map(buddy => ({
    ...buddy,
    workload: getBuddyWorkload(buddy.id)
  }))

  const handleAutoAssign = () => {
    const assignments = autoAssignBuddies()
    if (assignments.length > 0) {
      toast.success(`Successfully auto-assigned ${assignments.length} patients to medical buddies!`)
      setShowAutoAssignDialog(false)
    } else {
      toast.info('No unassigned patients found or all buddies are at capacity.')
    }
  }

  const handleAddBuddy = () => {
    if (!newBuddy.name || !newBuddy.email) {
      toast.error('Please fill in all required fields')
      return
    }

         addUser({
       ...newBuddy,
       role: 'buddy',
       tier: 'Bronze',
       sessions: 0,
       ratings: [],
       feedback: []
     })

    setNewBuddy({ name: '', email: '', password: 'buddy123' })
    setShowAddBuddyDialog(false)
    toast.success('Medical Buddy added successfully!')
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Gold':
        return <Work color="warning" />
      case 'Silver':
        return <Favorite color="default" />
      case 'Bronze':
        return <School color="error" />
      default:
        return <Person color="action" />
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Gold':
        return 'warning'
      case 'Silver':
        return 'default'
      case 'Bronze':
        return 'error'
      default:
        return 'default'
    }
  }

  const getWorkloadColor = (workload) => {
    if (workload >= 5) return 'error'
    if (workload >= 3) return 'warning'
    return 'success'
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          Medical Buddy Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage medical buddies and their patient assignments
        </Typography>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }} onClick={() => setShowAutoAssignDialog(true)}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <AutoAwesome sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Auto-Assign
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {unassignedPatients.length} patients need buddies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
            }
          }} onClick={() => setShowAddBuddyDialog(true)}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <Add sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Add Buddy
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Register new medical buddy
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <Person sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {buddies.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Buddies
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar sx={{ 
                bgcolor: 'warning.main', 
                width: 56, 
                height: 56, 
                mx: 'auto', 
                mb: 2 
              }}>
                <Assignment sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {unassignedPatients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unassigned Patients
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto-Assignment Alert */}
      {unassignedPatients.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => setShowAutoAssignDialog(true)}
              startIcon={<AutoAwesome />}
            >
              Auto-Assign Now
            </Button>
          }
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {unassignedPatients.length} patient{unassignedPatients.length > 1 ? 's' : ''} need{unassignedPatients.length === 1 ? 's' : ''} medical buddy assignment
          </Typography>
          <Typography variant="body2">
            Use our intelligent auto-assignment system to match patients with the best available medical buddies.
          </Typography>
        </Alert>
      )}

      {/* Medical Buddies Table */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Medical Buddy Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current assignments and workload distribution
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Medical Buddy</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Experience Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Current Patients</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Workload</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Recent Sessions</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                                 {availableBuddies.map((buddy) => {
                   const workload = buddy.workload || { totalWorkload: 0, assignedPatients: 0, activeSessions: 0 }
                   const workloadColor = getWorkloadColor(workload.totalWorkload || 0)
                   
                   return (
                    <TableRow key={buddy.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: `${getTierColor(buddy.tier)}.main` }}>
                            {getTierIcon(buddy.tier)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {buddy.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {buddy.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getTierIcon(buddy.tier)}
                          label={buddy.tier}
                          color={getTierColor(buddy.tier)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                                                 <Typography variant="body1" sx={{ fontWeight: 600 }}>
                           {workload.assignedPatients || 0}
                         </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                     <LinearProgress
                             variant="determinate"
                             value={Math.min((workload.totalWorkload || 0) * 20, 100)}
                             color={workloadColor}
                             sx={{ 
                               width: 60, 
                               height: 8, 
                               borderRadius: 4,
                               bgcolor: 'grey.200'
                             }}
                           />
                           <Typography variant="body2" color="text.secondary">
                             {(workload.totalWorkload || 0).toFixed(1)}
                           </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                                                 <Typography variant="body2" color="text.secondary">
                           {workload.activeSessions || 0} (active)
                         </Typography>
                      </TableCell>
                      <TableCell>
                                                 <Chip
                           icon={(workload.totalWorkload || 0) >= 5 ? <Warning /> : <CheckCircle />}
                           label={(workload.totalWorkload || 0) >= 5 ? 'High Load' : 'Available'}
                           color={(workload.totalWorkload || 0) >= 5 ? 'warning' : 'success'}
                           size="small"
                         />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Unassigned Patients */}
      {unassignedPatients.length > 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Unassigned Patients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patients waiting for medical buddy assignment
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Patient</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Admission Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unassignedPatients.map((patient) => (
                    <TableRow key={patient.id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {patient.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Age: {patient.age}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                                             <TableCell>
                         <Typography variant="body2">
                           {patient.diagnosis}
                         </Typography>
                       </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(patient.admissionDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Info />}
                          label="Needs Assignment"
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Auto-Assignment Dialog */}
      <Dialog 
        open={showAutoAssignDialog} 
        onClose={() => setShowAutoAssignDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <AutoAwesome />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Auto-Assign Medical Buddies
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Our intelligent system will automatically assign the best available medical buddies to unassigned patients based on:
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Assignment Criteria:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Current workload balance</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Experience level (Gold &gt; Silver &gt; Bronze)</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Recent session activity</Typography>
              </Box>
            </Box>
          </Box>

          {unassignedPatients.length > 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{unassignedPatients.length}</strong> patient{unassignedPatients.length > 1 ? 's' : ''} will be assigned to medical buddies.
              </Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAutoAssignDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAutoAssign}
            variant="contained"
            startIcon={<AutoAwesome />}
            disabled={unassignedPatients.length === 0}
          >
            Auto-Assign Now
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Buddy Dialog */}
      <Dialog 
        open={showAddBuddyDialog} 
        onClose={() => setShowAddBuddyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <Add />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add New Medical Buddy
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={newBuddy.name}
              onChange={(e) => setNewBuddy({ ...newBuddy, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newBuddy.email}
              onChange={(e) => setNewBuddy({ ...newBuddy, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newBuddy.password}
              onChange={(e) => setNewBuddy({ ...newBuddy, password: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowAddBuddyDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddBuddy}
            variant="contained"
            startIcon={<Add />}
          >
            Add Medical Buddy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default BuddyManagement 