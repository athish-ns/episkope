import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

const CareTeam = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Care Team
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Care team information interface for patients. This would include:
          </Typography>
          <ul>
            <li>Assigned doctor information</li>
            <li>Nurse contact details</li>
            <li>Medical Buddy profile and tier</li>
            <li>Team communication tools</li>
            <li>Appointment scheduling</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CareTeam 