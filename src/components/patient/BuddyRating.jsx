import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  TextField,
  Button,
  Grid,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Star,
  ThumbUp,
  ThumbDown,
  Comment,
  Psychology,
  FitnessCenter,
  Accessibility,
  EmojiEmotions,
  Close,
  Send
} from '@mui/icons-material'
import useStore from '../../store'
import toast from 'react-hot-toast'

const BuddyRating = ({ session, open, onClose, onRatingSubmitted }) => {
  const { user, updateSession, users } = useStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(-1)
  const [overallSatisfaction, setOverallSatisfaction] = useState('')
  const [communication, setCommunication] = useState('')
  const [professionalism, setProfessionalism] = useState('')
  const [effectiveness, setEffectiveness] = useState('')
  const [comments, setComments] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const buddy = users.find(u => u.id === session?.buddyId)
  
  const ratingCategories = [
    { key: 'communication', label: 'Communication Skills', icon: <Comment /> },
    { key: 'professionalism', label: 'Professionalism', icon: <Psychology /> },
    { key: 'effectiveness', label: 'Treatment Effectiveness', icon: <FitnessCenter /> },
    { key: 'accessibility', label: 'Accessibility & Support', icon: <Accessibility /> },
    { key: 'empathy', label: 'Empathy & Understanding', icon: <EmojiEmotions /> }
  ]

  const satisfactionLevels = [
    { value: 'excellent', label: 'Excellent', color: 'success' },
    { value: 'good', label: 'Good', color: 'primary' },
    { value: 'satisfactory', label: 'Satisfactory', color: 'warning' },
    { value: 'needs_improvement', label: 'Needs Improvement', color: 'error' }
  ]

  useEffect(() => {
    if (open && session) {
      // Reset form when opening
      setRating(0)
      setOverallSatisfaction('')
      setCommunication('')
      setProfessionalism('')
      setEffectiveness('')
      setComments('')
      setSelectedCategories([])
    }
  }, [open, session])

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please provide an overall rating')
      return
    }

    if (!overallSatisfaction) {
      toast.error('Please select overall satisfaction level')
      return
    }

    setIsSubmitting(true)

    try {
      const ratingData = {
        rating,
        overallSatisfaction,
        communication,
        professionalism,
        effectiveness,
        comments,
        categories: selectedCategories,
        ratingDate: new Date().toISOString(),
        sessionId: session.id,
        buddyId: session.buddyId,
        patientId: user.id
      }

      // Use the enhanced rating function
      await updateSession(session.id, {
        patientRating: rating,
        patientComments: comments,
        ratingDetails: ratingData,
        ratingDate: new Date().toISOString()
      })

      // Also call the rateSession function for comprehensive rating handling
      const { rateSession } = useStore.getState()
      await rateSession(session.id, ratingData)

      toast.success('Thank you for your feedback! Your rating helps improve our services.')
      
      if (onRatingSubmitted) {
        onRatingSubmitted(ratingData)
      }
      
      onClose()
    } catch (error) {
      toast.error('Failed to submit rating. Please try again.')
      console.error('Rating submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingLabel = (value) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return labels[value] || ''
  }

  const getRatingColor = (value) => {
    if (value >= 4) return 'success'
    if (value >= 3) return 'warning'
    return 'error'
  }

  if (!session || !buddy) {
    return null
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <Star />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Rate Your Medical Buddy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Help us improve by providing feedback on your session with {buddy.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Session Info */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {session.title || `${session.type} Therapy Session`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Overall Rating */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Overall Rating
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Rating
                  name="overall-rating"
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  onChangeActive={(event, newHover) => setHover(newHover)}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': { color: 'warning.main' },
                    '& .MuiRating-iconHover': { color: 'warning.light' }
                  }}
                />
              </Box>
              <Typography 
                variant="h6" 
                color={getRatingColor(rating)}
                sx={{ fontWeight: 600 }}
              >
                {getRatingLabel(rating)}
              </Typography>
            </Box>
          </Grid>

          {/* Detailed Ratings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Detailed Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Communication Skills</FormLabel>
                  <RadioGroup
                    value={communication}
                    onChange={(e) => setCommunication(e.target.value)}
                  >
                    {satisfactionLevels.map((level) => (
                      <FormControlLabel
                        key={level.value}
                        value={level.value}
                        control={<Radio />}
                        label={level.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Professionalism</FormLabel>
                  <RadioGroup
                    value={professionalism}
                    onChange={(e) => setProfessionalism(e.target.value)}
                  >
                    {satisfactionLevels.map((level) => (
                      <FormControlLabel
                        key={level.value}
                        value={level.value}
                        control={<Radio />}
                        label={level.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Treatment Effectiveness</FormLabel>
                  <RadioGroup
                    value={effectiveness}
                    onChange={(e) => setEffectiveness(e.target.value)}
                  >
                    {satisfactionLevels.map((level) => (
                      <FormControlLabel
                        key={level.value}
                        value={level.value}
                        control={<Radio />}
                        label={level.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Overall Satisfaction</FormLabel>
                  <RadioGroup
                    value={overallSatisfaction}
                    onChange={(e) => setOverallSatisfaction(e.target.value)}
                  >
                    {satisfactionLevels.map((level) => (
                      <FormControlLabel
                        key={level.value}
                        value={level.value}
                        control={<Radio />}
                        label={level.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          {/* Category Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              What went well? (Select all that apply)
            </Typography>
            <FormGroup>
              <Grid container spacing={1}>
                {ratingCategories.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(category.key)}
                          onChange={() => handleCategoryToggle(category.key)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {category.icon}
                          {category.label}
                        </Box>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          </Grid>

          {/* Comments */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments (Optional)"
              placeholder="Share your experience, suggestions, or any specific feedback..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              variant="outlined"
            />
          </Grid>

          {/* Info Alert */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                Your feedback helps us maintain high-quality care and supports our medical buddies in their professional development. 
                All ratings are confidential and used to improve our services.
              </Typography>
            </Alert>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || rating === 0 || !overallSatisfaction}
          startIcon={<Send />}
          sx={{ borderRadius: 2 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BuddyRating
