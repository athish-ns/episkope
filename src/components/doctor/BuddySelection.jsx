import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Alert
} from '@mui/material'
import {
  Person,
  Star
} from '@mui/icons-material'
import useStore from '../../store'
import useAuthStore from '../../store/authStore'

const BuddySelection = () => {
  const { profile } = useAuthStore()
  const { patients, users, sessions } = useStore()




  // Get patients assigned to current doctor
  const assignedPatients = (patients || []).filter(p => p.assignedDoctor === profile?.uid)
  








  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medical Buddy Assignment
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View medical buddy assignments for your patients. Buddy assignments are made during patient registration by administrators.
      </Typography>

      <Grid container spacing={3}>
        {assignedPatients.map((patient) => {
          const assignedBuddy = (users || []).find(u => u.id === patient.assignedBuddy)
          
          return (
            <Grid item xs={12} md={6} key={patient.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {patient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.condition}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {assignedBuddy ? 'Buddy Assigned' : 'No Buddy Assigned'}
                    </Typography>
                  </Box>

                  {assignedBuddy ? (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Current Medical Buddy
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {assignedBuddy.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={assignedBuddy.tier} 
                              size="small" 
                              color="default"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Star fontSize="small" color="warning" />
                              <Typography variant="body2">
                                {assignedBuddy.tier}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Star color="success" />
                      </Box>
                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      No medical buddy assigned yet. Click "Assign Buddy" to select one.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>


    </Box>
  )
}

export default BuddySelection 