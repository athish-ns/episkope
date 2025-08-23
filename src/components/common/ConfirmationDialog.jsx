import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Warning,
  Delete,
  Edit,
  Save,
  Close,
  Info
} from '@mui/icons-material';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'delete', // delete, edit, save, info
  severity = 'warning', // error, warning, info, success
  confirmText,
  cancelText = 'Cancel',
  loading = false,
  showIcon = true,
  maxWidth = 'sm',
  children
}) => {
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (type) {
      case 'delete':
        return <Delete color="error" />;
      case 'edit':
        return <Edit color="warning" />;
      case 'save':
        return <Save color="primary" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'delete':
        return 'Confirm Deletion';
      case 'edit':
        return 'Confirm Changes';
      case 'save':
        return 'Confirm Save';
      case 'info':
        return 'Information';
      default:
        return 'Confirm Action';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'delete':
        return 'Are you sure you want to delete this item? This action cannot be undone.';
      case 'edit':
        return 'Are you sure you want to save these changes?';
      case 'save':
        return 'Do you want to save these changes?';
      case 'info':
        return 'Please review the information below.';
      default:
        return 'Are you sure you want to proceed?';
    }
  };

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'delete':
        return 'Delete';
      case 'edit':
        return 'Save Changes';
      case 'save':
        return 'Save';
      case 'info':
        return 'OK';
      default:
        return 'Confirm';
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'delete':
        return 'error';
      case 'edit':
        return 'warning';
      case 'save':
        return 'primary';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1
      }}>
        {getIcon()}
        <Typography variant="h6" component="span">
          {title || getDefaultTitle()}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        {message && (
          <Alert severity={severity} sx={{ mb: 2 }}>
            <Typography variant="body1">
              {message || getDefaultMessage()}
            </Typography>
          </Alert>
        )}
        
        {children && (
          <Box sx={{ mt: 2 }}>
            {children}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Processing...' : (confirmText || getDefaultConfirmText())}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
