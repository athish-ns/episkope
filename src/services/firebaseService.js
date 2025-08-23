import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Import Firebase instances from config
import { auth, db, storage } from '../config/firebase';

// Utility function for retrying operations
const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
      console.log(`Retrying operation, attempt ${attempt + 1}/${maxRetries}`);
    }
  }
};

// Authentication Service
export const authService = {
  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const userCredential = await retryOperation(() => 
        signInWithEmailAndPassword(auth, email, password)
      );
      const user = userCredential.user;
      
      // Get user profile from Firestore
      const profile = await authService.getProfile(user.uid);
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        },
        profile: profile.success ? profile.data : null
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign up with email and password (for regular user registration)
  signUp: async (email, password, userData) => {
    try {
      const userCredential = await retryOperation(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const profileData = {
        uid: user.uid,
        email: email,
        displayName: userData.displayName || userData.fullName,
        role: userData.role || 'patient',
        department: userData.department || '',
        phone: userData.phone || '',
        tier: userData.tier || '',
        maxPatients: userData.maxPatients || 5,
        status: 'active',
        isVerified: false,
        twoFactorEnabled: false,
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await retryOperation(() => setDoc(doc(db, 'users', user.uid), profileData));
      
      // Update display name in Firebase Auth
      if (userData.displayName || userData.fullName) {
        await retryOperation(() => updateProfile(user, {
          displayName: userData.displayName || userData.fullName
        }));
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: userData.displayName || userData.fullName
        },
        profile: profileData
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create user account without affecting current session (for admin/receptionist use)
  createUserAccount: async (email, password, userData) => {
    try {
      // Store the current user before creating new account
      const currentUser = auth.currentUser;
      
      const userCredential = await retryOperation(() => 
        createUserWithEmailAndPassword(auth, email, password)
      );
      const newUser = userCredential.user;
      
      // Create user profile in Firestore
      const profileData = {
        uid: newUser.uid,
        email: email,
        displayName: userData.displayName || userData.fullName,
        role: userData.role || 'patient',
        department: userData.department || '',
        phone: userData.phone || '',
        tier: userData.tier || '',
        maxPatients: userData.maxPatients || 5,
        status: 'active',
        isVerified: false,
        twoFactorEnabled: false,
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp()
      };
      
      await retryOperation(() => setDoc(doc(db, 'users', newUser.uid), profileData));
      
      // Update display name in Firebase Auth
      if (userData.displayName || userData.fullName) {
        await retryOperation(() => updateProfile(newUser, {
          displayName: userData.displayName || userData.fullName
        }));
      }
      
      // CRITICAL FIX: We need to sign out the newly created user to prevent them from being
      // automatically signed in, but we need to do it without affecting the current user's session.
      // The solution is to use a flag in the auth store to temporarily ignore auth state changes.
      
      // Sign out the newly created user
      await retryOperation(() => signOut(auth));
      
      // Note: The auth store should have a flag set to ignore this auth state change
      // This prevents the current user from being logged out
      
      if (currentUser) {
        console.log('New user account created successfully. Auth state change will be handled by the store.');
      }
      
      return {
        success: true,
        user: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: userData.displayName || userData.fullName
        },
        profile: profileData
      };
    } catch (error) {
      console.error('Create user account error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log('Firebase signOut called')
      await retryOperation(() => signOut(auth))
      console.log('Firebase signOut completed')
      
      // Clear any local state
      localStorage.removeItem('auth-storage')
      sessionStorage.clear()
      
      return { success: true }
    } catch (error) {
      console.error('Firebase signOut error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Get user profile from Firestore
  getProfile: async (uid) => {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }
      
      const userDoc = await retryOperation(() => getDoc(doc(db, 'users', uid)));
      if (userDoc.exists()) {
        return {
          success: true,
          data: userDoc.data()
        };
      } else {
        return {
          success: false,
          error: 'User profile not found'
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Profile data is required and must be an object');
      }
      
      // Update in Firestore
      await retryOperation(() => updateDoc(doc(db, 'users', user.uid), profileData));
      
      // Update in Firebase Auth if displayName changed
      if (profileData.displayName) {
        await retryOperation(() => updateProfile(user, {
          displayName: profileData.displayName
        }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update email
  updateEmail: async (newEmail) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        throw new Error('Valid email is required');
      }
      
      await retryOperation(() => updateEmail(user, newEmail));
      
      // Update in Firestore
      await retryOperation(() => updateDoc(doc(db, 'users', user.uid), {
        email: newEmail
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Update email error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update password
  updatePassword: async (newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      await retryOperation(() => updatePassword(user, newPassword));
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Reset password
  resetPassword: async (email) => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Valid email is required');
      }
      
      await retryOperation(() => sendPasswordResetEmail(auth, email));
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user ? `User: ${user.email}` : 'No user');
      callback(user);
    });
    
    // Return cleanup function
    return unsubscribe;
  }
};

// Database Service
export const dbService = {
  // Create document
  create: async (collectionName, data, docId = null) => {
    try {
      if (!collectionName) {
        throw new Error('Collection name is required');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Data is required and must be an object');
      }
      
      let docRef;
      if (docId) {
        docRef = doc(db, collectionName, docId);
        await retryOperation(() => setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }));
      } else {
        docRef = await retryOperation(() => addDoc(collection(db, collectionName), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }));
      }
      
      return {
        success: true,
        id: docId || docRef.id
      };
    } catch (error) {
      console.error('Create document error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Read document
  read: async (collectionName, docId) => {
    try {
      if (!collectionName || !docId) {
        throw new Error('Collection name and document ID are required');
      }
      
      const docRef = doc(db, collectionName, docId);
      const docSnap = await retryOperation(() => getDoc(docRef));
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data()
        };
      } else {
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      console.error('Read document error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update document
  update: async (collectionName, docId, data) => {
    try {
      if (!collectionName || !docId) {
        throw new Error('Collection name and document ID are required');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Update data is required and must be an object');
      }
      
      const docRef = doc(db, collectionName, docId);
      await retryOperation(() => updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Update document error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete document
  delete: async (collectionName, docId) => {
    try {
      if (!collectionName || !docId) {
        throw new Error('Collection name and document ID are required');
      }
      
      const docRef = doc(db, collectionName, docId);
      await retryOperation(() => deleteDoc(docRef));
      
      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Query collection
  query: async (collectionName, filters = [], orderByConfig = null, limitCount = null) => {
    try {
      if (!collectionName) {
        throw new Error('Collection name is required');
      }
      
      if (!Array.isArray(filters)) {
        throw new Error('Filters must be an array');
      }
      
      let q = collection(db, collectionName);
      
      // Apply filters
      filters.forEach((filter, index) => {
        if (!filter.field || !filter.operator || filter.value === undefined) {
          throw new Error(`Invalid filter at index ${index}: field, operator, and value are required`);
        }
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByConfig) {
        if (!orderByConfig.field) {
          throw new Error('Order by field is required');
        }
        q = query(q, orderBy(orderByConfig.field, orderByConfig.direction || 'asc'));
      }
      
      // Apply limit
      if (limitCount) {
        if (typeof limitCount !== 'number' || limitCount <= 0) {
          throw new Error('Limit must be a positive number');
        }
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await retryOperation(() => getDocs(q));
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: documents
      };
    } catch (error) {
      console.error('Query collection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get collection with real-time updates
  getCollectionRealtime: (collectionName, callback, filters = []) => {
    if (!collectionName) {
      throw new Error('Collection name is required');
    }
    
    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }
    
    if (!Array.isArray(filters)) {
      throw new Error('Filters must be an array');
    }
    
    let q = collection(db, collectionName);
    
    // Apply filters
    filters.forEach((filter, index) => {
      if (!filter.field || !filter.operator || filter.value === undefined) {
        throw new Error(`Invalid filter at index ${index}: field, operator, and value are required`);
      }
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
    
    return onSnapshot(q, (snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(documents);
    }, (error) => {
      console.error('Real-time collection error:', error);
      callback([]);
    });
  }
};



// Storage Service
export const storageService = {
  // Upload file
  uploadFile: async (file, path) => {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete file
  deleteFile: async (path) => {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Utility functions
export const utils = {
  // Format timestamp
  formatTimestamp: (timestamp) => {
    if (!timestamp) return '';
    
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    return new Date(timestamp).toLocaleString();
  },

  // Generate unique ID
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },

  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Capitalize first letter
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Format role display
  formatRole: (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

// Export default
export default {
  auth: authService,
  db: dbService,
  storage: storageService,
  utils: utils
};
