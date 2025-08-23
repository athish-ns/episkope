import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Divider,
  LinearProgress,
  Skeleton,
  AlertTitle
} from '@mui/material';
import {
  People,
  LocalHospital,
  Event,
  Assessment,
  Add,
  Edit,
  Delete,
  Visibility,
  Person,
  AdminPanelSettings,
  MedicalServices,
  LocalPharmacy,
  Psychology,
  PersonAdd,
  Search,
  Logout,
  Dashboard,
  Settings,
  Security,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { dbService } from '../../services/firebaseService';

// Enhanced Tab Component Functions
const OverviewTab = ({ dashboardData, getRoleIcon, getRoleColor, getStatusColor, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(4)].map((_, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Box sx={{ mt: 2 }}>
                  {[...Array(4)].map((_, i) => (
                    <Box key={i} sx={{ mb: 1 }}>
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Fade in timeout={500}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', transition: 'all 0.3s ease-in-out' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  User Role Distribution
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                {dashboardData?.roleDistribution && Object.entries(dashboardData.roleDistribution).map(([role, count]) => (
                  <Box key={role} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      {getRoleIcon(role)}
                      <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {role}
                      </Typography>
                    </Box>
                    <Chip 
                      label={count} 
                      color={getRoleColor(role)} 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
                {(!dashboardData?.roleDistribution || Object.keys(dashboardData.roleDistribution).length === 0) && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Info sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No role distribution data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', transition: 'all 0.3s ease-in-out' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Health
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Status:</Typography>
                  <Chip 
                    label={dashboardData?.systemHealth?.status || 'Unknown'} 
                    color={dashboardData?.systemHealth?.status === 'operational' ? 'success' : 'error'}
                    size="small"
                    icon={dashboardData?.systemHealth?.status === 'operational' ? <CheckCircle /> : <Error />}
                  />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Total Collections:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dashboardData?.systemHealth?.totalCollections || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Active Connections:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dashboardData?.systemHealth?.activeConnections || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Last Check:</Typography>
                  <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                    {dashboardData?.systemHealth?.lastCheck ? 
                      new Date(dashboardData.systemHealth.lastCheck).toLocaleString() : 'Never'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', transition: 'all 0.3s ease-in-out' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Users
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {dashboardData?.recentUsers && dashboardData.recentUsers.length > 0 ? (
                  dashboardData.recentUsers.map((user, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'grey.100',
                          transform: 'translateX(4px)',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: getRoleColor(user.role || 'patient'), width: 32, height: 32 }}>
                          {getRoleIcon(user.role || 'patient')}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="bold">
                            {user.displayName || user.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email || 'No email'} • {user.role || 'Unknown role'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={user.status || 'Unknown'} 
                          color={getStatusColor(user.status || 'unknown')} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Person sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent users
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', transition: 'all 0.3s ease-in-out' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Event sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Sessions
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={1}>
                {dashboardData?.recentSessions && dashboardData.recentSessions.length > 0 ? (
                  dashboardData.recentSessions.map((session, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        p: 1.5, 
                        bgcolor: 'grey.50', 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'grey.100',
                          transform: 'translateX(4px)',
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          <Event />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight="bold">
                            Session #{session.id?.slice(-6) || session.sessionId?.slice(-6) || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.patientName || session.patient?.displayName || 'Unknown Patient'} • {session.status || 'Unknown'}
                          </Typography>
                        </Box>
                        <Chip 
                          label={session.status || 'Unknown'} 
                          color={session.status === 'completed' ? 'success' : 'warning'} 
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Event sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No recent sessions
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fade>
  );
};

const UserManagementTab = ({ users, getRoleIcon, getRoleColor, getStatusColor, profile, setSelectedUser, setEditUserDialog, handleDeleteUser, setCreateUserDialog, loadUsers }) => {
  console.log('UserManagementTab received users:', users);
  console.log('Users array length:', users?.length);
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          All Users Management ({users?.length || 0} users)
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => loadUsers()}
            sx={{ minWidth: 'auto' }}
          >
            🔄
          </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateUserDialog(true)}
        >
          Create User
        </Button>
        </Box>
      </Box>

      {!users || users.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No users found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your first user to get started
          </Typography>
        </Box>
      ) : (
        <>
          {/* Debug Info */}
          <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="caption" color="text.secondary">
              Debug: {users.length} users loaded | Raw data: {JSON.stringify(users.slice(0, 2))}
            </Typography>
          </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Join Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: getRoleColor(user.role || 'patient') }}>
                      {getRoleIcon(user.role || 'patient')}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {user.displayName || user.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.email || 'No email'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role || 'Unknown'} 
                    color={getRoleColor(user.role || 'patient')} 
                    size="small"
                    icon={getRoleIcon(user.role || 'patient')}
                  />
                </TableCell>
                <TableCell>{user.department || 'N/A'}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.status || 'Unknown'} 
                    color={getStatusColor(user.status || 'unknown')} 
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {user.joinDate ? 
                    (user.joinDate.toDate ? 
                      new Date(user.joinDate.toDate()).toLocaleDateString() : 
                      new Date(user.joinDate).toLocaleDateString()
                    ) : 'N/A'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit User">
                      <IconButton 
                        size="small" 
                        color="warning"
                        onClick={() => {
                          setSelectedUser(user);
                          setEditUserDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user.uid)}
                        disabled={user.uid === profile?.uid}
                      >
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
        </>
      )}
    </Box>
  );
};

const PatientManagementTab = ({ users, getStatusColor }) => {
    const patients = users?.filter(user => user.role === 'patient') || []
    
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Patient Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {patients.length}
                </Typography>
                <Typography variant="body1">Total Patients</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {patients.filter(p => p.status === 'active').length}
                </Typography>
                <Typography variant="body1">Active Patients</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {patients.filter(p => p.status === 'pending').length}
                </Typography>
                <Typography variant="body1">Pending Patients</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned Staff</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.uid}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {patient.displayName || 'Unknown Patient'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {patient.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={patient.status} 
                      color={getStatusColor(patient.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {patient.assignedDoctor ? `Dr. ${patient.assignedDoctor}` : 'Not Assigned'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Patient">
                        <IconButton size="small" color="warning">
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
      </Box>
    )
};

const DoctorManagementTab = ({ users, getStatusColor }) => {
    const doctors = users?.filter(user => user.role === 'doctor') || []
    
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Doctor Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary">
                  {doctors.length}
                </Typography>
                <Typography variant="body1">Total Doctors</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {doctors.filter(d => d.status === 'active').length}
                </Typography>
                <Typography variant="body1">Active Doctors</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {doctors.filter(d => d.department).length}
                </Typography>
                <Typography variant="body1">With Department</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor) => (
                <TableRow key={doctor.uid}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <MedicalServices />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          Dr. {doctor.displayName || 'Unknown Doctor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doctor.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{doctor.department || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={doctor.status} 
                      color={getStatusColor(doctor.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Doctor">
                        <IconButton size="small" color="warning">
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
      </Box>
    )
};

const NurseManagementTab = ({ users, getStatusColor }) => {
    const nurses = users?.filter(user => user.role === 'nurse') || []
    
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Nurse Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {nurses.length}
                </Typography>
                <Typography variant="body1">Total Nurses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {nurses.filter(n => n.status === 'active').length}
                </Typography>
                <Typography variant="body1">Active Nurses</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {nurses.filter(n => n.department).length}
                </Typography>
                <Typography variant="body1">With Department</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nurse</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nurses.map((nurse) => (
                <TableRow key={nurse.uid}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'info.main' }}>
                        <LocalPharmacy />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {nurse.displayName || 'Unknown Nurse'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {nurse.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{nurse.department || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={nurse.status} 
                      color={getStatusColor(nurse.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Nurse">
                        <IconButton size="small" color="warning">
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
      </Box>
    )
};

const MedicalBuddyManagementTab = ({ users, getStatusColor }) => {
    const buddies = users?.filter(user => user.role === 'buddy') || []
    
    return (
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Medical Buddy Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {buddies.length}
                </Typography>
                <Typography variant="body1">Total Buddies</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="success.main">
                  {buddies.filter(b => b.status === 'active').length}
                </Typography>
                <Typography variant="body1">Active Buddies</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">
                  {buddies.filter(b => b.tier === 'gold').length}
                </Typography>
                <Typography variant="body1">Gold Tier</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="info.main">
                  {buddies.filter(b => b.tier === 'silver').length}
                </Typography>
                <Typography variant="body1">Silver Tier</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="brown">
                  {buddies.filter(b => b.tier === 'silver').length}
                </Typography>
                <Typography variant="body1">Bronze Tier</Typography>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
        
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Buddy</TableCell>
                <TableCell>Tier</TableCell>
                <TableCell>Max Patients</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buddies.map((buddy) => (
                <TableRow key={buddy.uid}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <Psychology />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {buddy.displayName || 'Unknown Buddy'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {buddy.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={buddy.tier || 'Bronze'} 
                      color={buddy.tier === 'gold' ? 'warning' : buddy.tier === 'silver' ? 'default' : 'error'} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{buddy.maxPatients || 5}</TableCell>
                  <TableCell>
                    <Chip 
                      label={buddy.status} 
                      color={getStatusColor(buddy.status)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Buddy">
                        <IconButton size="small" color="warning">
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
      </Box>
    )
};

const SystemMonitoringTab = ({ dashboardData }) => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        System Monitoring & Health
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Database Status:</Typography>
                  <Chip label="Healthy" color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">API Response Time:</Typography>
                  <Typography variant="body2" fontWeight="bold">~150ms</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Active Sessions:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {dashboardData?.overview?.totalSessions || 0}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">System Uptime:</Typography>
                  <Typography variant="body2" fontWeight="bold">99.9%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Status
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Authentication:</Typography>
                  <Chip label="Secure" color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Data Encryption:</Typography>
                  <Chip label="Enabled" color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Last Security Scan:</Typography>
                  <Typography variant="body2" fontWeight="bold">2 hours ago</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Vulnerabilities:</Typography>
                  <Chip label="0 Found" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
);

  const ReceptionistManagementTab = ({ users, getRoleIcon, getRoleColor, getStatusColor, profile, setSelectedUser, setEditUserDialog, handleDeleteUser, setCreateUserDialog, loadUsers }) => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          Receptionist Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setCreateUserDialog(true)}
        >
          Add Receptionist
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage receptionist accounts and their access permissions.
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .filter(user => user.role === 'receptionist')
                .map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: getRoleColor(user.role || 'receptionist') }}>
                          {getRoleIcon(user.role || 'receptionist')}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {user.displayName || user.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.phone || 'No phone'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.department || 'General'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || 'Active'}
                        color={getStatusColor(user.status)}
                        size="small"
                        icon={getRoleIcon(user.role || 'receptionist')}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Edit Receptionist">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {profile?.uid !== user.uid && (
                          <Tooltip title="Delete Receptionist">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.uid)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              {users.filter(user => user.role === 'receptionist').length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={3}>
                      No receptionists found. Add the first receptionist using the button above.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const ReceptionistToolsTab = () => (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Receptionist Tools
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Access comprehensive patient management tools and registration forms.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" columnGap={2}>
                <Button
                  variant="outlined"
                  startIcon={<PersonAdd />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Register New Patient
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Search Patient Records
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Update Patient Information
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Patient Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient registration and management activities will appear here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      

    </Box>
);

const AdminDashboard = () => {
  const { profile, logout } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    department: '',
    phone: '',
    tier: '',
    maxPatients: 5
  });

    const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadDashboardData();
    loadUsers();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get dashboard data from Firebase
      const [users, patients, sessions, carePlans] = await Promise.all([
        dbService.query('users', []),
        dbService.query('patients', []),
        dbService.query('sessions', []),
        dbService.query('carePlans', [])
      ]);
      
      if (users.success && patients.success && sessions.success && carePlans.success) {
        const dashboardData = {
          overview: {
            totalUsers: users.data?.length || 0,
            totalPatients: patients.data?.length || 0,
            totalSessions: sessions.data?.length || 0,
            totalCarePlans: carePlans.data?.length || 0
          },
          roleDistribution: users.data?.reduce((acc, user) => {
            const role = user.role || 'unknown';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
          }, {}) || {},
          systemHealth: {
            status: 'operational',
            totalCollections: 4,
            activeConnections: users.data?.length || 0,
            lastCheck: new Date().toISOString()
          },
          recentUsers: users.data?.slice(-5) || [], // Get last 5 users
          recentSessions: sessions.data?.slice(-5) || [] // Get last 5 sessions
        };
        setDashboardData(dashboardData);
      } else {
        console.error('Failed to load dashboard data:', { users, patients, sessions, carePlans });
        setError('Failed to load dashboard data. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('An unexpected error occurred while loading dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const result = await dbService.query('users', []);
      if (result.success) {
        console.log('Users loaded:', result.data);
        setUsers(result.data);
      } else {
        console.error('Failed to load users:', result.error);
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleCreateUser = async () => {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('Creating user with data:', newUser);
      
      // Create Firebase Auth user first
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { getAuth } = await import('firebase/auth');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const { getFirestore } = await import('firebase/firestore');
      
      // Use a separate Firebase instance to avoid auth state conflicts
      const { initializeApp } = await import('firebase/app');
      
      // Create a temporary Firebase app instance for user creation
      const tempApp = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      }, 'temp-app');
      
      const tempAuth = getAuth(tempApp);
      const tempDb = getFirestore(tempApp);
      
      // Create the user in Firebase Auth using temp instance
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth, 
        newUser.email, 
        newUser.password
      );
      
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const userProfile = {
        uid: user.uid,
        email: newUser.email,
        displayName: newUser.name,
        role: newUser.role,
        department: newUser.department || '',
        phone: newUser.phone || '',
        tier: newUser.tier || '',
        maxPatients: newUser.maxPatients || 5,
        status: 'active',
        isVerified: false,
        twoFactorEnabled: false,
        joinDate: serverTimestamp(),
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(tempDb, 'users', user.uid), userProfile);
      
      console.log('User created successfully:', user.uid);
      toast.success(`User ${newUser.name} created successfully with role: ${newUser.role}`);
      setCreateUserDialog(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        department: '',
        phone: '',
        tier: '',
        maxPatients: 5
      });
      
      // Force reload users and dashboard data after creation
      await Promise.all([loadUsers(), loadDashboardData()]);
      
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already exists. Please use a different email address.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address. Please check the email format.');
      } else {
        toast.error(`Failed to create user: ${error.message}`);
      }
    }
  };

  const handleEditUser = async () => {
    try {
      if (!selectedUser) return;

      const updateData = {
        displayName: selectedUser.displayName || selectedUser.name,
        department: selectedUser.department || '',
        phone: selectedUser.phone || '',
        tier: selectedUser.tier || '',
        maxPatients: selectedUser.maxPatients || 5,
        updatedAt: new Date()
      };

      await dbService.update('users', selectedUser.uid, updateData);
      toast.success('User updated successfully');
      setEditUserDialog(false);
      setSelectedUser(null);
      await Promise.all([loadUsers(), loadDashboardData()]);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? Note: This will mark the user as deleted but the email may still be reserved in Firebase Auth.')) {
      try {
        // Instead of fully deleting, mark user as deleted and disable them
        const updateData = {
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: profile?.uid,
          // Keep original email for reference but mark as deleted
          originalEmail: users.find(u => u.uid === userId)?.email,
          email: `deleted_${Date.now()}_${users.find(u => u.uid === userId)?.email}`,
          displayName: `[DELETED] ${users.find(u => u.uid === userId)?.displayName || 'Unknown User'}`,
          updatedAt: new Date()
        };

        await dbService.update('users', userId, updateData);
        
        toast.success('User marked as deleted successfully');
        toast.warning('Note: Firebase Auth email is still reserved. To reuse the email, you need to delete the user from Firebase Auth console or use Firebase Admin SDK.');
        
        await Promise.all([loadUsers(), loadDashboardData()]);
        
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleIcon = (role) => {
    if (!role) return <Person />;
    
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'doctor':
        return <MedicalServices />;
      case 'nurse':
        return <LocalPharmacy />;
      case 'receptionist':
        return <People />;
      case 'buddy':
        return <Psychology />;
      case 'patient':
        return <Person />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    if (!role) return 'default';
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'error';
      case 'doctor':
        return 'primary';
      case 'nurse':
        return 'info';
      case 'receptionist':
        return 'secondary';
      case 'buddy':
        return 'warning';
      case 'patient':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      case 'deleted':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <OverviewTab dashboardData={dashboardData} getRoleIcon={getRoleIcon} getRoleColor={getRoleColor} getStatusColor={getStatusColor} loading={loading} />;
      case 1:
        return <UserManagementTab users={users} getRoleIcon={getRoleIcon} getRoleColor={getRoleColor} getStatusColor={getStatusColor} profile={profile} setSelectedUser={setSelectedUser} setEditUserDialog={setEditUserDialog} handleDeleteUser={handleDeleteUser} setCreateUserDialog={setCreateUserDialog} loadUsers={loadUsers} />;
      case 2:
        return <PatientManagementTab users={users} getStatusColor={getStatusColor} />;
      case 3:
        return <DoctorManagementTab users={users} getStatusColor={getStatusColor} />;
      case 4:
        return <NurseManagementTab users={users} getStatusColor={getStatusColor} />;
      case 5:
        return <ReceptionistManagementTab users={users} getRoleIcon={getRoleIcon} getRoleColor={getRoleColor} getStatusColor={getStatusColor} profile={profile} setSelectedUser={setSelectedUser} setEditUserDialog={setEditUserDialog} handleDeleteUser={handleDeleteUser} setCreateUserDialog={setCreateUserDialog} loadUsers={loadUsers} />;
      case 6:
        return <MedicalBuddyManagementTab users={users} getStatusColor={getStatusColor} />;
      case 7:
        return <SystemMonitoringTab dashboardData={dashboardData} />;
      case 8:
        return <ReceptionistToolsTab />;
      default:
        return <OverviewTab dashboardData={dashboardData} getRoleIcon={getRoleIcon} getRoleColor={getRoleColor} getStatusColor={getStatusColor} loading={loading} />;
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        gap: 3
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.primary">
          Loading Dashboard...
        </Typography>
        <LinearProgress sx={{ width: '200px' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadDashboardData}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Dashboard Error</AlertTitle>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadDashboardData}
          startIcon={<TrendingUp />}
        >
          Reload Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Enhanced App Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Dashboard sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
              Rehab Center Admin Dashboard
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Admin: {profile?.displayName || profile?.email || 'Administrator'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {profile?.role || 'admin'} role
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={logout}
              startIcon={<Logout />}
              sx={{ 
                borderRadius: 2,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              {isMobile ? 'Logout' : 'Sign Out'}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mb: 4 }}>
        {/* Welcome Header */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              Welcome back, {profile?.displayName || 'Administrator'}!
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: { xs: 'auto', md: 0 } }}
            >
              Manage your rehabilitation center operations and monitor system performance with real-time insights
            </Typography>
          </Box>
        </Fade>

        {/* Dashboard Overview Cards */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                bgcolor: 'primary.main', 
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {dashboardData?.overview?.totalUsers || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Users
                      </Typography>
                    </Box>
                    <People sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                bgcolor: 'success.main', 
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {dashboardData?.overview?.totalPatients || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Patients
                      </Typography>
                    </Box>
                    <LocalHospital sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                bgcolor: 'warning.main', 
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {dashboardData?.overview?.totalSessions || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total Sessions
                      </Typography>
                    </Box>
                    <Event sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                height: '100%', 
                bgcolor: 'info.main', 
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(6, 182, 212, 0.3)',
                }
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {dashboardData?.overview?.totalCarePlans || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Care Plans
                      </Typography>
                    </Box>
                    <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* Admin Management Tabs */}
        <Card sx={{ 
          mb: 4,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
          }
        }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{
                  '& .MuiTab-root': {
                    minHeight: 48,
                    fontWeight: 600,
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                  }
                }}
              >
                <Tab label="Overview" icon={<Dashboard />} iconPosition="start" />
                <Tab label="User Management" icon={<People />} iconPosition="start" />
                <Tab label="Patient Management" icon={<Person />} iconPosition="start" />
                <Tab label="Doctor Management" icon={<MedicalServices />} iconPosition="start" />
                <Tab label="Nurse Management" icon={<LocalPharmacy />} iconPosition="start" />
                <Tab label="Receptionist Management" icon={<People />} iconPosition="start" />
                <Tab label="Medical Buddy Management" icon={<Psychology />} iconPosition="start" />
                <Tab label="System Monitoring" icon={<Security />} iconPosition="start" />
                <Tab label="Receptionist Tools" icon={<Settings />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Tab Content */}
            <Box sx={{ minHeight: '400px' }}>
              {renderTabContent()}
            </Box>
          </CardContent>
        </Card>

        {/* Enhanced Create User Dialog */}
        <Dialog 
          open={createUserDialog} 
          onClose={() => setCreateUserDialog(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Slide}
          transitionDuration={300}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <PersonAdd />
            Create New User
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
              <TextField
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                fullWidth
                required
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="doctor">Doctor</MenuItem>
                  <MenuItem value="nurse">Nurse</MenuItem>
                  <MenuItem value="receptionist">Receptionist</MenuItem>
                  <MenuItem value="buddy">Medical Buddy</MenuItem>
                  <MenuItem value="patient">Patient</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Department"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                fullWidth
              />
              {newUser.role === 'buddy' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Tier</InputLabel>
                    <Select
                      value={newUser.tier}
                      onChange={(e) => setNewUser({ ...newUser, tier: e.target.value })}
                      label="Tier"
                    >
                      <MenuItem value="gold">Gold</MenuItem>
                      <MenuItem value="silver">Silver</MenuItem>
                      <MenuItem value="bronze">Bronze</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Max Patients"
                    type="number"
                    value={newUser.maxPatients}
                    onChange={(e) => setNewUser({ ...newUser, maxPatients: parseInt(e.target.value) })}
                    fullWidth
                    inputProps={{ min: 1, max: 20 }}
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setCreateUserDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              Create User
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Edit User Dialog */}
        <Dialog 
          open={editUserDialog} 
          onClose={() => setEditUserDialog(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Slide}
          transitionDuration={300}
        >
          <DialogTitle sx={{ 
            bgcolor: 'warning.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Edit />
            Edit User
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedUser && (
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Full Name"
                  value={selectedUser.displayName || selectedUser.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, displayName: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      },
                    },
                  }}
                />
                <TextField
                  label="Department"
                  value={selectedUser.department || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      },
                    },
                  }}
                />
                <TextField
                  label="Phone"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.light',
                      },
                    },
                  }}
                />
                {selectedUser.role === 'buddy' && (
                  <>
                    <FormControl fullWidth>
                      <InputLabel>Tier</InputLabel>
                      <Select
                        value={selectedUser.tier || 'bronze'}
                        onChange={(e) => setSelectedUser({ ...selectedUser, tier: e.target.value })}
                        label="Tier"
                      >
                        <MenuItem value="gold">Gold</MenuItem>
                        <MenuItem value="silver">Silver</MenuItem>
                        <MenuItem value="bronze">Bronze</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      label="Max Patients"
                      type="number"
                      value={selectedUser.maxPatients || 5}
                      onChange={(e) => setSelectedUser({ ...selectedUser, maxPatients: parseInt(e.target.value) || 5 })}
                      fullWidth
                      inputProps={{ min: 1, max: 20 }}
                    />
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setEditUserDialog(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                }
              }}
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
