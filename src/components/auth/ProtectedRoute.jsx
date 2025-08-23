import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { user, profile, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute state:', { isAuthenticated, user: user?.uid, profile: profile?.role, isLoading });
  }, [isAuthenticated, user, profile, isLoading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading secure dashboard...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if no profile or role
  if (!profile || !profile.role) {
    console.log('ProtectedRoute: No profile or role, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering dashboard for role:', profile.role);
  return children;
};

export default ProtectedRoute; 