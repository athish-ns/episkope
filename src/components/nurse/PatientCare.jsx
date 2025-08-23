import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

const PatientCare = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Care
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Patient care management interface for nurses. This would include:
          </Typography>
          <ul>
            <li>Daily patient monitoring</li>
            <li>Medication administration tracking</li>
            <li>Clinical progress notes</li>
            <li>Patient status updates</li>
            <li>Emergency alerts and escalations</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PatientCare 