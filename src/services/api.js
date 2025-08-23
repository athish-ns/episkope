import { authService, dbService } from './firebaseService';
import { toast } from 'react-hot-toast';

// Real-time API service using Firebase and backend integration
const api = {
  get: async (url, config = {}) => {
    try {
      const path = url.replace('/api', '');
      const params = config.params || {};
      
      if (path.startsWith('/auth/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'profile': {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');
            const userDoc = await dbService.read('users', user.uid);
            return { data: userDoc.data };
          }
          default:
            throw new Error('Unknown auth endpoint');
        }
      } else if (path.startsWith('/admin/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'dashboard': {
            const stats = await getAdminStats();
            return { data: stats };
          }
          case 'users': {
            const users = await dbService.query('users', [], { field: 'joinDate', direction: 'desc' });
            return { data: users.data };
          }
          case 'system-stats': {
            const systemStats = await getAdminStats();
            return { data: systemStats };
          }
          default:
            throw new Error('Unknown admin endpoint');
        }
      } else if (path.startsWith('/doctor/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'dashboard': {
            const doctorStats = await getDoctorStats();
            return { data: doctorStats };
          }
          case 'patients': {
            const patients = await dbService.query('patients', [], { field: 'createdAt', direction: 'desc' });
            return { data: patients.data };
          }
          default:
            throw new Error('Unknown doctor endpoint');
        }
      } else if (path.startsWith('/nurse/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'dashboard': {
            const nurseStats = await getNurseStats();
            return { data: nurseStats };
          }
          case 'patients': {
            const patients = await dbService.query('patients', [], { field: 'createdAt', direction: 'desc' });
            return { data: patients.data };
          }
          default:
            throw new Error('Unknown nurse endpoint');
        }
      } else if (path.startsWith('/buddy/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'dashboard': {
            const buddyStats = await getBuddyStats();
            return { data: buddyStats };
          }
          case 'patients': {
            const patients = await dbService.query('patients', [], { field: 'createdAt', direction: 'desc' });
            return { data: patients.data };
          }
          case 'sessions': {
            const sessions = await dbService.query('sessions', [], { field: 'createdAt', direction: 'desc' });
            return { data: sessions.data };
          }
          case 'performance': {
            const performance = await dbService.query('performance', [], { field: 'createdAt', direction: 'desc' });
            return { data: performance.data };
          }
          default:
            throw new Error('Unknown buddy endpoint');
        }
      } else if (path.startsWith('/patient/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'dashboard': {
            const patientStats = await getPatientStats();
            return { data: patientStats };
          }
          case 'profile': {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('User not authenticated');
            const patientDoc = await dbService.read('patients', user.uid);
            return { data: patientDoc.data };
          }
          case 'care-team': {
            const careTeam = await getCareTeam();
            return { data: careTeam };
          }
          case 'sessions': {
            const sessions = await dbService.query('sessions', [
              { field: 'patientId', operator: '==', value: authService.getCurrentUser()?.uid }
            ], { field: 'createdAt', direction: 'desc' });
            return { data: sessions.data };
          }
          case 'progress': {
            const progress = await getPatientProgress();
            return { data: progress };
          }
          case 'daily-plan': {
            const dailyPlan = await getDailyPlan(params.date);
            return { data: dailyPlan };
          }
          default:
            throw new Error('Unknown patient endpoint');
        }
      } else if (path.startsWith('/system/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'status': {
            const status = await getSystemStatus();
            return { data: status };
          }
          case 'quantum-status': {
            const quantumStatus = await getQuantumStatus();
            return { data: quantumStatus };
          }
          default:
            throw new Error('Unknown system endpoint');
        }
      }
      
      throw new Error('Unknown endpoint');
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      const path = url.replace('/api', '');
      
      if (path.startsWith('/auth/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'login': {
            const loginResult = await authService.signIn(data.email, data.password);
            if (loginResult.success) {
              const userDoc = await dbService.read('users', loginResult.user.uid);
              return { data: { user: loginResult.user, profile: userDoc.data } };
            } else {
              throw new Error(loginResult.error);
            }
          }
          case 'register': {
            const registerResult = await authService.signUp(data.email, data.password, data);
            if (registerResult.success) {
              const userDoc = await dbService.read('users', registerResult.user.uid);
              return { data: { user: registerResult.user, profile: userDoc.data } };
            } else {
              throw new Error(registerResult.error);
            }
          }
          case 'logout': {
            const logoutResult = await authService.signOut();
            if (logoutResult.success) {
              return { data: { message: 'Logged out successfully' } };
            } else {
              throw new Error(logoutResult.error);
            }
          }
          case 'forgot-password': {
            const resetResult = await authService.resetPassword(data.email);
            if (resetResult.success) {
              return { data: { message: 'Password reset email sent' } };
            } else {
              throw new Error(resetResult.error);
            }
          }
          default:
            throw new Error('Unknown auth endpoint');
        }
      } else if (path.startsWith('/admin/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'users': {
            const createResult = await dbService.create('users', data, data.uid);
            if (createResult.success) {
              return { data: { id: createResult.id, message: 'User created successfully' } };
            } else {
              throw new Error(createResult.error);
            }
          }
          default:
            throw new Error('Unknown admin endpoint');
        }
      } else if (path.startsWith('/buddy/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'sessions': {
            const sessionResult = await dbService.create('sessions', data);
            if (sessionResult.success) {
              return { data: { id: sessionResult.id, message: 'Session created successfully' } };
            } else {
              throw new Error(sessionResult.error);
            }
          }
          default:
            throw new Error('Unknown buddy endpoint');
        }
      } else if (path.startsWith('/patient/')) {
        if (path.includes('/rate')) {
          const sessionId = path.split('/')[3];
          const ratingResult = await dbService.create('ratings', {
            sessionId,
            patientId: authService.getCurrentUser()?.uid,
            rating: data.rating,
            comment: data.comment
          });
          if (ratingResult.success) {
            return { data: { message: 'Rating submitted successfully' } };
          } else {
            throw new Error(ratingResult.error);
          }
        }
        throw new Error('Unknown patient endpoint');
      }
      
      throw new Error('Unknown endpoint');
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      const path = url.replace('/api', '');
      
      if (path.startsWith('/admin/')) {
        const action = path.split('/')[2];
        if (action === 'users') {
          const userId = path.split('/')[3];
          const updateResult = await dbService.update('users', userId, data);
          if (updateResult.success) {
            return { data: { message: 'User updated successfully' } };
          } else {
            throw new Error(updateResult.error);
          }
        }
      } else if (path.startsWith('/doctor/')) {
        if (path.includes('/care-plan')) {
          const patientId = path.split('/')[3];
          const carePlanResult = await dbService.create('carePlans', {
            patientId,
            ...data
          });
          if (carePlanResult.success) {
            return { data: { message: 'Care plan updated successfully' } };
          } else {
            throw new Error(carePlanResult.error);
          }
        }
      } else if (path.startsWith('/nurse/')) {
        if (path.includes('/vitals')) {
          const patientId = path.split('/')[3];
          const vitalsResult = await dbService.create('vitals', {
            patientId,
            ...data
          });
          if (vitalsResult.success) {
            return { data: { message: 'Vitals updated successfully' } };
          } else {
            throw new Error(vitalsResult.error);
          }
        }
      } else if (path.startsWith('/buddy/')) {
        const action = path.split('/')[2];
        if (action === 'sessions') {
          const sessionId = path.split('/')[3];
          const sessionResult = await dbService.update('sessions', sessionId, data);
          if (sessionResult.success) {
            return { data: { message: 'Session updated successfully' } };
          } else {
            throw new Error(sessionResult.error);
          }
        }
      } else if (path.startsWith('/patient/')) {
        const action = path.split('/')[2];
        switch (action) {
          case 'profile': {
            const profileResult = await authService.updateProfile(data);
            if (profileResult.success) {
              return { data: { message: 'Profile updated successfully' } };
            } else {
              throw new Error(profileResult.error);
            }
          }
          default:
            throw new Error('Unknown patient endpoint');
        }
      }
      
      throw new Error('Unknown endpoint');
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      const path = url.replace('/api', '');
      
      if (path.startsWith('/admin/')) {
        const action = path.split('/')[2];
        if (action === 'users') {
          const userId = path.split('/')[3];
          const deleteResult = await dbService.delete('users', userId);
          if (deleteResult.success) {
            return { data: { message: 'User deleted successfully' } };
          } else {
            throw new Error(deleteResult.error);
          }
        }
      }
      
      throw new Error('Unknown endpoint');
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

// Helper functions for dashboard data using real Firebase data
async function getAdminStats() {
  try {
    const [users, patients, sessions, carePlans] = await Promise.all([
      dbService.query('users', [], { field: 'joinDate', direction: 'desc' }),
      dbService.query('patients', [], { field: 'createdAt', direction: 'desc' }),
      dbService.query('sessions', [], { field: 'createdAt', direction: 'desc' }),
      dbService.query('carePlans', [], { field: 'createdAt', direction: 'desc' })
    ]);

    // Calculate role distribution
    const roleDistribution = {};
    users.data.forEach(user => {
      const role = user.role || 'unknown';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    // Get recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentUsers = users.data.filter(user => 
      user.joinDate && new Date(user.joinDate.toDate ? user.joinDate.toDate() : user.joinDate) >= weekAgo
    );
    
    const recentSessions = sessions.data.filter(session => 
      session.createdAt && new Date(session.createdAt.toDate ? session.createdAt.toDate() : session.createdAt) >= weekAgo
    );

    return {
      overview: {
        totalUsers: users.data.length,
        totalPatients: patients.data.length,
        totalSessions: sessions.data.length,
        totalCarePlans: carePlans.data.length
      },
      roleDistribution,
      recentActivity: {
        newUsers: recentUsers.length,
        newSessions: recentSessions.length
      },
      systemHealth: {
        status: 'operational',
        lastCheck: new Date().toISOString(),
        totalCollections: 5,
        activeConnections: users.data.length
      },
      recentUsers: recentUsers.slice(0, 5),
      recentSessions: recentSessions.slice(0, 5)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting admin stats:', error);
    }
    return {
      overview: { totalUsers: 0, totalPatients: 0, totalSessions: 0, totalCarePlans: 0 },
      roleDistribution: {},
      recentActivity: { newUsers: 0, newSessions: 0 },
      systemHealth: { status: 'error', lastCheck: new Date().toISOString() }
    };
  }
}

async function getDoctorStats() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return {};
    
    const patients = await dbService.query('patients', [
      { field: 'assignedDoctor', operator: '==', value: currentUser.uid }
    ]);
    
    const sessions = await dbService.query('sessions', [
      { field: 'doctorId', operator: '==', value: currentUser.uid }
    ]);

    return {
      totalPatients: patients.data.length,
      totalSessions: sessions.data.length,
      recentPatients: patients.data.slice(0, 5),
      recentSessions: sessions.data.slice(0, 5)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting doctor stats:', error);
    }
    return { totalPatients: 0, totalSessions: 0, recentPatients: [], recentSessions: [] };
  }
}

async function getNurseStats() {
  try {
    const patients = await dbService.query('patients', [], { field: 'createdAt', direction: 'desc' });
    const sessions = await dbService.query('sessions', [], { field: 'createdAt', direction: 'desc' });

    return {
      totalPatients: patients.data.length,
      totalSessions: sessions.data.length,
      recentPatients: patients.data.slice(0, 5),
      recentSessions: sessions.data.slice(0, 5)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting nurse stats:', error);
    }
    return { totalPatients: 0, totalSessions: 0, recentPatients: [], recentSessions: [] };
  }
}

async function getBuddyStats() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return {};
    
    const patients = await dbService.query('patients', [
      { field: 'assignedBuddy', operator: '==', value: currentUser.uid }
    ]);
    
    const sessions = await dbService.query('sessions', [
      { field: 'buddyId', operator: '==', value: currentUser.uid }
    ]);

    return {
      totalPatients: patients.data.length,
      totalSessions: sessions.data.length,
      recentPatients: patients.data.slice(0, 5),
      recentSessions: sessions.data.slice(0, 5)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting buddy stats:', error);
    }
    return { totalPatients: 0, totalSessions: 0, recentPatients: [], recentSessions: [] };
  }
}

async function getPatientStats() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return {};
    
    const sessions = await dbService.query('sessions', [
      { field: 'patientId', operator: '==', value: currentUser.uid }
    ], { field: 'createdAt', direction: 'desc' });

    return {
      totalSessions: sessions.data.length,
      recentSessions: sessions.data.slice(0, 5)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting patient stats:', error);
    }
    return { totalSessions: 0, recentSessions: [] };
  }
}

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
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting care team:', error);
    }
    return {};
  }
}

async function getPatientProgress() {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return {};
    
    const sessions = await dbService.query('sessions', [
      { field: 'patientId', operator: '==', value: currentUser.uid }
    ], { field: 'createdAt', direction: 'desc' });

    return {
      totalSessions: sessions.data.length,
      completedSessions: sessions.data.filter(s => s.status === 'completed').length,
      averageRating: calculateAverageRating(sessions.data),
      recentProgress: sessions.data.slice(0, 10)
    };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting patient progress:', error);
    }
    return { totalSessions: 0, completedSessions: 0, averageRating: 0, recentProgress: [] };
  }
}

async function getDailyPlan(date) {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return { activities: [], notes: '' };
    
    const plans = await dbService.query('dailyPlans', [
      { field: 'patientId', operator: '==', value: currentUser.uid },
      { field: 'date', operator: '==', value: date }
    ]);

    if (plans.success && plans.data.length > 0) {
      return plans.data[0];
    }
    
    return { activities: [], notes: '' };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting daily plan:', error);
    }
    return { activities: [], notes: '' };
  }
}

async function getSystemStatus() {
  try {
    const status = await dbService.read('system', 'status');
    if (status.success) {
      return status.data;
    }
    return { status: 'operational', lastCheck: new Date().toISOString() };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting system status:', error);
    }
    return { status: 'operational', lastCheck: new Date().toISOString() };
  }
}

async function getQuantumStatus() {
  try {
    const quantum = await dbService.read('system', 'quantum');
    if (quantum.success) {
      return quantum.data;
    }
    return { status: 'inactive', lastUpdate: new Date().toISOString() };
  } catch (error) {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting quantum status:', error);
    }
    return { status: 'inactive', lastUpdate: new Date().toISOString() };
  }
}

function calculateAverageRating(sessions) {
  const ratedSessions = sessions.filter(s => s.rating);
  if (ratedSessions.length === 0) return 0;
  
  const totalRating = ratedSessions.reduce((sum, session) => sum + session.rating, 0);
  return Math.round((totalRating / ratedSessions.length) * 10) / 10;
}

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUsers: async (params = {}) => {
    try {
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {

      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/system-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Doctor API
export const doctorAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/doctor/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPatients: async (params = {}) => {
    try {
      const response = await api.get('/doctor/patients', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePatientCarePlan: async (patientId, carePlan) => {
    try {
      const response = await api.put(`/doctor/patients/${patientId}/care-plan`, carePlan);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Nurse API
export const nurseAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/nurse/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPatients: async (params = {}) => {
    try {
      const response = await api.get('/nurse/patients', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePatientVitals: async (patientId, vitals) => {
    try {
      const response = await api.put(`/nurse/patients/${patientId}/vitals`, vitals);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Buddy API
export const buddyAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/buddy/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPatients: async (params = {}) => {
    try {
      const response = await api.get('/buddy/patients', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSessions: async (params = {}) => {
    try {
      const response = await api.get('/buddy/sessions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createSession: async (sessionData) => {
    try {
      const response = await api.post('/buddy/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await api.put(`/buddy/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPerformance: async (params = {}) => {
    try {
      const response = await api.get('/buddy/performance', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Patient API
export const patientAPI = {
  getDashboard: async () => {
    try {
      const response = await api.get('/patient/dashboard');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/patient/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/patient/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCareTeam: async () => {
    try {
      const response = await api.get('/patient/care-team');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSessions: async (params = {}) => {
    try {
      const response = await api.get('/patient/sessions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rateSession: async (sessionId, rating) => {
    try {
      const response = await api.post(`/patient/sessions/${sessionId}/rate`, rating);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProgress: async () => {
    try {
      const response = await api.get('/patient/progress');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDailyPlan: async (date) => {
    try {
      const response = await api.get('/patient/daily-plan', { params: { date } });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// System API
export const systemAPI = {
  getStatus: async () => {
    try {
      const response = await api.get('/system/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getQuantumStatus: async () => {
    try {
      const response = await api.get('/system/quantum-status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Utility functions
export const apiUtils = {
  handleError: (error) => {
    // Log error for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    if (error.message.includes('User not authenticated')) {
      toast.error('Please login to continue');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.message.includes('Access denied')) {
      toast.error('Access denied. You do not have permission for this action.');
    } else if (error.message.includes('not found')) {
      toast.error('Resource not found.');
    } else {
      toast.error(error.message || 'An error occurred');
    }
  }
};

export default api;
