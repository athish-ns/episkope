import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

const BuddyOversight = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Medical Buddy Oversight
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Medical Buddy oversight interface for nurses. This would include:
          </Typography>
          <ul>
            <li>Buddy performance monitoring</li>
            <li>Training and guidance</li>
            <li>Performance evaluations</li>
            <li>Feedback and improvement suggestions</li>
            <li>Escalation of concerns to doctors</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  )
}

export default BuddyOversight 