import { create } from 'zustand';
import { dbService, authService } from '../services/firebaseService';
import { toast } from 'react-hot-toast';
import useAuthStore from './authStore';

const useStore = create((set, get) => ({
  // State
  users: [],
  patients: [],
  sessions: [],
  carePlans: [],
  stats: {
    admin: {
      totalUsers: 0,
      totalPatients: 0,
      totalSessions: 0,
      systemHealth: '100%',
      totalWorkload: 0,
      activeBuddies: 0,
      unassignedPatients: 0
    },
    doctor: {
      totalPatients: 0,
      activePatients: 0,
      completedSessions: 0,
      averageRating: 0
    },
    nurse: {
      totalPatients: 0,
      activePatients: 0,
      sessionsToday: 0,
      pendingReviews: 0
    },
    buddy: {
      totalSessions: 0,
      completedSessions: 0,
      averageRating: 0,
      patientSatisfaction: 0
    },
    patient: {
      totalSessions: 0,
      completedSessions: 0,
      averageRating: 0,
      progress: 0
    }
  },
  isLoading: false,
  error: null,

  // Actions
  // Admin Actions
  fetchAdminDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [users, patients, sessions, carePlans] = await Promise.all([
        dbService.query('users', []),
        dbService.query('patients', []),
        dbService.query('sessions', []),
        dbService.query('carePlans', [])
      ]);
      
      if (users.success && patients.success && sessions.success && carePlans.success) {
        const stats = {
          totalUsers: users.data.length,
          totalPatients: patients.data.length,
          totalSessions: sessions.data.length,
          totalCarePlans: carePlans.data.length,
          activeBuddies: users.data.filter(u => u.role === 'medicalBuddy' && u.status === 'active').length,
          unassignedPatients: patients.data.filter(p => !p.assignedBuddy).length
        };
        
        set({
          users: users.data,
          patients: patients.data,
          sessions: sessions.data,
          carePlans: carePlans.data,
          stats: {
            ...get().stats,
            admin: stats
          },
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch admin dashboard';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.query('users', params);
      if (result.success) {
        set({ users: result.data, isLoading: false });
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Load data functions
  loadUsers: async () => {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await dbService.query('users', []);
        if (result.success) {
          set({ users: result.data, error: null });
          return { success: true, data: result.data };
        }
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    set({ error: `Failed to load users after ${maxRetries} attempts: ${lastError}` });
    return { success: false, error: lastError };
  },

  loadPatients: async () => {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await dbService.query('users', [{ field: 'role', operator: '==', value: 'patient' }]);
        if (result.success) {
          set({ patients: result.data, error: null });
          return { success: true, data: result.data };
        }
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    set({ error: `Failed to load patients after ${maxRetries} attempts: ${lastError}` });
    return { success: false, error: lastError };
  },

  loadSessions: async () => {
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await dbService.query('sessions', []);
        if (result.success) {
          set({ sessions: result.data, error: null });
          return { success: true, data: result.data };
        }
        lastError = result.error;
      } catch (error) {
        lastError = error.message;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    set({ error: `Failed to load sessions after ${maxRetries} attempts: ${lastError}` });
    return { success: false, error: lastError };
  },
  
  // Add user (for admin components) with validation
  addUser: async (userData) => {
    try {
      // Validate required fields
      if (!userData.email || !userData.displayName || !userData.role) {
        throw new Error('Missing required fields: email, displayName, and role are required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }
      
      const result = await dbService.create('users', userData);
      if (result.success) {
        get().loadUsers(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Update user with validation
  updateUser: async (userId, updates) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Validate updates
      if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        throw new Error('Invalid email format');
      }
      
      const result = await dbService.update('users', userId, updates);
      if (result.success) {
        get().loadUsers(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  // Add patient (create Firebase auth account and user document)
  addPatient: async (patientData) => {
    // Set flag to prevent logout during user creation
    const { setCreatingUser } = useAuthStore.getState();
    setCreatingUser(true);
    
    try {
      // Validate required patient data
      if (!patientData.email || !patientData.password || !patientData.firstName || !patientData.lastName) {
        throw new Error('Missing required fields: email, password, firstName, and lastName are required');
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientData.email)) {
        throw new Error('Invalid email format');
      }
      
      // Validate password strength
      if (patientData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Create Firebase auth account for patient family login
      const authResult = await authService.createUserAccount(patientData.email, patientData.password, {
        displayName: `${patientData.firstName} ${patientData.lastName}`,
        role: 'patient'
      });

      if (authResult.success) {
        // Now update the user document with all patient data including treatment plans
        const { password, confirmPassword, ...patientDataWithoutPassword } = patientData;
        const patientDocData = {
          ...patientDataWithoutPassword,
          uid: authResult.user.uid,
          role: 'patient',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: 'receptionist',
          
          // Treatment Plan Fields
          treatmentPlan: {
            assignedDoctor: patientData.assignedDoctor || '',
            assignedNurse: patientData.assignedNurse || '',
            assignedBuddy: patientData.assignedBuddy || '',
            diagnosis: patientData.diagnosis || '',
            treatmentGoals: patientData.treatmentGoals || [],
            currentPhase: 'initial',
            startDate: new Date().toISOString(),
            estimatedDuration: patientData.estimatedDuration || '3 months',
            progress: 0,
            notes: patientData.treatmentNotes || ''
          },
          
          // Medical Information
          medicalHistory: patientData.medicalHistory || '',
          currentCondition: patientData.currentCondition || '',
          allergies: patientData.allergies || [],
          medications: patientData.medications || [],
          
          // Emergency & Contact
          emergencyContact: patientData.emergencyContact || '',
          emergencyPhone: patientData.emergencyPhone || '',
          relationship: patientData.relationship || '',
          
          // Insurance & Administrative
          insuranceProvider: patientData.insuranceProvider || '',
          insuranceNumber: patientData.insuranceNumber || '',
          policyNumber: patientData.policyNumber || '',
          
          // Family Access
          familyAccessEnabled: true,
          familyMembers: patientData.familyMembers || [],
          
          // Session Tracking
          totalSessions: 0,
          completedSessions: 0,
          upcomingSessions: [],
          sessionHistory: [],
          
          // Progress Tracking
          milestones: [],
          achievements: [],
          challenges: [],
          notes: patientData.notes || '',
          
          // Overall Progress Tracking (starts at 0, editable by buddy, approved by doctor)
          overallProgress: {
            physicalProgress: 0,
            mentalProgress: 0,
            emotionalProgress: 0,
            socialProgress: 0,
            overallPercentage: 0,
            lastUpdated: new Date().toISOString(),
            lastUpdatedBy: null,
            lastApprovedBy: null,
            lastApprovalDate: null,
            approvalStatus: 'pending', // pending, approved, rejected
            approvalNotes: ''
          },
          
          // Progress Update History
          progressUpdates: [],
          approvalRequests: [],
          
          // Last Updated
          lastUpdated: new Date().toISOString(),
          lastSessionDate: null,
          nextSessionDate: null
        };

        // Update the user document with complete patient data
        await dbService.update('users', authResult.user.uid, patientDocData);
        
        get().loadPatients(); // Refresh the list
        return { success: true, id: authResult.user.uid };
      }
      return { success: false, error: authResult.error };
    } catch (error) {
      console.error('Error adding patient:', error);
      return { success: false, error: error.message };
    } finally {
      // Always reset the flag, even if there's an error
      setCreatingUser(false);
    }
  },
  
  // Update patient (in users collection) with validation
  updatePatient: async (patientId, updates) => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Validate email format if updating email
      if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
        throw new Error('Invalid email format');
      }
      
      const result = await dbService.update('users', patientId, updates);
      if (result.success) {
        get().loadPatients(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error updating patient:', error);
      return { success: false, error: error.message };
    }
  },

  // Update patient overall progress (for buddies to edit, doctors to approve) with validation
  updatePatientProgress: async (patientId, progressData, updatedBy) => {
    try {
      if (!patientId || !updatedBy) {
        throw new Error('Patient ID and updatedBy are required');
      }
      
      // Validate progress data
      const progressAreas = ['physicalProgress', 'mentalProgress', 'emotionalProgress', 'socialProgress'];
      for (const area of progressAreas) {
        if (progressData[area] !== undefined && (progressData[area] < 0 || progressData[area] > 100)) {
          throw new Error(`${area} must be between 0 and 100`);
        }
      }
      
      // Calculate overall percentage
      const overallPercentage = progressAreas.reduce((sum, area) => {
        return sum + (progressData[area] || 0);
      }, 0) / progressAreas.length;
      
      const updates = {
        'overallProgress.physicalProgress': progressData.physicalProgress || 0,
        'overallProgress.mentalProgress': progressData.mentalProgress || 0,
        'overallProgress.emotionalProgress': progressData.emotionalProgress || 0,
        'overallProgress.socialProgress': progressData.socialProgress || 0,
        'overallProgress.overallPercentage': overallPercentage,
        'overallProgress.lastUpdated': new Date().toISOString(),
        'overallProgress.lastUpdatedBy': updatedBy,
        'overallProgress.approvalStatus': 'pending',
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.update('users', patientId, updates);
      if (result.success) {
        get().loadPatients(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error updating patient progress:', error);
      return { success: false, error: error.message };
    }
  },

  // Approve patient progress (for doctors) with validation
  approvePatientProgress: async (patientId, approvalData, approvedBy) => {
    try {
      if (!patientId || !approvedBy) {
        throw new Error('Patient ID and approvedBy are required');
      }
      
      if (!approvalData.approvalStatus || !['approved', 'rejected'].includes(approvalData.approvalStatus)) {
        throw new Error('Approval status must be either "approved" or "rejected"');
      }
      
      const updates = {
        'overallProgress.approvalStatus': approvalData.approvalStatus,
        'overallProgress.lastApprovedBy': approvedBy,
        'overallProgress.lastApprovalDate': new Date().toISOString(),
        'overallProgress.approvalNotes': approvalData.approvalNotes || '',
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.update('users', patientId, updates);
      if (result.success) {
        get().loadPatients(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error approving patient progress:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete patient (soft delete - mark as inactive)
  deletePatient: async (patientId) => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      const updates = {
        status: 'inactive',
        deletedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.update('users', patientId, updates);
      if (result.success) {
        get().loadPatients(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return { success: false, error: error.message };
    }
  },

  // Add session with validation
  addSession: async (sessionData) => {
    try {
      // Validate required fields
      if (!sessionData.patientId || !sessionData.type || !sessionData.date || !sessionData.time) {
        throw new Error('Missing required fields: patientId, type, date, and time are required');
      }
      
      // Validate date format
      const sessionDate = new Date(sessionData.date);
      if (isNaN(sessionDate.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Validate time format (basic check)
      if (!/^\d{1,2}:\d{2}$/.test(sessionData.time)) {
        throw new Error('Invalid time format (use HH:MM)');
      }
      
      const sessionDocData = {
        ...sessionData,
        status: sessionData.status || 'scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 'receptionist',
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.create('sessions', sessionDocData);
      if (result.success) {
        get().loadSessions(); // Refresh the list
        return { success: true, id: result.id };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error adding session:', error);
      return { success: false, error: error.message };
    }
  },

  // Update session with validation
  updateSession: async (sessionId, updates) => {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      // Validate date format if updating date
      if (updates.date) {
        const sessionDate = new Date(updates.date);
        if (isNaN(sessionDate.getTime())) {
          throw new Error('Invalid date format');
        }
      }
      
      // Validate time format if updating time
      if (updates.time && !/^\d{1,2}:\d{2}$/.test(updates.time)) {
        throw new Error('Invalid time format (use HH:MM)');
      }
      
      const updatesWithTimestamp = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.update('sessions', sessionId, updatesWithTimestamp);
      if (result.success) {
        get().loadSessions(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error updating session:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete session (soft delete - mark as cancelled)
  deleteSession: async (sessionId) => {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      
      const updates = {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      const result = await dbService.update('sessions', sessionId, updates);
      if (result.success) {
        get().loadSessions(); // Refresh the list
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { success: false, error: error.message };
    }
  },

  // Initialize store data
  initialize: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const results = await Promise.allSettled([
        get().loadUsers(),
        get().loadPatients(),
        get().loadSessions()
      ]);
      
      // Check for any failed operations
      const failedOperations = results
        .map((result, index) => ({ result, operation: ['users', 'patients', 'sessions'][index] }))
        .filter(({ result }) => result.status === 'rejected');
      
      if (failedOperations.length > 0) {
        const failedNames = failedOperations.map(f => f.operation).join(', ');
        console.warn(`Failed to load: ${failedNames}`);
      }
      
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = error.message || 'Failed to initialize store';
      set({ error: errorMessage, isLoading: false });
      console.error('Store initialization error:', error);
      return { error: errorMessage };
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useStore;
