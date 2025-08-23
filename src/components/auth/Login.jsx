import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Avatar,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Paper,
  Divider
} from '@mui/material';
import { 
  LocalHospital, 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff,
  Security,
  TrendingUp,
  Shield,
  HealthAndSafety,
  Psychology,
  AccessibilityNew
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);

    if (!email || !password) {
      toast.error('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login({ email, password });
      if (result?.error) {
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) clearError();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) clearError();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = email && password;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 2 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'float 6s ease-in-out infinite',
        }
      }}
    >
      {/* Floating Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
          zIndex: 0,
          animation: 'float 10s ease-in-out infinite',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, md: 6 },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
          }}
        >
          {/* Left Side - Branding */}
          <Fade in timeout={1000}>
            <Box
              sx={{
                flex: 1,
                textAlign: 'center',
                color: 'white',
                mb: { xs: 4, md: 0 },
                minWidth: { xs: '100%', md: 'auto' },
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 100, md: 140 },
                  height: { xs: 100, md: 140 },
                  mx: 'auto',
                  mb: 4,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'scale(1.1) rotate(5deg)',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
                  }
                }}
              >
                <LocalHospital sx={{ fontSize: { xs: 50, md: 70 }, color: 'white' }} />
              </Avatar>
              
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
                  mb: 3,
                  lineHeight: 1.1,
                  background: 'linear-gradient(45deg, #ffffff 30%, #f0f8ff 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
              >
                Reuth Hospital
              </Typography>
              
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{ 
                  opacity: 0.95,
                  fontWeight: 400,
                  mb: 4,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                  lineHeight: 1.3,
                  color: '#f0f8ff'
                }}
              >
                Advanced Rehabilitation Management System
              </Typography>
              
              {/* Enhanced Feature Highlights */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 3, 
                flexWrap: 'wrap',
                mb: 4
              }}>
                <EnhancedFeatureBadge icon={<Security />} text="Quantum Security" color="#4CAF50" />
                <EnhancedFeatureBadge icon={<TrendingUp />} text="Real-time Analytics" color="#2196F3" />
                <EnhancedFeatureBadge icon={<Shield />} text="HIPAA Compliant" color="#FF9800" />
              </Box>

              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.9,
                  maxWidth: 450,
                  mx: 'auto',
                  lineHeight: 1.7,
                  mb: 4,
                  fontSize: '1.1rem',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                Experience the future of healthcare management with our cutting-edge platform. 
                Secure, intuitive, and designed for excellence in patient care.
              </Typography>

              {/* Enhanced Role Information */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 3, 
                flexWrap: 'wrap'
              }}>
                <EnhancedInfoBadge icon={<HealthAndSafety />} text="Admin Registration" color="#E91E63" />
                <EnhancedInfoBadge icon={<Psychology />} text="Staff Management" color="#9C27B0" />
                <EnhancedInfoBadge icon={<AccessibilityNew />} text="Patient Care" color="#00BCD4" />
              </Box>
            </Box>
          </Fade>

          {/* Right Side - Enhanced Login Form */}
          <Slide direction="up" in timeout={1200}>
            <Card
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: 480 },
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 35px 70px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    component="h2" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 700, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                    Sign in to access your secure dashboard
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 4,
                      borderRadius: 3,
                      fontSize: '1rem',
                      '& .MuiAlert-icon': {
                        alignItems: 'center',
                      },
                    }}
                    onClose={clearError}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    margin="normal"
                    required
                    variant="outlined"
                    disabled={isLoading || isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 500,
                      },
                    }}
                    error={!!error}
                    helperText={error ? 'Please check your email address' : ''}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    margin="normal"
                    required
                    variant="outlined"
                    disabled={isLoading || isSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                            disabled={isLoading || isSubmitting}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                backgroundColor: 'primary.50',
                              }
                            }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 500,
                      },
                    }}
                    error={!!error}
                    helperText={error ? 'Please check your password' : ''}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || isSubmitting || !isFormValid}
                    sx={{ 
                      mt: 5, 
                      mb: 4, 
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 35px rgba(102, 126, 234, 0.5)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        opacity: 0.7,
                        transform: 'none',
                      },
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                  >
                    {isLoading || isSubmitting ? (
                      <CircularProgress size={28} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Box>

                <Divider sx={{ my: 3, opacity: 0.3 }} />

                <Paper sx={{ 
                  p: 3, 
                  bgcolor: 'primary.50', 
                  borderRadius: 3, 
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'primary.100',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                }}>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600, mb: 1.5, fontSize: '1rem' }}>
                    🔐 Secure Access Information
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                    Patient accounts are created by administrators or receptionists only.
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    Family members can log in using the patient's email and password provided during registration.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Slide>
        </Box>
      </Container>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}
      </style>
    </Box>
  );
};

// Enhanced Feature Badge Component
const EnhancedFeatureBadge = ({ icon, text, color }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 3,
      py: 1.5,
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 3,
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-3px) scale(1.05)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }
    }}
  >
    <Box sx={{ color: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
      {text}
    </Typography>
  </Box>
);

// Enhanced Info Badge Component
const EnhancedInfoBadge = ({ icon, text, color }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 3,
      py: 1.5,
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 3,
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.25)',
        transform: 'translateY(-3px) scale(1.05)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      }
    }}
  >
    <Box sx={{ color: color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
      {text}
    </Typography>
  </Box>
);

export default Login; 