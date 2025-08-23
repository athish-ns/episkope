# Reuth Rehabilitation Center Management System

A comprehensive, role-based healthcare management platform designed to streamline rehabilitation care delivery through collaborative interfaces, performance tracking, and intelligent patient management.

## 🌟 Overview

The Rehabilitation Center Management System is a modern, web-based application that revolutionizes how healthcare professionals collaborate to provide rehabilitation services. Built with React and Node.js, it features role-based dashboards, real-time communication, performance analytics, and comprehensive patient care management.

## 🎯 Key Features

### 🔐 Multi-Role Access Control
- **Admin Dashboard**: System-wide management, user administration, and analytics
- **Doctor Dashboard**: Patient care plans, buddy supervision, and session reviews
- **Nurse Dashboard**: Patient care oversight, session supervision, and log verification
- **Buddy Dashboard**: Patient interaction, session management, and performance tracking
- **Patient Dashboard**: Progress tracking, care team communication, and session history
- **Receptionist Dashboard**: Patient registration, scheduling, and staff management

### 🏥 Healthcare Management
- **Patient Care Plans**: Comprehensive treatment planning and progress tracking
- **Session Management**: Real-time session monitoring and documentation
- **Performance Analytics**: Data-driven insights for care quality improvement
- **Emergency Response**: Quick access to emergency contacts and protocols
- **Communication Hub**: Integrated messaging and notification system

### 📊 Performance & Analytics
- **Real-time Dashboards**: Live data visualization and reporting
- **Performance Metrics**: Staff performance tracking and rating systems
- **Progress Monitoring**: Patient recovery progress visualization
- **Statistical Analysis**: Comprehensive healthcare analytics and insights

### 🔒 Security & Compliance
- **Role-based Access Control**: Secure permission management
- **Data Encryption**: Secure patient data handling
- **Audit Logging**: Comprehensive activity tracking
- **HIPAA Compliance**: Healthcare data protection standards

## 🏗️ Architecture

### Frontend
- **React 18**: Modern UI framework with hooks
- **Material-UI (MUI)**: Professional healthcare-grade components
- **React Router**: Client-side routing and navigation
- **Zustand**: Lightweight state management
- **Recharts**: Data visualization and analytics
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Node.js**: Server-side runtime environment
- **Express.js**: Web application framework
- **Firebase**: Authentication and real-time database
- **Nodemailer**: Email service integration
- **Rate Limiting**: API security and protection

### Services
- **Authentication Service**: Secure user login and session management
- **Email Service**: Automated notifications and communications
- **Notification Service**: Real-time alerts and updates
- **AI Integration**: Groq service for intelligent insights
- **Firebase Service**: Cloud database and storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project setup
- Email service credentials (Gmail recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rehabilitation-centre-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Configure your `.env` file with your actual credentials. See the [Configuration](#-configuration) section below for a complete list of required environment variables.

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication and Firestore
   - Update Firebase configuration in `src/services/firebaseService.js`

5. **Start the application**
   ```bash
   # Development mode (frontend + backend)
   npm run dev:full
   
   # Frontend only
   npm run dev
   
   # Backend only
   npm run server
   ```

## 📱 User Roles & Permissions

### 👑 Administrator
- **System Management**: User administration, role assignment
- **Analytics**: System-wide performance metrics and reporting
- **Security**: Access control and system monitoring
- **Configuration**: System settings and maintenance

### 👨‍⚕️ Doctor
- **Patient Care**: Treatment planning and supervision
- **Buddy Management**: Staff oversight and performance review
- **Session Review**: Treatment session analysis and feedback
- **Approval Panel**: Patient care plan approvals

### 👩‍⚕️ Nurse
- **Patient Care**: Direct patient interaction and monitoring
- **Session Supervision**: Real-time session oversight
- **Buddy Oversight**: Support staff supervision
- **Log Verification**: Documentation review and validation

### 🤝 Buddy (Support Staff)
- **Patient Interaction**: Direct patient support and assistance
- **Session Management**: Treatment session execution
- **Performance Tracking**: Self-assessment and improvement
- **Progress Control**: Patient recovery monitoring

### 👤 Patient
- **Progress Tracking**: Personal recovery journey monitoring
- **Care Team**: Communication with healthcare providers
- **Session History**: Treatment session records
- **Emergency Access**: Quick contact and assistance

### 🏢 Receptionist
- **Patient Registration**: New patient onboarding
- **Scheduling**: Appointment and session management
- **Staff Management**: Account creation and administration
- **Data Entry**: Patient information management

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# Server Configuration
PORT=3001
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
GMAIL_FROM_EMAIL=your-email@gmail.com
GMAIL_FROM_NAME=Rehabilitation Center System
ALLOWED_ORIGINS=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Groq AI Service
VITE_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_GROQ_API_KEY=your_groq_api_key_here

# Application Configuration
VITE_APP_NAME=Rehabilitation Centre Management
VITE_APP_VERSION=1.0.0
```

**Important Security Notes:**
- Never commit your `.env` file to version control
- Use strong, unique passwords for all services
- Rotate API keys regularly
- Consider using a secrets management service in production

### Email Service
The system supports multiple email providers with Gmail as the default:

```javascript
// Email configuration in server.js
const emailConfig = {
  provider: 'gmail',
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD,
    fromEmail: process.env.GMAIL_FROM_EMAIL,
    fromName: process.env.GMAIL_FROM_NAME
  }
};
```

### Firebase Configuration
Update `src/services/firebaseService.js` with your Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Groq AI Service Configuration
The system uses Groq AI for intelligent text summarization and injury assessment. Configure your API key:

```javascript
// Environment variable configuration
VITE_GROQ_API_KEY=your_groq_api_key_here
REACT_APP_GROQ_API_KEY=your_groq_api_key_here
```

**Note**: The service automatically detects whether you're using Vite or Create React App and uses the appropriate environment variable prefix.

### Rate Limiting
API protection with configurable rate limits:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests' }
});
```

## 📊 Data Models

### Patient
- Personal information and medical history
- Care plans and treatment goals
- Progress tracking and assessments
- Emergency contacts and preferences

### Session
- Treatment session details and duration
- Staff assignments and supervision
- Patient progress notes and outcomes
- Quality metrics and ratings

### User
- Role-based access permissions
- Performance metrics and ratings
- Contact information and credentials
- Activity logs and history

### Care Plan
- Treatment objectives and milestones
- Staff assignments and responsibilities
- Progress tracking and adjustments
- Approval workflow and documentation

## 🚨 Emergency Features

### Emergency Dashboard
- Quick access to emergency protocols
- Direct contact with medical staff
- Patient status monitoring
- Crisis response coordination

### Notification System
- Real-time emergency alerts
- Multi-channel communication
- Escalation procedures
- Response tracking

## 📈 Performance Monitoring

### Staff Performance
- Session completion rates
- Patient satisfaction ratings
- Quality metrics tracking
- Performance improvement suggestions

### Patient Outcomes
- Recovery progress visualization
- Treatment effectiveness analysis
- Outcome prediction models
- Quality of life assessments

## 🔐 Security Features

### Authentication
- Firebase Authentication integration
- Role-based access control
- Session management
- Secure password policies

### Data Protection
- Encrypted data transmission
- Secure API endpoints
- Audit logging
- HIPAA compliance measures

### Access Control
- Role-based permissions
- Session timeout
- IP-based restrictions
- Activity monitoring

## 🧪 Testing

### Automated Testing
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests (when implemented)
npm test
```

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance
- Performance testing

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
npm start
```

### Environment Variables
Ensure all production environment variables are properly configured:
- Database connections
- Email service credentials
- API keys and secrets
- Security configurations

### Monitoring
- Application performance monitoring
- Error tracking and reporting
- User activity analytics
- System health checks

## 🤝 Contributing

### Development Guidelines
1. Follow the existing code style and patterns
2. Add comprehensive error handling
3. Include proper documentation
4. Test thoroughly before submitting
5. Follow security best practices

### Code Structure
- Component-based architecture
- Service layer separation
- State management with Zustand
- Consistent error handling

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Documentation
- Component documentation in code comments
- API endpoint documentation
- User role guides
- Troubleshooting guides

### Contact
For technical support or questions:
- Check the documentation
- Review error logs
- Contact the development team
- Submit issue reports

## 🔮 Future Enhancements

### Planned Features
- AI-powered treatment recommendations
- Advanced analytics and reporting
- Mobile application development
- Integration with medical devices
- Telemedicine capabilities

### Technology Roadmap
- Machine learning integration
- Blockchain for medical records
- IoT device integration
- Advanced security features
- Performance optimization

---

*This system is designed to improve patient outcomes through better collaboration, data-driven insights, and comprehensive care management.*
