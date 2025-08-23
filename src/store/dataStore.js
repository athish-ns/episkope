import { create } from 'zustand';
import { dbService, authService } from '../services/firebaseService';
import { toast } from 'react-hot-toast';

const useDataStore = create((set, get) => ({
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
      const result = await dbService.query('users', []);
      
      if (result.success) {
        set({
          users: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch users';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.create('users', userData);
      
      if (result.success) {
        const newUser = { id: result.id, ...userData };
        set(state => ({
          users: [...state.users, newUser],
          isLoading: false
        }));
        
        toast.success('User created successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create user';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  updateUser: async (userId, userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.update('users', userId, userData);
      
      if (result.success) {
        const updatedUser = { ...userData, id: userId };
        set(state => ({
          users: state.users.map(user => 
            user.id === userId ? updatedUser : user
          ),
          isLoading: false
        }));
        
        toast.success('User updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update user';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.delete('users', userId);
      
      if (result.success) {
        set(state => ({
          users: state.users.filter(user => user.id !== userId),
          isLoading: false
        }));
        
        toast.success('User deleted successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete user';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Doctor Actions
  fetchDoctorDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const [patients, carePlans] = await Promise.all([
        dbService.query('patients', [
          { field: 'assignedDoctor', operator: '==', value: currentUser.uid }
        ]),
        dbService.query('carePlans', [
          { field: 'doctorId', operator: '==', value: currentUser.uid }
        ])
      ]);
      
      if (patients.success && carePlans.success) {
        const stats = {
          totalPatients: patients.data.length,
          activePatients: patients.data.filter(p => p.status === 'active').length,
          completedSessions: 0, // Will be calculated from sessions
          averageRating: 0
        };
        
        set({
          patients: patients.data,
          carePlans: carePlans.data,
          stats: {
            ...get().stats,
            doctor: stats
          },
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch doctor dashboard';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchDoctorPatients: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const result = await dbService.query('patients', [
        { field: 'assignedDoctor', operator: '==', value: currentUser.uid }
      ]);
      
      if (result.success) {
        set({
          patients: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch patients';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  updatePatientCarePlan: async (patientId, carePlan) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.create('carePlans', {
        patientId,
        ...carePlan
      });
      
      if (result.success) {
        const newCarePlan = { id: result.id, patientId, ...carePlan };
        set(state => ({
          carePlans: [...state.carePlans, newCarePlan],
          isLoading: false
        }));
        
        toast.success('Care plan updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update care plan';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Nurse Actions
  fetchNurseDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [patients, sessions] = await Promise.all([
        dbService.query('patients', []),
        dbService.query('sessions', [])
      ]);
      
      if (patients.success && sessions.success) {
        const stats = {
          totalPatients: patients.data.length,
          activePatients: patients.data.filter(p => p.status === 'active').length,
          sessionsToday: sessions.data.filter(s => {
            const sessionDate = new Date(s.date);
            const today = new Date();
            return sessionDate.toDateString() === today.toDateString();
          }).length,
          pendingReviews: sessions.data.filter(s => s.status === 'completed' && !s.reviewed).length
        };
        
        set({
          patients: patients.data,
          stats: {
            ...get().stats,
            nurse: stats
          },
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch nurse dashboard';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchNursePatients: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.query('patients', []);
      
      if (result.success) {
        set({
          patients: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch patients';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  updatePatientVitals: async (patientId, vitals) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.create('vitals', {
        patientId,
        ...vitals
      });
      
      if (result.success) {
        toast.success('Patient vitals updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update patient vitals';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Buddy Actions
  fetchBuddyDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const [patients, sessions] = await Promise.all([
        dbService.query('patients', [
          { field: 'assignedBuddy', operator: '==', value: currentUser.uid }
        ]),
        dbService.query('sessions', [
          { field: 'buddyId', operator: '==', value: currentUser.uid }
        ])
      ]);
      
      if (patients.success && sessions.success) {
        const stats = {
          totalPatients: patients.data.length,
          totalSessions: sessions.data.length,
          completedSessions: sessions.data.filter(s => s.status === 'completed').length,
          averageRating: calculateAverageRating(sessions.data)
        };
        
        set({
          patients: patients.data,
          sessions: sessions.data,
          stats: {
            ...get().stats,
            buddy: stats
          },
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch buddy dashboard';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchBuddyPatients: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const result = await dbService.query('patients', [
        { field: 'assignedBuddy', operator: '==', value: currentUser.uid }
      ]);
      
      if (result.success) {
        set({
          patients: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch patients';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchBuddySessions: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const result = await dbService.query('sessions', [
        { field: 'buddyId', operator: '==', value: currentUser.uid }
      ]);
      
      if (result.success) {
        set({
          sessions: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch sessions';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  createSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.create('sessions', sessionData);
      
      if (result.success) {
        const newSession = { id: result.id, ...sessionData };
        set(state => ({
          sessions: [...state.sessions, newSession],
          isLoading: false
        }));
        
        toast.success('Session created successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to create session';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  updateSession: async (sessionId, sessionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.update('sessions', sessionId, sessionData);
      
      if (result.success) {
        const updatedSession = { ...sessionData, id: sessionId };
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? updatedSession : session
          ),
          isLoading: false
        }));
        
        toast.success('Session updated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to update session';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  completeSession: async (sessionId, completionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.update('sessions', sessionId, {
        ...completionData,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
      
      if (result.success) {
        const completedSession = { ...completionData, id: sessionId, status: 'completed' };
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? completedSession : session
          ),
          isLoading: false
        }));
        
        toast.success('Session completed successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to complete session';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchBuddyPerformance: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const result = await dbService.query('performance', [
        { field: 'buddyId', operator: '==', value: currentUser.uid }
      ]);
      
      if (result.success) {
        set({
          performance: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch performance data';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Patient Actions
  fetchPatientDashboard: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const [sessions, careTeam] = await Promise.all([
        dbService.query('sessions', [
          { field: 'patientId', operator: '==', value: currentUser.uid }
        ]),
        getCareTeam()
      ]);
      
      if (sessions.success) {
        const stats = {
          totalSessions: sessions.data.length,
          completedSessions: sessions.data.filter(s => s.status === 'completed').length,
          averageRating: calculateAverageRating(sessions.data),
          progress: calculateProgress(sessions.data)
        };
        
        set({
          sessions: sessions.data,
          stats: {
            ...get().stats,
            patient: stats
          },
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch patient dashboard';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  fetchPatientSessions: async (params = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');
      
      const result = await dbService.query('sessions', [
        { field: 'patientId', operator: '==', value: currentUser.uid }
      ]);
      
      if (result.success) {
        set({
          sessions: result.data,
          isLoading: false
        });
        
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to fetch sessions';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  rateSession: async (sessionId, ratingData) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await dbService.create('ratings', {
        sessionId,
        ...ratingData,
        ratedAt: new Date().toISOString()
      });
      
      if (result.success) {
        // Update the session with rating data
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? {
              ...session,
              patientRating: ratingData.rating,
              patientComments: ratingData.comments,
              ratingDetails: ratingData,
              ratingDate: new Date().toISOString()
            } : session
          ),
          isLoading: false
        }));
        
        toast.success('Session rated successfully');
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.message || 'Failed to rate session';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  },

  // Helper functions
  calculateNewAverageRating: (buddy, newRating) => {
    const currentTotal = (buddy.averageRating || 0) * (buddy.totalRatings || 0);
    const newTotal = currentTotal + newRating;
    const newCount = (buddy.totalRatings || 0) + 1;
    return newCount > 0 ? newTotal / newCount : newRating;
  },

  // Utility functions for buddy management
  getBuddies: () => {
    return get().users.filter(user => user.role === 'medicalBuddy');
  },

  getUnassignedPatients: () => {
    return get().patients.filter(patient => !patient.assignedBuddy);
  },

  getAvailableBuddies: () => {
    const buddies = get().getBuddies();
    const assignedPatients = get().patients.filter(patient => patient.assignedBuddy);
    
    return buddies.filter(buddy => {
      const assignedCount = assignedPatients.filter(patient => 
        patient.assignedBuddy === buddy.id
      ).length;
      return assignedCount < 5; // Max 5 patients per buddy
    });
  },

  getBuddyWorkload: (buddyId) => {
    const assignedPatients = get().patients.filter(patient => 
      patient.assignedBuddy === buddyId
    );
    
    const activeSessions = get().sessions.filter(session => 
      session.buddyId === buddyId && session.status === 'in-progress'
    );
    
    return {
      totalWorkload: assignedPatients.length + activeSessions.length,
      assignedPatients: assignedPatients.length,
      activeSessions: activeSessions.length,
      availableSlots: 5 - assignedPatients.length
    };
  },

  autoAssignBuddies: () => {
    const unassignedPatients = get().getUnassignedPatients();
    const availableBuddies = get().getAvailableBuddies();
    const assignments = [];
    
    unassignedPatients.forEach(patient => {
      const availableBuddy = availableBuddies.find(buddy => {
        const workload = get().getBuddyWorkload(buddy.id);
        return workload.assignedPatients < 5;
      });
      
      if (availableBuddy) {
        // Update patient assignment
        set(state => ({
          patients: state.patients.map(p => 
            p.id === patient.id 
              ? { ...p, assignedBuddy: availableBuddy.id }
              : p
          )
        }));
        
        assignments.push({
          patientId: patient.id,
          patientName: patient.name,
          buddyId: availableBuddy.id,
          buddyName: availableBuddy.name
        });
      }
    });
    
    return assignments;
  },

  updatePatient: async (patientId, updates) => {
    try {
      // Update in Firebase
      const result = await dbService.update('patients', patientId, updates);
      
      if (result.success) {
        // Update local state
        set(state => ({
          patients: state.patients.map(patient => 
            patient.id === patientId 
              ? { ...patient, ...updates }
              : patient
          )
        }));
        return { success: true };
      } else {
        throw new Error(result.error || 'Failed to update patient in database');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error('Failed to save patient data');
      return { success: false, error: error.message };
    }
  },

  addUser: (userData) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      ...userData,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    set(state => ({
      users: [...state.users, newUser]
    }));
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

// Helper functions
async function getCareTeam() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return {};
    
    const patientDoc = await dbService.read('patients', currentUser.uid);
    
    if (patientDoc.success) {
      const { assignedDoctor, assignedBuddy, assignedNurse } = patientDoc.data;
      const team = {};
      
      if (assignedDoctor) {
        const doctorDoc = await dbService.read('users', assignedDoctor);
        if (doctorDoc.success) team.doctor = doctorDoc.data;
      }
      
      if (assignedBuddy) {
        const buddyDoc = await dbService.read('users', assignedBuddy);
        if (buddyDoc.success) team.buddy = buddyDoc.data;
      }
      
      if (assignedNurse) {
        const nurseDoc = await dbService.read('users', assignedNurse);
        if (nurseDoc.success) team.nurse = nurseDoc.data;
      }
      
      return team;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting care team:', error);
    return {};
  }
}

function calculateAverageRating(sessions) {
  const ratedSessions = sessions.filter(s => s.rating);
  if (ratedSessions.length === 0) return 0;
  
  const totalRating = ratedSessions.reduce((sum, session) => sum + session.rating, 0);
  return Math.round((totalRating / ratedSessions.length) * 10) / 10;
}

function calculateProgress(sessions) {
  if (sessions.length === 0) return 0;
  
  const completedSessions = sessions.filter(s => s.status === 'completed');
  return Math.round((completedSessions.length / sessions.length) * 100);
}

export default useDataStore;
