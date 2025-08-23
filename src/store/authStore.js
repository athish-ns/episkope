/**
 * Authentication Store
 * 
 * Manages user authentication state, login/logout, and profile management
 * using Firebase Authentication and Firestore for user profiles.
 * 
 * Security Features:
 * - Secure logout with proper storage cleanup
 * - Role-based access control validation
 * - Permission checking with error handling
 * - Safe storage management (only auth-related keys)
 * 
 * Error Handling:
 * - Comprehensive try-catch blocks
 * - Graceful fallbacks for failed operations
 * - User-friendly error messages
 * - Profile loading error recovery
 */

import { create } from 'zustand';
import { authService } from '../services/firebaseService';
import { toast } from 'react-hot-toast';

const useAuthStore = create(
  (set, get) => ({
    // State
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isCreatingUser: false, // Flag to prevent logout during user creation

    // Actions
    login: async (credentials) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.signIn(credentials.email, credentials.password);
        
        if (result.success) {
          const user = result.user;
          
          // Get user profile from Firestore
          const profileResult = await authService.getProfile(user.uid);
          const profile = profileResult.success ? profileResult.data : null;
          
          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          toast.success(`Welcome back, ${profile?.displayName || user.email}!`);
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Login failed';
        set({ 
          error: errorMessage, 
          isLoading: false
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    register: async (userData) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.signUp(userData.email, userData.password, userData);
        
        if (result.success) {
          const user = result.user;
          
          // Get user profile from Firestore
          const profileResult = await authService.getProfile(user.uid);
          const profile = profileResult.success ? profileResult.data : null;
          
          set({
            user,
            profile,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          toast.success('Registration successful! Welcome to the platform.');
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Registration failed';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    logout: async () => {
      set({ isLoading: true });
      
      try {
        console.log('Starting logout process...');
        
        // First, clear local state to prevent any redirects
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        // Clear only auth-related storage
        try {
          localStorage.removeItem('auth-storage');
          sessionStorage.removeItem('auth-storage');
          // Clear other auth-related keys if they exist
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('auth-') || key.startsWith('firebase-')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.log('Storage clear error:', e);
        }
        
        // Then attempt Firebase signout
        try {
          await authService.signOut();
          console.log('Firebase signout completed');
        } catch (error) {
          console.error('Firebase signout error:', error);
          // Continue with logout even if Firebase fails
        }
        
        toast.success('Logged out successfully');
        
        // Use React Router navigation instead of force redirect
        // This will be handled by the App component's auth state change
        
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, ensure logout state
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        // Clear auth storage
        try {
          localStorage.removeItem('auth-storage');
          sessionStorage.removeItem('auth-storage');
        } catch (e) {
          console.log('Storage clear error:', e);
        }
      }
    },

    forgotPassword: async (email) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.resetPassword(email);
        
        if (result.success) {
          set({ isLoading: false });
          toast.success('Password reset instructions sent to your email');
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Failed to send reset email';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    updateProfile: async (profileData) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.updateProfile(profileData);
        
        if (result.success) {
          // Update local profile state
          const updatedProfile = { ...get().profile, ...profileData };
          set({
            profile: updatedProfile,
            isLoading: false
          });
          
          toast.success('Profile updated successfully');
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Profile update failed';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    updateEmail: async (newEmail) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.updateEmail(newEmail);
        
        if (result.success) {
          // Update local user state
          const updatedUser = { ...get().user, email: newEmail };
          set({
            user: updatedUser,
            isLoading: false
          });
          
          toast.success('Email updated successfully');
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Email update failed';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    updatePassword: async (newPassword) => {
      set({ isLoading: true, error: null });
      
      try {
        const result = await authService.updatePassword(newPassword);
        
        if (result.success) {
          set({ isLoading: false });
          toast.success('Password updated successfully');
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        const errorMessage = error.message || 'Password update failed';
        set({ 
          error: errorMessage, 
          isLoading: false 
        });
        toast.error(errorMessage);
        return { error: errorMessage };
      }
    },

    clearError: () => {
      set({ error: null });
    },

    // Set flag to prevent logout during user creation
    setCreatingUser: (isCreating) => {
      set({ isCreatingUser: isCreating });
    },

    // Initialize auth state from Firebase
    initializeAuth: () => {
      console.log('Initializing auth...');
      set({ isLoading: true, error: null });
      
      try {
        const unsubscribe = authService.onAuthStateChange(async (user) => {
          console.log('Auth state changed:', user ? `User: ${user.email} (${user.uid})` : 'No user');
          
          // If we're in the middle of creating a user, ignore auth state changes temporarily
          if (get().isCreatingUser) {
            console.log('Ignoring auth state change during user creation');
            return;
          }
          
          if (user) {
            try {
              console.log('Getting user profile from Firestore...');
              // Get user profile from Firestore
              const profileResult = await authService.getProfile(user.uid);
              const profile = profileResult.success ? profileResult.data : null;
              
              console.log('Profile result:', profile);
              
              set({
                user: {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName
                },
                profile,
                isAuthenticated: true,
                isLoading: false,
                error: null
              });
              
              console.log('Auth state set to authenticated');
            } catch (error) {
              console.error('Failed to get user profile:', error);
              // Set user as authenticated but without profile
              set({
                user: {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName
                },
                profile: null,
                isAuthenticated: true,
                isLoading: false,
                error: `Profile load failed: ${error.message}`
              });
              
              // Show warning toast
              toast.warning('User authenticated but profile could not be loaded');
            }
          } else {
            // User is logged out - clear all state
            console.log('Clearing auth state - user logged out');
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
            
            // Clear only auth-related storage when user logs out
            try {
              localStorage.removeItem('auth-storage');
              sessionStorage.removeItem('auth-storage');
              // Clear other auth-related keys if they exist
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('auth-') || key.startsWith('firebase-')) {
                  localStorage.removeItem(key);
                }
              });
            } catch (e) {
              console.log('Storage clear error:', e);
            }
            
            console.log('Auth state cleared, auth storage cleared');
          }
        });
        
        console.log('Auth listener set up, returning unsubscribe function');
        // Return unsubscribe function for cleanup
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        set({ 
          isLoading: false, 
          error: `Auth initialization failed: ${error.message}` 
        });
        
        // Return a no-op unsubscribe function
        return () => {};
      }
    },

    // Check if user has specific role
    hasRole: (role) => {
      try {
        if (!role || typeof role !== 'string') {
          console.warn('hasRole called with invalid role:', role);
          return false;
        }
        const profile = get().profile;
        return profile && profile.role === role;
      } catch (error) {
        console.error('Error checking role:', error);
        return false;
      }
    },

    // Check if user has any of the specified roles
    hasAnyRole: (roles) => {
      try {
        if (!Array.isArray(roles) || roles.length === 0) {
          console.warn('hasAnyRole called with invalid roles:', roles);
          return false;
        }
        const profile = get().profile;
        return profile && roles.includes(profile.role);
      } catch (error) {
        console.error('Error checking roles:', error);
        return false;
      }
    },

    // Get user permissions
    getPermissions: () => {
      try {
        const profile = get().profile;
        return profile && Array.isArray(profile.permissions) ? profile.permissions : [];
      } catch (error) {
        console.error('Error getting permissions:', error);
        return [];
      }
    },

    // Check if user has specific permission
    hasPermission: (permission) => {
      try {
        if (!permission || typeof permission !== 'string') {
          console.warn('hasPermission called with invalid permission:', permission);
          return false;
        }
        const permissions = get().getPermissions();
        return permissions.includes(permission);
      } catch (error) {
        console.error('Error checking permission:', error);
        return false;
      }
    },

    // Cleanup function to reset auth state
    cleanup: () => {
      console.log('Manual cleanup called');
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      // Clear only auth-related storage
      try {
        localStorage.removeItem('auth-storage');
        sessionStorage.removeItem('auth-storage');
        // Clear other auth-related keys if they exist
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('auth-') || key.startsWith('firebase-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.log('Storage clear error:', e);
      }
    },

    // Force logout - bypasses Firebase (use sparingly)
    forceLogout: () => {
      console.log('Force logout called');
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      // Clear only auth-related storage
      try {
        localStorage.removeItem('auth-storage');
        sessionStorage.removeItem('auth-storage');
        // Clear other auth-related keys if they exist
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('auth-') || key.startsWith('firebase-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.log('Storage clear error:', e);
      }
      
      // Note: Redirect should be handled by React Router, not forced
      console.warn('Force logout completed. Redirect should be handled by React Router.');
    }
  })
);

export default useAuthStore;
