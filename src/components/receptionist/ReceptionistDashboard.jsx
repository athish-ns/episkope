/**
 * ReceptionistDashboard Component
 * 
 * A comprehensive dashboard for healthcare receptionists to manage:
 * - Patient registration and management
 * - Session scheduling and tracking
 * - Staff account creation and management
 * - Real-time data filtering and search
 * 
 * Features:
 * - Enhanced form validation with security checks
 * - Comprehensive error handling and user feedback
 * - Loading states and submission prevention
 * - Safe data rendering with null checks
 * - Accessibility improvements
 * 
 * Security:
 * - Password strength validation (8+ chars, uppercase, lowercase, numbers)
 * - Email format validation
 * - Input sanitization and trimming
 * - Role-based access control
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  AlertTitle
} from '@mui/material';
import {
  People,
  Event,
  Assignment,
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Phone,
  Email,
  LocationOn,
  Schedule,
  CheckCircle,
  Warning,
  Error,
  Info,
  LocalHospital,
  Psychology,
  FitnessCenter,
  Star,
  ExpandMore,
  ExpandLess,
  Notifications,
  PersonAdd,
  CalendarToday,
  AccessTime,
  LocationCity,
  Business,
  Logout,
  Refresh,
  PriorityHigh,
  Security
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import useStore from '../../store';
import useAuthStore from '../../store/authStore';
import notificationService from '../../services/notificationService';
import groqService from '../../services/groqService';

const ReceptionistDashboard = () => {
  const { user, logout } = useAuthStore();
  const {
    patients,
    sessions,
    users,
    loadPatients,
    loadSessions,
    loadUsers,
    addPatient,
    updatePatient,
    deletePatient,
    addSession,
    updateSession,
    deleteSession
  } = useStore();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openPatientDialog, setOpenPatientDialog] = useState(false);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    department: '',
    phone: '',
    tier: '',
    maxPatients: 5
  });
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    medicalHistory: '',
    currentCondition: '',
    injuryDescription: '', // New field for injury description
    assignedDoctor: '',
    assignedNurse: '',
    assignedBuddy: '',
    password: '',
    confirmPassword: '',
    // Scheduling fields
    scheduleInitialAppointment: false,
    initialAppointmentDate: '',
    initialAppointmentTime: '',
    initialAppointmentType: '',
    initialAppointmentDuration: '60',
    initialAppointmentLocation: '',
    initialAppointmentNotes: '',
    scheduleFollowUp: false,
    followUpDate: '',
    followUpTime: '',
    followUpType: '',
    followUpDuration: '60',
    followUpLocation: '',
    followUpNotes: ''
  });
  const [sessionForm, setSessionForm] = useState({
    patientId: '',
    type: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    notes: '',
    assignedStaff: ''
  });

  // New state for injury assessment
  const [injuryAssessment, setInjuryAssessment] = useState(null);
  const [assessingInjury, setAssessingInjury] = useState(false);
  const [autoAssignedBuddy, setAutoAssignedBuddy] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, patients, sessions, users]);

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        loadPatients(),
        loadSessions(),
        loadUsers()
      ]);
      
      // Check for any failed operations
      const failedOperations = results
        .map((result, index) => ({ result, operation: ['patients', 'sessions', 'users'][index] }))
        .filter(({ result }) => result.status === 'rejected');
      
      if (failedOperations.length > 0) {
        const failedNames = failedOperations.map(f => f.operation).join(', ');
        toast.error(`Failed to load: ${failedNames}. Please refresh the page.`);
        console.error('Failed operations:', failedOperations);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(`Failed to load data: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    try {
      const term = searchTerm.toLowerCase().trim();
      
      // Safe filtering with null checks
      setFilteredPatients(
        (patients || []).filter(patient =>
          patient?.firstName?.toLowerCase().includes(term) ||
          patient?.lastName?.toLowerCase().includes(term) ||
          patient?.email?.toLowerCase().includes(term) ||
          patient?.phone?.includes(term)
        )
      );

      setFilteredSessions(
        (sessions || []).filter(session =>
          session?.patientName?.toLowerCase().includes(term) ||
          session?.type?.toLowerCase().includes(term) ||
          session?.location?.toLowerCase().includes(term)
        )
      );

      setFilteredUsers(
        (users || []).filter(member =>
          member?.firstName?.toLowerCase().includes(term) ||
          member?.lastName?.toLowerCase().includes(term) ||
          member?.role?.toLowerCase().includes(term) ||
          member?.email?.toLowerCase().includes(term) ||
          member?.displayName?.toLowerCase().includes(term) ||
          member?.name?.toLowerCase().includes(term)
        )
      );
    } catch (error) {
      console.error('Error filtering data:', error);
      // Reset filters on error
      setFilteredPatients(patients || []);
      setFilteredSessions(sessions || []);
      setFilteredUsers(users || []);
    }
  };

  const handlePatientSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    try {
      // Enhanced validation with better error messages
      const requiredFields = [
        { field: 'firstName', label: 'First Name' },
        { field: 'lastName', label: 'Last Name' },
        { field: 'email', label: 'Email' },
        { field: 'injuryDescription', label: 'Injury Description' } // Make injury description required
      ];
      
      for (const { field, label } of requiredFields) {
        if (!patientForm[field]?.trim()) {
          toast.error(`${label} is required`);
          return;
        }
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(patientForm.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Enhanced password validation for new patients
      if (!selectedPatient) {
        if (!patientForm.password?.trim()) {
          toast.error('Password is required for family login access');
          return;
        }
        if (patientForm.password.length < 8) {
          toast.error('Password must be at least 8 characters long for security');
          return;
        }
        if (patientForm.password !== patientForm.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        // Check for password strength
        const hasUpperCase = /[A-Z]/.test(patientForm.password);
        const hasLowerCase = /[a-z]/.test(patientForm.password);
        const hasNumbers = /\d/.test(patientForm.password);
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
          toast.error('Password must contain uppercase, lowercase, and numbers');
          return;
        }
      }

      // Prepare patient data (exclude confirmPassword from submission)
      const { confirmPassword, ...patientData } = patientForm;
      
      // Add injury assessment data if available
      if (injuryAssessment) {
        patientData.injuryAssessment = injuryAssessment;
        patientData.severityLevel = injuryAssessment.severityLevel;
        patientData.severityScore = injuryAssessment.severity;
        patientData.assignedBuddyTier = injuryAssessment.buddyTier;
      }
      
      if (selectedPatient) {
        // Check if staff assignments have changed
        const oldPatient = patients.find(p => p.id === selectedPatient.id);
        const staffAssignmentsChanged = {
          doctor: oldPatient?.assignedDoctor !== patientData.assignedDoctor,
          nurse: oldPatient?.assignedNurse !== patientData.assignedNurse,
          buddy: oldPatient?.assignedBuddy !== patientData.assignedBuddy
        };

        await updatePatient(selectedPatient.id, patientData);
        
        // Send assignment notification emails for new staff assignments
        if (staffAssignmentsChanged.doctor && patientData.assignedDoctor) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: selectedPatient.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientData.assignedDoctor,
            assignedNurse: patientData.assignedNurse,
            assignedBuddy: patientData.assignedBuddy,
            assignmentType: 'doctor'
          });
        }
        
        if (staffAssignmentsChanged.nurse && patientData.assignedNurse) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: selectedPatient.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientData.assignedDoctor,
            assignedNurse: patientData.assignedNurse,
            assignedBuddy: patientData.assignedBuddy,
            assignmentType: 'nurse'
          });
        }
        
        if (staffAssignmentsChanged.buddy && patientData.assignedBuddy) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: selectedPatient.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientData.assignedDoctor,
            assignedNurse: patientData.assignedNurse,
            assignedBuddy: patientData.assignedBuddy,
            assignmentType: 'buddy'
          });
        }
        
        toast.success('Patient updated successfully');
      } else {
        // For new patients, add role and create login credentials
        const newPatientData = {
          ...patientData,
          role: 'patient',
          status: 'active',
          createdAt: new Date().toISOString(),
          createdBy: user?.uid || 'receptionist'
        };
        
        // Add patient to the system (patientService handles Firebase auth creation)
        const result = await addPatient(newPatientData);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        // Send assignment notification emails for new staff assignments
        if (patientForm.assignedDoctor) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: result.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientForm.assignedDoctor,
            assignedNurse: patientForm.assignedNurse,
            assignedBuddy: patientForm.assignedBuddy,
            assignmentType: 'doctor'
          });
        }
        
        if (patientForm.assignedNurse) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: result.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientForm.assignedDoctor,
            assignedNurse: patientForm.assignedNurse,
            assignedBuddy: patientForm.assignedBuddy,
            assignmentType: 'nurse'
          });
        }
        
        if (patientForm.assignedBuddy) {
          await notificationService.sendAssignmentNotificationEmails({
            patientId: result.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            assignedDoctor: patientForm.assignedDoctor,
            assignedNurse: patientForm.assignedNurse,
            assignedBuddy: patientForm.assignedBuddy,
            assignmentType: 'buddy'
          });
        }
        
        // Schedule appointments if requested
        if (patientForm.scheduleInitialAppointment && patientForm.initialAppointmentDate && patientForm.initialAppointmentTime) {
          const initialSession = {
            patientId: result.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            type: patientForm.initialAppointmentType || 'consultation',
            date: patientForm.initialAppointmentDate,
            time: patientForm.initialAppointmentTime,
            duration: patientForm.initialAppointmentDuration || '60',
            location: patientForm.initialAppointmentLocation || 'Main Clinic',
            notes: patientForm.initialAppointmentNotes || 'Initial appointment scheduled during patient creation',
            status: 'scheduled',
            assignedStaff: patientForm.assignedDoctor || patientForm.assignedNurse || '',
            createdAt: new Date().toISOString(),
            createdBy: user?.uid || 'receptionist'
          };
          await addSession(initialSession);
        }
        
        if (patientForm.scheduleFollowUp && patientForm.followUpDate && patientForm.followUpTime) {
          const followUpSession = {
            patientId: result.id,
            patientName: `${patientForm.firstName} ${patientForm.lastName}`,
            type: patientForm.followUpType || 'consultation',
            date: patientForm.followUpDate,
            time: patientForm.followUpTime,
            duration: patientForm.followUpDuration || '60',
            location: patientForm.followUpLocation || 'Main Clinic',
            notes: patientForm.followUpNotes || 'Follow-up appointment scheduled during patient creation',
            status: 'scheduled',
            assignedStaff: patientForm.assignedDoctor || patientForm.assignedNurse || '',
            createdAt: new Date().toISOString(),
            createdBy: user?.uid || 'receptionist'
          };
          await addSession(followUpSession);
        }
        
        toast.success('Patient added successfully with family login access and scheduled appointments');
      }
      setOpenPatientDialog(false);
      resetPatientForm();
      loadData();
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(`Failed to save patient: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSessionSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    try {
      if (selectedSession) {
        await updateSession(selectedSession.id, sessionForm);
        toast.success('Session updated successfully');
      } else {
        await addSession(sessionForm);
        toast.success('Session added successfully');
      }
      setOpenSessionDialog(false);
      resetSessionForm();
      loadData();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error(`Failed to save session: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSubmit = async () => {
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    try {
      // Enhanced validation with better error messages
      const requiredFields = [
        { field: 'firstName', label: 'First Name' },
        { field: 'lastName', label: 'Last Name' },
        { field: 'email', label: 'Email' },
        { field: 'password', label: 'Password' },
        { field: 'role', label: 'Role' }
      ];
      
      for (const { field, label } of requiredFields) {
        if (!userForm[field]?.trim()) {
          toast.error(`${label} is required`);
          return;
        }
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userForm.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }

      // Enhanced password validation
      if (userForm.password.length < 8) {
        toast.error('Password must be at least 8 characters long for security');
        return;
      }
      
      // Check for password strength
      const hasUpperCase = /[A-Z]/.test(userForm.password);
      const hasLowerCase = /[a-z]/.test(userForm.password);
      const hasNumbers = /\d/.test(userForm.password);
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        toast.error('Password must contain uppercase, lowercase, and numbers');
        return;
      }

      // Validate passwords match
      if (userForm.password !== userForm.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      // Create user account using Firebase Auth
      const userData = {
        email: userForm.email,
        password: userForm.password,
        displayName: `${userForm.firstName} ${userForm.lastName}`,
        role: userForm.role,
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        department: userForm.department,
        phone: userForm.phone,
        tier: userForm.tier,
        maxPatients: userForm.maxPatients,
        status: 'active',
        isVerified: true,
        createdBy: user?.uid || 'receptionist',
        joinDate: new Date().toISOString()
      };

      // Import authService dynamically to avoid circular imports
      const { authService } = await import('../../services/firebaseService');
      const result = await authService.signUp(userData.email, userForm.password, userData);

      if (result.success) {
        toast.success(`User account created successfully for ${userForm.firstName} ${userForm.lastName}`);
        setOpenUserDialog(false);
        resetUserForm();
        loadData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const resetPatientForm = () => {
    try {
      setPatientForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        emergencyContact: '',
        medicalHistory: '',
        currentCondition: '',
        injuryDescription: '', // New field for injury description
        assignedDoctor: '',
        assignedNurse: '',
        assignedBuddy: '',
        password: '',
        confirmPassword: '',
        // Scheduling fields
        scheduleInitialAppointment: false,
        initialAppointmentDate: '',
        initialAppointmentTime: '',
        initialAppointmentType: '',
        initialAppointmentDuration: '60',
        initialAppointmentLocation: '',
        initialAppointmentNotes: '',
        scheduleFollowUp: false,
        followUpDate: '',
        followUpTime: '',
        followUpType: '',
        followUpDuration: '60',
        followUpLocation: '',
        followUpNotes: ''
      });
      setSelectedPatient(null);
      setInjuryAssessment(null);
      setAutoAssignedBuddy(null);
    } catch (error) {
      console.error('Error resetting patient form:', error);
      toast.error('Failed to reset form');
    }
  };

  // New function for injury assessment and auto-assignment
  const assessInjuryAndAssignBuddy = async () => {
    if (!patientForm.injuryDescription?.trim()) {
      toast.error('Please provide an injury description before assessment');
      return;
    }

    setAssessingInjury(true);
    try {
      // Call Groq API for injury assessment
      const result = await groqService.assessInjurySeverity(patientForm.injuryDescription);
      
      if (result.success) {
        setInjuryAssessment(result.assessment);
        
        // Auto-assign buddy based on severity
        const availableBuddies = users.filter(user => 
          (user.role === 'buddy' || user.role === 'medicalBuddy') && 
          user.status === 'active'
        );

        if (availableBuddies.length === 0) {
          toast.warning('No medical buddies available for assignment');
          return;
        }

        // Filter buddies by tier
        let suitableBuddies = [];
        switch (result.assessment.buddyTier) {
          case 'bronze':
            suitableBuddies = availableBuddies.filter(buddy => 
              !buddy.tier || buddy.tier === 'bronze' || buddy.tier === 'Bronze'
            );
            break;
          case 'silver':
            suitableBuddies = availableBuddies.filter(buddy => 
              buddy.tier === 'silver' || buddy.tier === 'Silver' || 
              buddy.tier === 'gold' || buddy.tier === 'Gold'
            );
            break;
          case 'gold':
            suitableBuddies = availableBuddies.filter(buddy => 
              buddy.tier === 'gold' || buddy.tier === 'Gold'
            );
            break;
          default:
            suitableBuddies = availableBuddies;
        }

        // If no suitable buddies found for the tier, use any available buddy
        if (suitableBuddies.length === 0) {
          suitableBuddies = availableBuddies;
        }

        // Select the buddy with the least current patients
        const selectedBuddy = suitableBuddies.reduce((best, current) => {
          const bestPatients = patients.filter(p => p.assignedBuddy === best.uid || p.assignedBuddy === best.id).length;
          const currentPatients = patients.filter(p => p.assignedBuddy === current.uid || p.assignedBuddy === current.id).length;
          return currentPatients < bestPatients ? current : best;
        });

        if (selectedBuddy) {
          setAutoAssignedBuddy(selectedBuddy);
          setPatientForm(prev => ({
            ...prev,
            assignedBuddy: selectedBuddy.uid || selectedBuddy.id
          }));
          
          toast.success(`Auto-assigned ${selectedBuddy.displayName || selectedBuddy.firstName + ' ' + selectedBuddy.lastName} (${result.assessment.buddyTier} tier) based on injury severity`);
        }
      } else {
        toast.error(`Assessment failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error assessing injury:', error);
      toast.error(`Failed to assess injury: ${error.message}`);
    } finally {
      setAssessingInjury(false);
    }
  };

  // Function to get tier color
  const getTierColor = (tier) => {
    if (!tier) return 'default';
    switch (tier.toLowerCase()) {
      case 'bronze':
        return 'warning';
      case 'silver':
        return 'info';
      case 'gold':
        return 'success';
      default:
        return 'default';
    }
  };

  // Function to get available buddies by tier
  const getAvailableBuddiesByTier = (tier) => {
    const availableBuddies = users.filter(user => 
      (user.role === 'buddy' || user.role === 'medicalBuddy') && 
      user.status === 'active'
    );

    if (!tier) return availableBuddies;

    switch (tier.toLowerCase()) {
      case 'bronze':
        return availableBuddies.filter(buddy => 
          !buddy.tier || buddy.tier === 'bronze' || buddy.tier === 'Bronze'
        );
      case 'silver':
        return availableBuddies.filter(buddy => 
          buddy.tier === 'silver' || buddy.tier === 'Silver' || 
          buddy.tier === 'gold' || buddy.tier === 'Gold'
        );
      case 'gold':
        return availableBuddies.filter(buddy => 
          buddy.tier === 'gold' || buddy.tier === 'Gold'
        );
      default:
        return availableBuddies;
    }
  };

  // Function to get tier description
  const getTierDescription = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'bronze':
        return 'Handles low-severity cases (0-5 severity score)';
      case 'silver':
        return 'Handles moderate-severity cases (5-8 severity score)';
      case 'gold':
        return 'Handles extreme-severity cases (8-10 severity score)';
      default:
        return 'Tier not specified';
    }
  };

  const resetSessionForm = () => {
    try {
      setSessionForm({
        patientId: '',
        type: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        notes: '',
        assignedStaff: ''
      });
      setSelectedSession(null);
    } catch (error) {
      console.error('Error resetting session form:', error);
      toast.error('Failed to reset form');
    }
  };

  const resetUserForm = () => {
    try {
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'patient',
        department: '',
        phone: '',
        tier: '',
        maxPatients: 5
      });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting user form:', error);
      toast.error('Failed to reset form');
    }
  };

  const handleEditPatient = (patient) => {
    try {
      if (!patient) {
        toast.error('Invalid patient data');
        return;
      }
      
      setSelectedPatient(patient);
      setPatientForm({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        medicalHistory: patient.medicalHistory || '',
        currentCondition: patient.currentCondition || '',
        injuryDescription: patient.injuryDescription || '', // New field for injury description
        assignedDoctor: patient.assignedDoctor || '',
        assignedNurse: patient.assignedNurse || '',
        assignedBuddy: patient.assignedBuddy || ''
      });
      setOpenPatientDialog(true);
    } catch (error) {
      console.error('Error editing patient:', error);
      toast.error('Failed to load patient data for editing');
    }
  };

  const handleEditSession = (session) => {
    try {
      if (!session) {
        toast.error('Invalid session data');
        return;
      }
      
      setSelectedSession(session);
      setSessionForm({
        patientId: session.patientId || '',
        type: session.type || '',
        date: session.date || '',
        time: session.time || '',
        duration: session.duration || '',
        location: session.location || '',
        notes: session.notes || '',
        assignedStaff: session.assignedStaff || ''
      });
      setOpenSessionDialog(true);
    } catch (error) {
      console.error('Error editing session:', error);
      toast.error('Failed to load session data for editing');
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await deletePatient(patientId);
        toast.success('Patient deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting patient:', error);
        toast.error(`Failed to delete patient: ${error.message || 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      try {
        setSubmitting(true);
        await deleteSession(sessionId);
        toast.success('Session deleted successfully');
        loadData();
      } catch (error) {
        console.error('Error deleting session:', error);
        toast.error(`Failed to delete session: ${error.message || 'Unknown error'}`);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getStatusColor = (status) => {
    try {
      if (!status) return 'default';
      switch (status.toLowerCase()) {
        case 'active':
          return 'success';
        case 'inactive':
          return 'error';
        case 'pending':
          return 'warning';
        default:
          return 'default';
      }
    } catch (error) {
      console.error('Error getting status color:', error);
      return 'default';
    }
  };

  const getSessionStatusColor = (status) => {
    try {
      if (!status) return 'default';
      switch (status.toLowerCase()) {
        case 'scheduled':
          return 'info';
        case 'in-progress':
          return 'warning';
        case 'completed':
          return 'success';
        case 'cancelled':
          return 'error';
        default:
          return 'default';
      }
    } catch (error) {
      console.error('Error getting session status color:', error);
      return 'default';
    }
  };

  const getRoleIcon = (role) => {
    try {
      if (!role) return <People />;
      switch (role.toLowerCase()) {
        case 'doctor':
          return <LocalHospital />;
        case 'nurse':
          return <Psychology />;
        case 'buddy':
        case 'medicalbuddy':
          return <FitnessCenter />;
        case 'admin':
          return <Business />;
        default:
          return <People />;
      }
    } catch (error) {
      console.error('Error getting role icon:', error);
      return <People />;
    }
  };

  // Function to calculate buddy workload
  const getBuddyWorkload = (buddyId) => {
    try {
      const assignedPatients = patients.filter(p => 
        p.assignedBuddy === buddyId || p.assignedBuddy === buddyId
      );
      
      const activePatients = assignedPatients.filter(p => p.status === 'active');
      const completedSessions = sessions.filter(s => 
        s.assignedStaff === buddyId && s.status === 'completed'
      ).length;
      
      return {
        totalPatients: assignedPatients.length,
        activePatients: activePatients.length,
        completedSessions,
        workloadPercentage: assignedPatients.length > 0 ? 
          Math.round((assignedPatients.length / 10) * 100) : 0 // Assuming max 10 patients per buddy
      };
    } catch (error) {
      console.error('Error calculating buddy workload:', error);
      return {
        totalPatients: 0,
        activePatients: 0,
        completedSessions: 0,
        workloadPercentage: 0
      };
    }
  };

  // Function to get workload color
  const getWorkloadColor = (workloadPercentage) => {
    if (workloadPercentage <= 50) return 'success';
    if (workloadPercentage <= 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Receptionist Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.displayName || user?.email}! Manage patients, appointments, and staff.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadData}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Logout />}
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Patients
                  </Typography>
                  <Typography variant="h4" component="div">
                    {(() => {
                      try {
                        return (patients || []).length;
                      } catch (error) {
                        console.error('Error calculating total patients:', error);
                        return 0;
                      }
                    })()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Today's Sessions
                  </Typography>
                  <Typography variant="h4" component="div">
                    {(() => {
                      try {
                        return (sessions || []).filter(s => {
                          if (!s?.date) return false;
                          const sessionDate = new Date(s.date);
                          const today = new Date();
                          return sessionDate.toDateString() === today.toDateString();
                        }).length;
                      } catch (error) {
                        console.error('Error calculating today\'s sessions:', error);
                        return 0;
                      }
                    })()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <Event />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Staff
                  </Typography>
                  <Typography variant="h4" component="div">
                    {(() => {
                      try {
                        return (users || []).filter(u => u?.status === 'active').length;
                      } catch (error) {
                        console.error('Error calculating active staff:', error);
                        return 0;
                      }
                    })()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Appointments
                  </Typography>
                  <Typography variant="h4" component="div">
                    {(() => {
                      try {
                        return (sessions || []).filter(s => s?.status === 'scheduled').length;
                      } catch (error) {
                        console.error('Error calculating pending appointments:', error);
                        return 0;
                      }
                    })()}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Schedule />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Medical Buddy Availability */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Bronze Tier Buddies
                </Typography>
                <Chip label="Low Severity" color="warning" size="small" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {(() => {
                  try {
                    const bronzeBuddies = getAvailableBuddiesByTier('bronze');
                    return bronzeBuddies.length;
                  } catch (error) {
                    console.error('Error calculating bronze buddies:', error);
                    return 0;
                  }
                })()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for 0-5 severity cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Silver Tier Buddies
                </Typography>
                <Chip label="Moderate Severity" color="info" size="small" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {(() => {
                  try {
                    const silverBuddies = getAvailableBuddiesByTier('silver');
                    return silverBuddies.length;
                  } catch (error) {
                    console.error('Error calculating silver buddies:', error);
                    return 0;
                  }
                })()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for 5-8 severity cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" component="div">
                  Gold Tier Buddies
                </Typography>
                <Chip label="Extreme Severity" color="success" size="small" />
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                {(() => {
                  try {
                    const goldBuddies = getAvailableBuddiesByTier('gold');
                    return goldBuddies.length;
                  } catch (error) {
                    console.error('Error calculating gold buddies:', error);
                    return 0;
                  }
                })()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available for 8-10 severity cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Buddy Workload */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Medical Buddy Workload & Availability
          </Typography>
          <Grid container spacing={2}>
            {(() => {
              try {
                const medicalBuddies = users.filter(user => 
                  (user.role === 'buddy' || user.role === 'medicalBuddy') && 
                  user.status === 'active'
                );
                
                return medicalBuddies.map((buddy) => {
                  const workload = getBuddyWorkload(buddy.uid || buddy.id);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={buddy.uid || buddy.id}>
                      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {buddy.displayName || buddy.firstName + ' ' + buddy.lastName}
                          </Typography>
                          <Chip 
                            label={buddy.tier || 'Unassigned'} 
                            color={getTierColor(buddy.tier)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {buddy.email}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2">
                            Patients: {workload.activePatients}/{workload.totalPatients}
                          </Typography>
                          <Chip 
                            label={`${workload.workloadPercentage}%`}
                            color={getWorkloadColor(workload.workloadPercentage)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Sessions: {workload.completedSessions} completed
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                });
              } catch (error) {
                console.error('Error rendering buddy workload:', error);
                return (
                  <Grid item xs={12}>
                    <Typography color="error">Error loading buddy information</Typography>
                  </Grid>
                );
              }
            })()}
          </Grid>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
                  <TextField
        fullWidth
        placeholder="Search patients, sessions, or staff..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        label="Search"
        aria-label="Search patients, sessions, or staff"
        InputProps={{
          startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => {
                  resetPatientForm();
                  setOpenPatientDialog(true);
                }}
              >
                Add Patient
              </Button>
              <Button
                variant="outlined"
                startIcon={<Event />}
                onClick={() => {
                  resetSessionForm();
                  setOpenSessionDialog(true);
                }}
              >
                Schedule Session
              </Button>
              <Button
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => {
                  resetUserForm();
                  setOpenUserDialog(true);
                }}
                sx={{ borderColor: 'primary.main', color: 'primary.main' }}
              >
                Create User Account
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label={`Patients (${(filteredPatients || []).length})`} />
          <Tab label={`Sessions (${(filteredSessions || []).length})`} />
          <Tab label={`Staff (${(filteredUsers || []).length})`} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Injury & Severity</TableCell>
                  <TableCell>Assigned Team</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredPatients || []).map((patient) => (
                  <TableRow key={patient?.id || `patient-${Math.random()}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar>
                          {(patient?.firstName?.[0] || '') + (patient?.lastName?.[0] || '') || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {patient?.firstName || 'Unknown'} {patient?.lastName || 'Patient'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {patient?.email || 'No email'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {patient?.phone || 'No phone'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <LocationOn sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {patient?.address || 'No address'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {patient?.injuryDescription ? (
                          <>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {patient.injuryDescription.length > 50 
                                ? patient.injuryDescription.substring(0, 50) + '...' 
                                : patient.injuryDescription
                              }
                            </Typography>
                            {patient?.severityScore && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={`${patient.severityScore}/10`}
                                  color={patient.severityScore <= 5 ? 'success' : patient.severityScore <= 8 ? 'warning' : 'error'}
                                  size="small"
                                />
                                <Chip 
                                  label={patient.severityLevel || 'Unknown'}
                                  color={patient.severityLevel === 'low' ? 'success' : patient.severityLevel === 'moderate' ? 'warning' : 'error'}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            )}
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No injury description
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Dr. {patient?.assignedDoctor || 'Unassigned'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Nurse: {patient?.assignedNurse || 'Unassigned'}
                        </Typography>
                        {patient?.assignedBuddy && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <FitnessCenter sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {(() => {
                                const buddy = users.find(u => u.uid === patient.assignedBuddy || u.id === patient.assignedBuddy);
                                return buddy ? `${buddy.displayName || buddy.firstName + ' ' + buddy.lastName}` : 'Unknown Buddy';
                              })()}
                            </Typography>
                            {patient?.assignedBuddyTier && (
                              <Chip 
                                label={patient.assignedBuddyTier}
                                color={getTierColor(patient.assignedBuddyTier)}
                                size="small"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={patient?.status || 'Active'}
                        color={getStatusColor(patient?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Patient">
                          <IconButton size="small" onClick={() => handleEditPatient(patient)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Patient">
                          <IconButton size="small" color="error" onClick={() => handleDeletePatient(patient?.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Session Details</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredSessions || []).map((session) => (
                  <TableRow key={session?.id || `session-${Math.random()}`}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {session?.patientName || 'Unknown Patient'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <strong>{session?.type || 'Unknown Type'}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session?.location || 'No location'} • {session?.duration || 'No duration'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {(() => {
                            try {
                              return session?.date ? new Date(session.date).toLocaleDateString() : 'No date';
                            } catch (error) {
                              console.error('Error formatting session date:', error);
                              return 'Invalid date';
                            }
                          })()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <AccessTime sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {session?.time || 'No time'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session?.status || 'Scheduled'}
                        color={getSessionStatusColor(session?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Session">
                          <IconButton size="small" onClick={() => handleEditSession(session)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Session">
                          <IconButton size="small" color="error" onClick={() => handleDeleteSession(session?.id)}>
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Staff Member</TableCell>
                  <TableCell>Role & Contact</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredUsers || []).map((member) => (
                  <TableRow key={member?.id || member?.uid || `user-${Math.random()}`}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getRoleIcon(member?.role)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {member?.firstName || member?.displayName?.split(' ')[0] || 'Unknown'} {member?.lastName || member?.displayName?.split(' ')[1] || 'User'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {member?.role || 'Unknown Role'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          <Email sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {member?.email || 'No email'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <Phone sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                          {member?.phone || 'No phone'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member?.department || 'General'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member?.status || 'Active'}
                        color={getStatusColor(member?.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Staff">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Patient Dialog */}
      <Dialog open={openPatientDialog} onClose={() => setOpenPatientDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={patientForm.firstName}
                onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={patientForm.lastName}
                onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                select
                value={patientForm.gender}
                onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={patientForm.address}
                onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={patientForm.emergencyContact}
                onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                multiline
                rows={3}
                value={patientForm.medicalHistory}
                onChange={(e) => setPatientForm({ ...patientForm, medicalHistory: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Condition"
                multiline
                rows={2}
                value={patientForm.currentCondition}
                onChange={(e) => setPatientForm({ ...patientForm, currentCondition: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Injury Description"
                multiline
                rows={3}
                value={patientForm.injuryDescription}
                onChange={(e) => setPatientForm({ ...patientForm, injuryDescription: e.target.value })}
                helperText="Describe the injury or condition for Groq AI to better understand."
                required
                error={!patientForm.injuryDescription?.trim()}
              />
            </Grid>
            
            {/* Injury Assessment and Auto-assignment */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Injury Assessment & Auto-Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Let Groq AI assess the severity of the injury and automatically assign a medical buddy based on the assessment.
              </Typography>
              <Button
                variant="outlined"
                startIcon={assessingInjury ? <CircularProgress size={20} /> : <CheckCircle />}
                onClick={assessInjuryAndAssignBuddy}
                disabled={assessingInjury || !patientForm.injuryDescription?.trim()}
                sx={{ mt: 1 }}
              >
                {assessingInjury ? 'Assessing...' : 'Assess Injury & Assign Buddy'}
              </Button>
              
              {injuryAssessment && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Injury Assessment Results</AlertTitle>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Severity Score:</strong> {injuryAssessment.severity}/10
                      </Typography>
                      <Typography variant="body2">
                        <strong>Level:</strong> {injuryAssessment.severityLevel}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Urgency:</strong> {injuryAssessment.urgency}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Recommended Buddy Tier:</strong>
                      </Typography>
                      <Chip 
                        label={injuryAssessment.buddyTier} 
                        color={getTierColor(injuryAssessment.buddyTier)}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Risk Factors:</strong> {injuryAssessment.riskFactors?.join(', ')}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Recommended Care:</strong> {injuryAssessment.recommendedCare}
                      </Typography>
                    </Grid>
                  </Grid>
                </Alert>
              )}
              
              {autoAssignedBuddy && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <AlertTitle>Auto-Assigned Medical Buddy</AlertTitle>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {autoAssignedBuddy.displayName || autoAssignedBuddy.firstName + ' ' + autoAssignedBuddy.lastName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {autoAssignedBuddy.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {autoAssignedBuddy.phone || 'Not provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tier:</strong>
                      </Typography>
                      <Chip 
                        label={autoAssignedBuddy.tier || 'Unassigned'} 
                        color={getTierColor(autoAssignedBuddy.tier)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Alert>
              )}
            </Grid>
            
            {/* Family Login Credentials Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Family Login Access
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create login credentials for patient family to track progress and access medical information.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Family Login Password"
                type="password"
                value={patientForm.password}
                onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                helperText="Password for family members to login and track patient progress"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={patientForm.confirmPassword}
                onChange={(e) => setPatientForm({ ...patientForm, confirmPassword: e.target.value })}
                helperText="Re-enter the password to confirm"
                error={patientForm.password !== patientForm.confirmPassword && patientForm.confirmPassword !== ''}
                required
              />
            </Grid>
            
            {/* Staff Assignment Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Staff Assignment
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Assign healthcare providers to this patient for comprehensive care.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Assigned Doctor</InputLabel>
                <Select
                  value={patientForm.assignedDoctor}
                  onChange={(e) => setPatientForm({ ...patientForm, assignedDoctor: e.target.value })}
                  label="Assigned Doctor"
                >
                  <MenuItem value="">
                    <em>Select Doctor</em>
                  </MenuItem>
                  {(users || []).filter(user => user.role === 'doctor').map((doctor) => (
                    <MenuItem key={doctor.uid || doctor.id} value={doctor.uid || doctor.id}>
                      {doctor.displayName || doctor.name || `${doctor.firstName} ${doctor.lastName}` || doctor.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Assigned Nurse</InputLabel>
                <Select
                  value={patientForm.assignedNurse}
                  onChange={(e) => setPatientForm({ ...patientForm, assignedNurse: e.target.value })}
                  label="Assigned Nurse"
                >
                  <MenuItem value="">
                    <em>Select Nurse</em>
                  </MenuItem>
                  {(users || []).filter(user => user.role === 'nurse').map((nurse) => (
                    <MenuItem key={nurse.uid || nurse.id} value={nurse.uid || nurse.id}>
                      {nurse.displayName || nurse.name || `${nurse.firstName} ${nurse.lastName}` || nurse.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Assigned Buddy</InputLabel>
                <Select
                  value={patientForm.assignedBuddy}
                  onChange={(e) => setPatientForm({ ...patientForm, assignedBuddy: e.target.value })}
                  label="Assigned Buddy"
                >
                  <MenuItem value="">
                    <em>Select Medical Buddy</em>
                  </MenuItem>
                  {(users || []).filter(user => user.role === 'buddy' || user.role === 'Medical Buddy').map((buddy) => (
                    <MenuItem key={buddy.uid || buddy.id} value={buddy.uid || buddy.id}>
                      {buddy.displayName || buddy.name || `${buddy.firstName} ${buddy.lastName}` || buddy.email}
                      {buddy.tier && ` (${buddy.tier} Tier)`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Scheduling Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1 }}>
                Schedule Initial Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Optionally schedule initial appointments and follow-ups while creating the patient.
              </Typography>
            </Grid>
            
            {/* Initial Appointment */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <input
                  type="checkbox"
                  id="scheduleInitial"
                  checked={patientForm.scheduleInitialAppointment}
                  onChange={(e) => setPatientForm({ ...patientForm, scheduleInitialAppointment: e.target.checked })}
                />
                <label htmlFor="scheduleInitial">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Schedule Initial Appointment
                  </Typography>
                </label>
              </Box>
            </Grid>
            
            {patientForm.scheduleInitialAppointment && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Date"
                    type="date"
                    value={patientForm.initialAppointmentDate}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Time"
                    type="time"
                    value={patientForm.initialAppointmentTime}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Appointment Type"
                    select
                    value={patientForm.initialAppointmentType}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentType: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Type</option>
                    <option value="consultation">Initial Consultation</option>
                    <option value="assessment">Health Assessment</option>
                    <option value="therapy">Therapy Session</option>
                    <option value="exercise">Exercise Session</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={patientForm.initialAppointmentDuration}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentDuration: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={patientForm.initialAppointmentLocation}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentLocation: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Appointment Notes"
                    multiline
                    rows={2}
                    value={patientForm.initialAppointmentNotes}
                    onChange={(e) => setPatientForm({ ...patientForm, initialAppointmentNotes: e.target.value })}
                  />
                </Grid>
              </>
            )}
            
            {/* Follow-up Appointment */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 2 }}>
                <input
                  type="checkbox"
                  id="scheduleFollowUp"
                  checked={patientForm.scheduleFollowUp}
                  onChange={(e) => setPatientForm({ ...patientForm, scheduleFollowUp: e.target.checked })}
                />
                <label htmlFor="scheduleFollowUp">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Schedule Follow-up Appointment
                  </Typography>
                </label>
              </Box>
            </Grid>
            
            {patientForm.scheduleFollowUp && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Follow-up Date"
                    type="date"
                    value={patientForm.followUpDate}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Follow-up Time"
                    type="time"
                    value={patientForm.followUpTime}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Follow-up Type"
                    select
                    value={patientForm.followUpType}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpType: e.target.value })}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select Type</option>
                    <option value="consultation">Follow-up Consultation</option>
                    <option value="assessment">Progress Assessment</option>
                    <option value="therapy">Therapy Session</option>
                    <option value="exercise">Exercise Session</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration (minutes)"
                    type="number"
                    value={patientForm.followUpDuration}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpDuration: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={patientForm.followUpLocation}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpLocation: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Follow-up Notes"
                    multiline
                    rows={2}
                    value={patientForm.followUpNotes}
                    onChange={(e) => setPatientForm({ ...patientForm, followUpNotes: e.target.value })}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPatientDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handlePatientSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (selectedPatient ? 'Update' : 'Add') + ' Patient'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Session Dialog */}
      <Dialog open={openSessionDialog} onClose={() => setOpenSessionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSession ? 'Edit Session' : 'Schedule New Session'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient"
                select
                value={sessionForm.patientId}
                onChange={(e) => setSessionForm({ ...sessionForm, patientId: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Type"
                select
                value={sessionForm.type}
                onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Type</option>
                <option value="exercise">Exercise</option>
                <option value="therapy">Therapy</option>
                <option value="assessment">Assessment</option>
                <option value="consultation">Consultation</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={sessionForm.date}
                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                value={sessionForm.time}
                onChange={(e) => setSessionForm({ ...sessionForm, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={sessionForm.duration}
                onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={sessionForm.notes}
                onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Assigned Staff"
                value={sessionForm.assignedStaff}
                onChange={(e) => setSessionForm({ ...sessionForm, assignedStaff: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSessionDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSessionSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Saving...' : (selectedSession ? 'Update' : 'Schedule') + ' Session'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Creation Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Create New User Account
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={userForm.confirmPassword}
                onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="patient">Patient</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="medicalBuddy">Medical Buddy</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={userForm.department}
                onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tier</InputLabel>
                <Select
                  value={userForm.tier}
                  onChange={(e) => setUserForm({ ...userForm, tier: e.target.value })}
                  label="Tier"
                  disabled={userForm.role !== 'medicalBuddy'}
                >
                  <MenuItem value="">
                    <em>Select Tier</em>
                  </MenuItem>
                  <MenuItem value="bronze">Bronze - Low Severity Cases</MenuItem>
                  <MenuItem value="silver">Silver - Moderate Severity Cases</MenuItem>
                  <MenuItem value="gold">Gold - Extreme Severity Cases</MenuItem>
                </Select>
                {userForm.role === 'medicalBuddy' && (
                  <FormHelperText>
                    {userForm.tier ? getTierDescription(userForm.tier) : 'Select a tier for the medical buddy'}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Patients"
                type="number"
                value={userForm.maxPatients}
                onChange={(e) => setUserForm({ ...userForm, maxPatients: parseInt(e.target.value) || 5 })}
                disabled={userForm.role !== 'medicalBuddy'}
                helperText={userForm.role === 'medicalBuddy' ? 'Maximum number of patients this buddy can handle simultaneously' : ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleUserSubmit} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Creating...' : 'Create User Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReceptionistDashboard;
