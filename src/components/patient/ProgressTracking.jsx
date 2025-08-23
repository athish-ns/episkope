import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'

const ProgressTracking = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Progress Tracking
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            Progress tracking interface for patients. This would include:
          </Typography>
          <ul>
            <li>Detailed progress charts and graphs</li>
            <li>Goal achievement tracking</li>
            <li>Exercise completion records</li>
            <li>Milestone celebrations</li>
            <li>Progress reports and insights</li>
          </ul>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProgressTracking 