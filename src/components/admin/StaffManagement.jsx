import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material'
import {
  Add,
  Edit,
  Person,
  LocalHospital,
  Group,
  Delete,
  Psychology
} from '@mui/icons-material'
import { authService, dbService } from '../../services/firebaseService'
import { toast } from 'react-hot-toast'

const StaffManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    password: '',
    specialization: '',
    shift: '',
    phone: '',
    department: ''
  })

  const roles = ['doctor', 'nurse', 'buddy']
  const shifts = ['Day', 'Night', 'Rotating']
  const departments = ['Rehabilitation', 'Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'General']

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const result = await dbService.query('users', [
        { field: 'role', operator: 'in', value: ['doctor', 'nurse', 'buddy'] }
      ])
      
      if (result.success) {
        setUsers(result.data)
      }
    } catch (error) {
      toast.error('Failed to load staff members')
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.role || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    
    try {
      if (editingUser) {
        // Update existing user
        await dbService.update('users', editingUser.id, {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Staff member updated successfully')
      } else {
        // Create new staff member
        const userData = {
          ...formData,
          displayName: formData.fullName,
          role: formData.role,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        // Create user in Firebase Auth
        const authResult = await authService.signUp(formData.email, formData.password, userData)
        
        if (authResult.success) {
          toast.success('Staff member created successfully')
          await loadUsers() // Refresh the list
        } else {
          throw new Error(authResult.error)
        }
      }
      
      handleClose()
    } catch (error) {
      toast.error(error.message || 'Failed to save staff member')
      console.error('Error saving user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      fullName: user.fullName || user.displayName || '',
      email: user.email,
      role: user.role,
      password: '',
      specialization: user.specialization || '',
      shift: user.shift || '',
      phone: user.phone || '',
      department: user.department || ''
    })
    setOpenDialog(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await dbService.update('users', userId, {
          isActive: false,
          updatedAt: new Date().toISOString()
        })
        toast.success('Staff member deactivated')
        await loadUsers()
      } catch (error) {
        toast.error('Failed to deactivate staff member')
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleClose = () => {
    setOpenDialog(false)
    setEditingUser(null)
    setFormData({
      fullName: '',
      email: '',
      role: '',
      password: '',
      specialization: '',
      shift: '',
      phone: '',
      department: ''
    })
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor': return 'primary'
      case 'nurse': return 'success'
      case 'buddy': return 'warning'
      default: return 'default'
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor': return <LocalHospital />
      case 'nurse': return <Group />
      case 'buddy': return <Psychology />
      default: return <Person />
    }
  }

  const filteredUsers = users.filter(user => {
    if (activeTab === 0) return user.role === 'doctor'
    if (activeTab === 1) return user.role === 'nurse'
    if (activeTab === 2) return user.role === 'buddy'
    return true
  })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Staff Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          Add Staff Member
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Doctors" icon={<LocalHospital />} />
            <Tab label="Nurses" icon={<Group />} />
            <Tab label="Medical Buddies" icon={<Psychology />} />
          </Tabs>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                            {getRoleIcon(user.role)}
                          </Avatar>
                          <Typography variant="body2">
                            {user.fullName || user.displayName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.specialization || '-'}</TableCell>
                      <TableCell>{user.shift || '-'}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Active' : 'Inactive'} 
                          color={user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(user)}
                            disabled={loading}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(user.id)}
                            disabled={loading}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {filteredUsers.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                No staff members found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading || !!editingUser}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={loading}
                >
                  {roles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  disabled={loading}
                  helperText={editingUser ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Shift"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  disabled={loading}
                >
                  {shifts.map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={loading}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Saving...' : (editingUser ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StaffManagement 