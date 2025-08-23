import { db } from './firebaseService.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import emailService from './emailService.js';

/**
 * Patient Email Service
 * Handles sending emails to staff members based on patient assignments
 */
class PatientEmailService {
  constructor() {
    this.db = db;
  }

  /**
   * Send assignment notification emails to all assigned staff
   * @param {string} patientId - Patient ID
   * @param {string} assignmentType - Type of assignment (doctor, nurse, buddy)
   * @param {string} staffId - Staff member ID being assigned
   * @param {string} patientName - Patient name for the email
   */
  async sendAssignmentNotification(patientId, assignmentType, staffId, patientName) {
    try {
      console.log(`📧 Sending ${assignmentType} assignment notification for patient: ${patientName}`);

      // Get staff member details from Firebase
      const staffEmail = await this.getStaffEmail(staffId, assignmentType);
      
      if (!staffEmail) {
        console.warn(`⚠️ No email found for ${assignmentType} with ID: ${staffId}`);
        return { success: false, error: 'Staff email not found' };
      }

      // Get staff member name
      const staffName = await this.getStaffName(staffId, assignmentType);

      // Send assignment email
      const emailResult = await this.sendAssignmentEmail(
        staffEmail, 
        staffName, 
        assignmentType, 
        patientName, 
        patientId
      );

      // Log the assignment in Firebase
      await this.logEmailSent(patientId, staffId, assignmentType, 'assignment', emailResult);

      return emailResult;

    } catch (error) {
      console.error(`❌ Error sending assignment notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send emergency notification emails to all assigned staff
   * @param {string} patientId - Patient ID
   * @param {Object} emergencyData - Emergency details
   */
  async sendEmergencyNotification(patientId, emergencyData) {
    try {
      console.log(`🚨 Sending emergency notification for patient: ${emergencyData.patientName}`);

      // Get all assigned staff for this patient
      const assignedStaff = await this.getPatientAssignedStaff(patientId);
      
      if (!assignedStaff || assignedStaff.length === 0) {
        console.warn(`⚠️ No assigned staff found for patient: ${patientId}`);
        return { success: false, error: 'No assigned staff found' };
      }

      const emailPromises = [];
      const results = [];

      // Send emergency emails to all assigned staff
      for (const staff of assignedStaff) {
        const emailPromise = this.sendEmergencyEmailToStaff(staff, emergencyData);
        emailPromises.push(emailPromise);
      }

      // Wait for all emails to be sent
      const emailResults = await Promise.allSettled(emailPromises);
      
      // Process results
      emailResults.forEach((result, index) => {
        const staff = assignedStaff[index];
        if (result.status === 'fulfilled') {
          results.push({
            staffId: staff.id,
            staffRole: staff.role,
            success: true,
            result: result.value
          });
          
          // Log successful email
          this.logEmailSent(patientId, staff.id, staff.role, 'emergency', result.value);
        } else {
          results.push({
            staffId: staff.id,
            staffRole: staff.role,
            success: false,
            error: result.reason
          });
        }
      });

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`📧 Emergency emails sent: ${successful} successful, ${failed} failed`);

      return {
        success: true,
        totalStaff: assignedStaff.length,
        successful,
        failed,
        results
      };

    } catch (error) {
      console.error(`❌ Error sending emergency notification:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send progress update emails to assigned staff
   * @param {string} patientId - Patient ID
   * @param {Object} progressData - Progress update details
   */
  async sendProgressUpdate(patientId, progressData) {
    try {
      console.log(`📊 Sending progress update for patient: ${progressData.patientName}`);

      // Get assigned staff
      const assignedStaff = await this.getPatientAssignedStaff(patientId);
      
      if (!assignedStaff || assignedStaff.length === 0) {
        return { success: false, error: 'No assigned staff found' };
      }

      const emailPromises = [];
      
      // Send progress update emails
      for (const staff of assignedStaff) {
        const emailPromise = this.sendProgressEmailToStaff(staff, progressData);
        emailPromises.push(emailPromise);
      }

      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return {
        success: true,
        totalStaff: assignedStaff.length,
        successful,
        failed
      };

    } catch (error) {
      console.error(`❌ Error sending progress update:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get staff email from Firebase based on staff ID and role
   * @param {string} staffId - Staff member ID
   * @param {string} role - Staff role (doctor, nurse, medicalBuddy)
   * @returns {Promise<string|null>} Staff email address
   */
  async getStaffEmail(staffId, role) {
    try {
      if (!staffId) return null;
      
      console.log(`🔍 Looking for ${role} with ID: ${staffId}`);
      
      // First try to find in the specific role collections
      let collectionName;
      
      switch (role) {
        case 'doctor':
          collectionName = 'doctors';
          break;
        case 'nurse':
          collectionName = 'nurses';
          break;
        case 'medicalBuddy':
          collectionName = 'medicalBuddies';
          break;
        case 'buddy': // Keep backward compatibility
          collectionName = 'medicalBuddies';
          break;
        default:
          console.warn(`⚠️ Unknown role: ${role}`);
          return null;
      }

      // Try to get from the specific collection first
      try {
        const staffDoc = await getDoc(doc(db, collectionName, staffId));
        if (staffDoc.exists()) {
          const staffData = staffDoc.data();
          console.log(`✅ Found ${role} in ${collectionName} collection:`, staffData.email);
          return staffData.email || null;
        }
      } catch (error) {
        console.log(`No document found in ${collectionName} collection for ID: ${staffId}`);
      }

      // If not found in specific collection, try to find in users collection
      try {
        const userDoc = await getDoc(doc(db, 'users', staffId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`🔍 Found user in users collection:`, { 
            uid: userData.uid, 
            role: userData.role, 
            email: userData.email 
          });
          
          // Check if this user has the expected role with flexible matching
          const roleMatches = 
            userData.role === role || 
            (role === 'medicalBuddy' && (userData.role === 'medicalBuddy' || userData.role === 'buddy')) ||
            (role === 'buddy' && (userData.role === 'medicalBuddy' || userData.role === 'buddy')) ||
            (role === 'doctor' && userData.role === 'doctor') ||
            (role === 'nurse' && userData.role === 'nurse');
          
          if (roleMatches) {
            console.log(`✅ Role match found for ${role}: ${userData.email}`);
            return userData.email || null;
          } else {
            console.log(`❌ Role mismatch: expected ${role}, found ${userData.role}`);
          }
        }
      } catch (error) {
        console.log(`No document found in users collection for ID: ${staffId}`);
      }

      console.warn(`⚠️ No email found for ${role} with ID: ${staffId} in any collection`);
      return null;

    } catch (error) {
      console.error(`❌ Error getting staff email:`, error);
      return null;
    }
  }

  /**
   * Get staff name from Firebase
   * @param {string} staffId - Staff member ID
   * @param {string} role - Staff role
   * @returns {Promise<string>} Staff name
   */
  async getStaffName(staffId, role) {
    try {
      if (!staffId) return 'Staff Member';
      
      console.log(`🔍 Looking for ${role} name with ID: ${staffId}`);
      
      // First try to find in the specific role collections
      let collectionName;
      
      switch (role) {
        case 'doctor':
          collectionName = 'doctors';
          break;
        case 'nurse':
          collectionName = 'nurses';
          break;
        case 'medicalBuddy':
          collectionName = 'medicalBuddies';
          break;
        case 'buddy': // Keep backward compatibility
          collectionName = 'medicalBuddies';
          break;
        default:
          return 'Staff Member';
      }

      // Try to get from the specific collection first
      try {
        const staffDoc = await getDoc(doc(db, collectionName, staffId));
        if (staffDoc.exists()) {
          const staffData = staffDoc.data();
          const name = staffData.name || staffData.fullName || 'Staff Member';
          console.log(`✅ Found ${role} name in ${collectionName} collection:`, name);
          return name;
        }
      } catch (error) {
        console.log(`No document found in ${collectionName} collection for ID: ${staffId}`);
      }

      // If not found in specific collection, try to find in users collection
      try {
        const userDoc = await getDoc(doc(db, 'users', staffId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`🔍 Found user in users collection:`, { 
            uid: userData.uid, 
            role: userData.role, 
            firstName: userData.firstName,
            lastName: userData.lastName
          });
          
          // Check if this user has the expected role with flexible matching
          const roleMatches = 
            userData.role === role || 
            (role === 'medicalBuddy' && (userData.role === 'medicalBuddy' || userData.role === 'buddy')) ||
            (role === 'buddy' && (userData.role === 'medicalBuddy' || userData.role === 'buddy')) ||
            (role === 'doctor' && userData.role === 'doctor') ||
            (role === 'nurse' && userData.role === 'nurse');
          
          if (roleMatches) {
            const name = userData.firstName && userData.lastName ? 
              `${userData.firstName} ${userData.lastName}` : 
              userData.name || userData.fullName || 'Staff Member';
            console.log(`✅ Role match found for ${role}: ${name}`);
            return name;
          } else {
            console.log(`❌ Role mismatch: expected ${role}, found ${userData.role}`);
          }
        }
      } catch (error) {
        console.log(`No document found in users collection for ID: ${staffId}`);
      }

      return 'Staff Member';
    } catch (error) {
      console.error(`❌ Error getting staff name:`, error);
      return 'Staff Member';
    }
  }

  /**
   * Find staff member by name in the users collection
   * @param {string} staffName - Staff member name
   * @param {string} role - Staff role
   * @returns {Promise<Object|null>} Staff member object with email and name
   */
  async findStaffByName(staffName, role) {
    try {
      console.log(`🔍 Searching for ${role} by name: ${staffName}`);
      
      // Search in users collection by name
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const fullName = userData.firstName && userData.lastName ? 
          `${userData.firstName} ${userData.lastName}` : 
          userData.displayName || userData.name || '';
        
        // Check if the name matches (case-insensitive)
        if (fullName.toLowerCase().includes(staffName.toLowerCase()) || 
            staffName.toLowerCase().includes(fullName.toLowerCase())) {
          console.log(`✅ Found ${role} by name:`, fullName);
          return {
            email: userData.email,
            name: fullName,
            id: userDoc.id
          };
        }
      }
      
      // If not found in users collection, try role-specific collections
      let collectionName;
      switch (role) {
        case 'doctor':
          collectionName = 'doctors';
          break;
        case 'nurse':
          collectionName = 'nurses';
          break;
        case 'medicalBuddy':
          collectionName = 'medicalBuddies';
          break;
        default:
          return null;
      }
      
      const roleQuery = query(collection(db, collectionName));
      const roleSnapshot = await getDocs(roleQuery);
      
      for (const staffDoc of roleSnapshot.docs) {
        const staffData = staffDoc.data();
        const fullName = staffData.firstName && staffData.lastName ? 
          `${staffData.firstName} ${staffData.lastName}` : 
          staffData.displayName || staffData.name || '';
        
        // Check if the name matches (case-insensitive)
        if (fullName.toLowerCase().includes(staffName.toLowerCase()) || 
            staffName.toLowerCase().includes(fullName.toLowerCase())) {
          console.log(`✅ Found ${role} by name in ${collectionName}:`, fullName);
          return {
            email: staffData.email,
            name: fullName,
            id: staffDoc.id
          };
        }
      }
      
      console.log(`❌ No ${role} found with name: ${staffName}`);
      return null;
      
    } catch (error) {
      console.error(`❌ Error finding ${role} by name:`, error);
      return null;
    }
  }

  /**
   * Search all users in the 'users' collection by a specific role.
   * This is a fallback mechanism when a staff member's ID is not found in their role-specific collection.
   * @param {string} role - The role to search for (e.g., 'doctor', 'nurse', 'medicalBuddy')
   * @returns {Promise<Array>} Array of user objects matching the role.
   */
  async searchAllUsersByRole(role) {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', role)
      );
      const usersSnapshot = await getDocs(usersQuery);
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`❌ Error searching all users by role ${role}:`, error);
      return [];
    }
  }

  /**
   * Get all assigned staff for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} Array of assigned staff members
   */
  async getPatientAssignedStaff(patientId) {
    try {
      console.log(`🔍 Getting assigned staff for patient: ${patientId}`);
      
      // Get patient document
      const patientDoc = await getDoc(doc(db, 'patients', patientId));
      let userDoc = null;
      
      if (!patientDoc.exists()) {
        console.log(`🔍 Patient not found in 'patients' collection, trying 'users' collection...`);
        // Try users collection as fallback
        userDoc = await getDoc(doc(db, 'users', patientId));
        if (!userDoc.exists()) {
          console.warn(`⚠️ Patient not found in any collection: ${patientId}`);
          return [];
        }
        console.log(`✅ Patient found in 'users' collection`);
      }
      
      const patientData = patientDoc.exists() ? patientDoc.data() : userDoc.data();
      console.log('🔍 Patient data:', patientData);
      console.log('🔍 Assigned Doctor:', patientData.assignedDoctor);
      console.log('🔍 Assigned Nurse:', patientData.assignedNurse);
      console.log('🔍 Assigned Buddy:', patientData.assignedBuddy);
      
      const assignedStaff = [];

      // Check for assigned doctor
      if (patientData.assignedDoctor) {
        console.log('🔍 Looking for doctor with ID/Name:', patientData.assignedDoctor);
        
        // Try to find doctor by ID first
        let doctorEmail = await this.getStaffEmail(patientData.assignedDoctor, 'doctor');
        let doctorName = await this.getStaffName(patientData.assignedDoctor, 'doctor');
        
        // If not found by ID, try to find by name
        if (!doctorEmail) {
          console.log('🔍 Doctor not found by ID, trying to find by name...');
          const doctorByName = await this.findStaffByName(patientData.assignedDoctor, 'doctor');
          if (doctorByName) {
            doctorEmail = doctorByName.email;
            doctorName = doctorByName.name;
            console.log('✅ Doctor found by name:', doctorName);
          }
        }
        
        // If still not found, try searching all users with doctor role
        if (!doctorEmail) {
          console.log('🔍 Doctor not found by name, searching all users with doctor role...');
          const allDoctors = await this.searchAllUsersByRole('doctor');
          const matchingDoctor = allDoctors.find(doc => {
            const fullName = `${doc.firstName} ${doc.lastName}`.toLowerCase();
            const searchTerm = patientData.assignedDoctor.toLowerCase();
            return fullName.includes(searchTerm) || searchTerm.includes(fullName);
          });
          
          if (matchingDoctor) {
            doctorEmail = matchingDoctor.email;
            doctorName = `${matchingDoctor.firstName} ${matchingDoctor.lastName}`;
            console.log('✅ Doctor found by searching all users:', doctorName);
          }
        }
        
        console.log('🔍 Doctor email found:', doctorEmail);
        console.log('🔍 Doctor name found:', doctorName);
        
        if (doctorEmail) {
          assignedStaff.push({
            id: patientData.assignedDoctor,
            email: doctorEmail,
            name: doctorName,
            role: 'doctor'
          });
        } else {
          console.warn(`⚠️ Could not find email for doctor: ${patientData.assignedDoctor}`);
        }
      }

      // Check for assigned nurse
      if (patientData.assignedNurse) {
        console.log('🔍 Looking for nurse with ID/Name:', patientData.assignedNurse);
        
        // Try to find nurse by ID first
        let nurseEmail = await this.getStaffEmail(patientData.assignedNurse, 'nurse');
        let nurseName = await this.getStaffName(patientData.assignedNurse, 'nurse');
        
        // If not found by ID, try to find by name
        if (!nurseEmail) {
          console.log('🔍 Nurse not found by ID, trying to find by name...');
          const nurseByName = await this.findStaffByName(patientData.assignedNurse, 'nurse');
          if (nurseByName) {
            nurseEmail = nurseByName.email;
            nurseName = nurseByName.name;
            console.log('✅ Nurse found by name:', nurseName);
          }
        }
        
        // If still not found, try searching all users with nurse role
        if (!nurseEmail) {
          console.log('🔍 Nurse not found by name, searching all users with nurse role...');
          const allNurses = await this.searchAllUsersByRole('nurse');
          const matchingNurse = allNurses.find(nurse => {
            const fullName = `${nurse.firstName} ${nurse.lastName}`.toLowerCase();
            const searchTerm = patientData.assignedNurse.toLowerCase();
            return fullName.includes(searchTerm) || searchTerm.includes(fullName);
          });
          
          if (matchingNurse) {
            nurseEmail = matchingNurse.email;
            nurseName = `${matchingNurse.firstName} ${matchingNurse.lastName}`;
            console.log('✅ Nurse found by searching all users:', nurseName);
          }
        }
        
        console.log('🔍 Nurse email found:', nurseEmail);
        console.log('🔍 Nurse name found:', nurseName);
        
        if (nurseEmail) {
          assignedStaff.push({
            id: patientData.assignedNurse,
            email: nurseEmail,
            name: nurseName,
            role: 'nurse'
          });
        } else {
          console.warn(`⚠️ Could not find email for nurse: ${patientData.assignedNurse}`);
        }
      }

      // Check for assigned medical buddy
      if (patientData.assignedBuddy) {
        console.log('🔍 Looking for medical buddy with ID/Name:', patientData.assignedBuddy);
        
        // Try to find buddy by ID first
        let buddyEmail = await this.getStaffEmail(patientData.assignedBuddy, 'medicalBuddy');
        let buddyName = await this.getStaffName(patientData.assignedBuddy, 'medicalBuddy');
        
        // If not found by ID, try to find by name
        if (!buddyEmail) {
          console.log('🔍 Medical buddy not found by ID, trying to find by name...');
          const buddyByName = await this.findStaffByName(patientData.assignedBuddy, 'medicalBuddy');
          if (buddyByName) {
            buddyEmail = buddyByName.email;
            buddyName = buddyByName.name;
            console.log('✅ Medical buddy found by name:', buddyName);
          }
        }
        
        // If still not found, try searching all users with medicalBuddy role
        if (!buddyEmail) {
          console.log('🔍 Medical buddy not found by name, searching all users with medicalBuddy role...');
          const allBuddies = await this.searchAllUsersByRole('medicalBuddy');
          const matchingBuddy = allBuddies.find(buddy => {
            const fullName = `${buddy.firstName} ${buddy.lastName}`.toLowerCase();
            const searchTerm = patientData.assignedBuddy.toLowerCase();
            return fullName.includes(searchTerm) || searchTerm.includes(fullName);
          });
          
          if (matchingBuddy) {
            buddyEmail = matchingBuddy.email;
            buddyName = `${matchingBuddy.firstName} ${matchingBuddy.lastName}`;
            console.log('✅ Medical buddy found by searching all users:', buddyName);
          }
        }
        
        console.log('🔍 Medical buddy email found:', buddyEmail);
        console.log('🔍 Medical buddy name found:', buddyName);
        
        if (buddyEmail) {
          assignedStaff.push({
            id: patientData.assignedBuddy,
            email: buddyEmail,
            name: buddyName,
            role: 'medicalBuddy'
          });
        } else {
          console.warn(`⚠️ Could not find email for medical buddy: ${patientData.assignedBuddy}`);
        }
      }

      console.log('🔍 Final assigned staff array:', assignedStaff);
      return assignedStaff;

    } catch (error) {
      console.error(`❌ Error getting patient assigned staff:`, error);
      return [];
    }
  }

  /**
   * Send assignment email to staff member
   * @param {string} email - Staff email address
   * @param {string} staffName - Staff member name
   * @param {string} role - Staff role
   * @param {string} patientName - Patient name
   * @param {string} patientId - Patient ID
   */
  async sendAssignmentEmail(email, staffName, role, patientName, patientId) {
    const emailData = {
      to: email,
      subject: `📋 New Patient Assignment - ${patientName}`,
      html: this.generateAssignmentEmailHTML(staffName, role, patientName, patientId),
      text: this.generateAssignmentEmailText(staffName, role, patientName, patientId)
    };

    return await emailService.sendEmail(emailData);
  }

  /**
   * Send emergency email to staff member
   * @param {Object} staff - Staff member object
   * @param {Object} emergencyData - Emergency details
   */
  async sendEmergencyEmailToStaff(staff, emergencyData) {
    const emailData = {
      to: staff.email,
      subject: `🚨 EMERGENCY ALERT - ${emergencyData.severity.toUpperCase()} - Patient: ${emergencyData.patientName}`,
      html: this.generateEmergencyEmailHTML(staff, emergencyData),
      text: this.generateEmergencyEmailText(staff, emergencyData)
    };

    return await emailService.sendEmail(emailData);
  }

  /**
   * Send progress update email to staff member
   * @param {Object} staff - Staff member object
   * @param {Object} progressData - Progress details
   */
  async sendProgressEmailToStaff(staff, progressData) {
    const emailData = {
      to: staff.email,
      subject: `📊 Progress Update - ${progressData.patientName}`,
      html: this.generateProgressEmailHTML(staff, progressData),
      text: this.generateProgressEmailText(staff, progressData)
    };

    return await emailService.sendEmail(emailData);
  }

  /**
   * Log email sent to Firebase for tracking
   * @param {string} patientId - Patient ID
   * @param {string} staffId - Staff member ID
   * @param {string} role - Staff role
   * @param {string} emailType - Type of email (assignment, emergency, progress)
   * @param {Object} emailResult - Email sending result
   */
  async logEmailSent(patientId, staffId, role, emailType, emailResult) {
    try {
      await addDoc(collection(db, 'emailLogs'), {
        patientId,
        staffId,
        role,
        emailType,
        success: emailResult.success,
        provider: emailResult.provider,
        messageId: emailResult.messageId,
        timestamp: serverTimestamp(),
        error: emailResult.error || null
      });
    } catch (error) {
      console.error(`❌ Error logging email:`, error);
    }
  }

  // Email template generators
  generateAssignmentEmailHTML(staffName, role, patientName, patientId) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Patient Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2196F3; }
          .button { background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 New Patient Assignment</h1>
        </div>
        
        <div class="content">
          <div class="info">
            <strong>Dear ${staffName} (${role}),</strong><br>
            You have been assigned to a new patient.
          </div>
          
          <div class="info">
            <h3>Assignment Details:</h3>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Patient ID:</strong> ${patientId}</p>
            <p><strong>Your Role:</strong> ${role}</p>
            <p><strong>Assigned Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="info">
            <h3>Next Steps:</h3>
            <ul>
              <li>Review patient information and medical history</li>
              <li>Schedule initial consultation or session</li>
              <li>Coordinate with other assigned staff members</li>
              <li>Begin care plan development</li>
            </ul>
          </div>
          
          <a href="#" class="button">View Patient Details</a>
          <a href="#" class="button">Access Patient Records</a>
        </div>
        
        <div class="footer">
          <p>This is an automated assignment notification from the Rehabilitation Center Management System.</p>
          <p>Please do not reply to this email. Contact the system administrator if you have questions.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateAssignmentEmailText(staffName, role, patientName, patientId) {
    return `
NEW PATIENT ASSIGNMENT

Dear ${staffName} (${role}),

You have been assigned to a new patient.

ASSIGNMENT DETAILS:
- Patient: ${patientName}
- Patient ID: ${patientId}
- Your Role: ${role}
- Assigned Date: ${new Date().toLocaleDateString()}

NEXT STEPS:
1. Review patient information and medical history
2. Schedule initial consultation or session
3. Coordinate with other assigned staff members
4. Begin care plan development

This is an automated assignment notification from the Rehabilitation Center Management System.
Please do not reply to this email. Contact the system administrator if you have questions.
    `.trim();
  }

  generateEmergencyEmailHTML(staff, emergencyData) {
    const { patientName, severity, description, location, timestamp } = emergencyData;
    const severityColor = severity === 'critical' ? '#d32f2f' : 
                         severity === 'high' ? '#f57c00' : '#ff9800';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Emergency Alert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: ${severityColor}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid ${severityColor}; }
          .button { background: ${severityColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚨 EMERGENCY ALERT 🚨</h1>
          <h2>${severity.toUpperCase()} Priority</h2>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>Dear ${staff.name} (${staff.role}),</strong><br>
            An emergency situation has been reported that requires your immediate attention.
          </div>
          
          <div class="info">
            <h3>Emergency Details:</h3>
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Time Reported:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
          
          <div class="info">
            <h3>Required Actions:</h3>
            <ul>
              <li>Immediately review the emergency situation</li>
              <li>Coordinate with other assigned staff members</li>
              <li>Take appropriate medical action as needed</li>
              <li>Update patient status in the system</li>
            </ul>
          </div>
          
          <a href="#" class="button">View Patient Details</a>
          <a href="#" class="button">Acknowledge Emergency</a>
        </div>
        
        <div class="footer">
          <p>This is an automated emergency alert from the Rehabilitation Center Management System.</p>
          <p>Please do not reply to this email. Contact the system administrator if you have questions.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateEmergencyEmailText(staff, emergencyData) {
    const { patientName, severity, description, location, timestamp } = emergencyData;
    
    return `
EMERGENCY ALERT - ${severity.toUpperCase()}

Dear ${staff.name} (${staff.role}),

An emergency situation has been reported that requires your immediate attention.

EMERGENCY DETAILS:
- Patient: ${patientName}
- Severity: ${severity.toUpperCase()}
- Description: ${description}
- Location: ${location}
- Time Reported: ${new Date(timestamp).toLocaleString()}

REQUIRED ACTIONS:
1. Immediately review the emergency situation
2. Coordinate with other assigned staff members
3. Take appropriate medical action as needed
4. Update patient status in the system

This is an automated emergency alert from the Rehabilitation Center Management System.
Please do not reply to this email. Contact the system administrator if you have questions.
    `.trim();
  }

  generateProgressEmailHTML(staff, progressData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Patient Progress Update</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f5f5f5; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
          .button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Patient Progress Update</h1>
        </div>
        
        <div class="content">
          <div class="info">
            <strong>Dear ${staff.name} (${staff.role}),</strong><br>
            A progress update is available for your assigned patient.
          </div>
          
          <div class="info">
            <h3>Progress Details:</h3>
            <p><strong>Patient:</strong> ${progressData.patientName}</p>
            <p><strong>Update Type:</strong> ${progressData.updateType}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Summary:</strong> ${progressData.summary}</p>
          </div>
          
          <a href="#" class="button">View Full Progress Report</a>
          <a href="#" class="button">Update Care Plan</a>
        </div>
        
        <div class="footer">
          <p>This is an automated progress update from the Rehabilitation Center Management System.</p>
          <p>Please do not reply to this email. Contact the system administrator if you have questions.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateProgressEmailText(staff, progressData) {
    return `
PATIENT PROGRESS UPDATE

Dear ${staff.name} (${staff.role}),

A progress update is available for your assigned patient.

PROGRESS DETAILS:
- Patient: ${progressData.patientName}
- Update Type: ${progressData.updateType}
- Date: ${new Date().toLocaleDateString()}
- Summary: ${progressData.summary}

This is an automated progress update from the Rehabilitation Center Management System.
Please do not reply to this email. Contact the system administrator if you have questions.
    `.trim();
  }
}

// Create singleton instance
const patientEmailService = new PatientEmailService();

export default patientEmailService;
