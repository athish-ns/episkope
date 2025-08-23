import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import { Email, Send, Settings, CheckCircle, Error } from '@mui/icons-material';
import emailService from '../../services/emailService';

const EmailServiceTester = () => {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [config, setConfig] = useState(emailService.getConfig());

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testResult = await emailService.testEmailService();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshConfig = () => {
    setConfig(emailService.getConfig());
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'resend': return 'success';
      case 'nodemailer': return 'warning';
      case 'console': return 'info';
      default: return 'default';
    }
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'resend': return '📧';
      case 'nodemailer': return '📮';
      case 'console': return '🖥️';
      default: return '❓';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Email Service Tester
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Use this component to test your email service configuration and verify that emails are being sent correctly.
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Display */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Settings sx={{ mr: 1 }} />
                <Typography variant="h6">Current Configuration</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Provider:
                </Typography>
                <Chip
                  icon={<span>{getProviderIcon(config.provider)}</span>}
                  label={config.provider.toUpperCase()}
                  color={getProviderColor(config.provider)}
                  variant="outlined"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  From Email:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {config[config.provider]?.fromEmail || 'Not configured'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  From Name:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {config[config.provider]?.fromName || 'Not configured'}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                onClick={handleRefreshConfig}
                startIcon={<Settings />}
                size="small"
              >
                Refresh Config
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Test Email Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email sx={{ mr: 1 }} />
                <Typography variant="h6">Test Email Service</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter email address to test"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleTestEmail}
                disabled={loading || !testEmail}
                startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              >
                {loading ? 'Testing...' : 'Test Email Service'}
              </Button>

              {result && (
                <Box sx={{ mt: 2 }}>
                  <Alert
                    icon={result.success ? <CheckCircle /> : <Error />}
                    severity={result.success ? 'success' : 'error'}
                  >
                    {result.success ? (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          ✅ Email Service Test Successful!
                        </Typography>
                        <Typography variant="body2">
                          Provider: {result.result?.provider || 'Unknown'}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          ❌ Email Service Test Failed
                        </Typography>
                        <Typography variant="body2">
                          Error: {result.error}
                        </Typography>
                      </>
                    )}
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Configure Email Service
          </Typography>
          
          <Typography variant="body2" paragraph>
            1. <strong>Choose Provider:</strong> Open <code>src/config/emailConfig.js</code> and set your preferred provider
          </Typography>
          
          <Typography variant="body2" paragraph>
            2. <strong>Configure Credentials:</strong> Update the configuration with your API keys and settings
          </Typography>
          
          <Typography variant="body2" paragraph>
            3. <strong>Test Configuration:</strong> Use the test button above to verify your setup
          </Typography>
          
          <Typography variant="body2" paragraph>
            4. <strong>Environment Variables:</strong> For production, use environment variables instead of hardcoded values
          </Typography>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> The console provider will log emails to the browser console. 
            Configure a real email service for production use.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmailServiceTester;
