/**
 * Main Application Component
 * 
 * Handles routing, authentication state, and dashboard selection based on user roles.
 * Provides error boundaries and loading states for a robust user experience.
 * 
 * Security Features:
 * - Role-based dashboard routing
 * - Protected route enforcement
 * - Development-only debug logging
 * 
 * Error Handling:
 * - Comprehensive error boundary
 * - Graceful error recovery
 * - Development vs production error reporting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, Alert, Typography, Button, Container, CircularProgress } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useStore from './store';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import NurseDashboard from './components/nurse/NurseDashboard';
import BuddyDashboard from './components/buddy/BuddyDashboard';
import PatientDashboard from './components/patient/PatientDashboard';
import ReceptionistDashboard from './components/receptionist/ReceptionistDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: error reporting service call
      // reportError(error, errorInfo);
    }
    
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong!
            </Typography>
            <Typography variant="body1" gutterBottom>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Error Details:</strong>
                </Typography>
                <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { user, profile, isAuthenticated, isLoading, initializeAuth } = useAuthStore();
  const { initialize: initializeStore } = useStore();
  const [authInitialized, setAuthInitialized] = useState(false);
  const [storeInitialized, setStoreInitialized] = useState(false);

  // Memoized initialization functions to prevent unnecessary re-renders
  const initializeAuthCallback = useCallback(async () => {
    try {
      const unsubscribe = await initializeAuth();
      setAuthInitialized(true);
      return unsubscribe;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthInitialized(true); // Mark as initialized even on error
    }
  }, [initializeAuth]);

  const initializeStoreCallback = useCallback(async () => {
    try {
      await initializeStore();
      setStoreInitialized(true);
    } catch (error) {
      console.error('Failed to initialize store:', error);
      setStoreInitialized(true); // Mark as initialized even on error
    }
  }, [initializeStore]);

  useEffect(() => {
    let authUnsubscribe;
    
    const setupApp = async () => {
      try {
        // Initialize Firebase authentication
        authUnsubscribe = await initializeAuthCallback();
        
        // Initialize store data
        await initializeStoreCallback();
      } catch (error) {
        console.error('Failed to setup app:', error);
      }
    };

    setupApp();
    
    // Cleanup subscription on unmount
    return () => {
      if (authUnsubscribe && typeof authUnsubscribe === 'function') {
        try {
          authUnsubscribe();
        } catch (error) {
          console.error('Error during auth cleanup:', error);
        }
      }
    };
  }, [initializeAuthCallback, initializeStoreCallback]);

  // Debug logging for authentication state (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('App auth state:', { 
        isAuthenticated, 
        user: user?.uid, 
        profile: profile?.role,
        authInitialized,
        storeInitialized,
        isLoading 
      });
    }
  }, [isAuthenticated, user, profile, authInitialized, storeInitialized, isLoading]);

  // Valid healthcare roles
  const VALID_ROLES = ['admin', 'doctor', 'nurse', 'buddy', 'patient', 'receptionist'];
  
  const getDashboardByRole = (role) => {
    if (!role || typeof role !== 'string') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Invalid role provided:', role);
      }
      return <Navigate to="/login" replace />;
    }
    
    // Validate role is a valid healthcare role
    if (!VALID_ROLES.includes(role)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unknown role:', role, 'Valid roles:', VALID_ROLES);
      }
      return <Navigate to="/login" replace />;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Getting dashboard for role:', role);
    }
    
    switch (role) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'buddy':
        return <BuddyDashboard />;
      case 'patient':
        return <PatientDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      default:
        // This should never happen due to validation above
        if (process.env.NODE_ENV === 'development') {
          console.error('Unexpected role in switch:', role);
        }
        return <Navigate to="/login" replace />;
    }
  };

  // Show loading spinner while Firebase auth is initializing
  if (!authInitialized || !storeInitialized || isLoading) {
    const loadingStates = [
      !authInitialized && 'Authentication',
      !storeInitialized && 'Data Store',
      isLoading && 'User State'
    ].filter(Boolean);
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.primary">
          Initializing Application
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loadingStates.length > 0 ? `Loading: ${loadingStates.join(', ')}` : 'Please wait...'}
        </Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        position: 'relative'
      }}>
        <CssBaseline />
        <Toaster position="top-right" />
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated && profile?.role ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated && profile?.role ? (
                <ProtectedRoute>
                  {getDashboardByRole(profile?.role)}
                </ProtectedRoute>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </ErrorBoundary>
  );
}

export default App; 