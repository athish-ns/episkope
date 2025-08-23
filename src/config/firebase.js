import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - use environment variables for security
const firebaseConfig = {
  apiKey: "AIzaSyDkhLxgp_SKjbSZ-HmCRKsrJyfnqeBHFuk",
  authDomain: "reuth-936fa.firebaseapp.com",
  projectId: "reuth-936fa",
  storageBucket: "reuth-936fa.firebasestorage.app",
  messagingSenderId: "866750757272",
  appId: "1:866750757272:web:67b167db45e7c82019d3ed",
  measurementId: "G-H5R3C0NFKC"
};

// Validate required configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing required Firebase configuration: ${missingConfig.join(', ')}. Please check your environment variables.`);
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Initialize Firebase services with error handling
let auth, db, storage;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase services:', error);
  throw new Error(`Firebase services initialization failed: ${error.message}`);
}

export { auth, db, storage };
export default app;
