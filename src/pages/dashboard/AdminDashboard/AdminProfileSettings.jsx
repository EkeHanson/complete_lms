import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button,
  Grid, Paper, IconButton,
  InputAdornment, Container, CircularProgress, Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { userAPI, API_BASE_URL } from '../../../config';
import './AdminProfileSettings.css';


const AdminProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    facebook_link: '',
    twitter_link: '',
    linkedin_link: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const initialPasswordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const initialPasswordErrors = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordFieldErrors, setPasswordFieldErrors] = useState(initialPasswordErrors);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        facebook_link: user.facebook_link || '',
        twitter_link: user.twitter_link || '',
        linkedin_link: user.linkedin_link || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Only send profileData (no image)
      const response = await userAPI.updateUser(user.id, profileData);
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordFieldErrors(initialPasswordErrors);

    // Client-side validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFieldErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match"
      }));
      setPasswordLoading(false);
      return;
    }

    try {
      await userAPI.updateUserPassword(user.id, {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      setPasswordSuccess('Password updated successfully!');
      setPasswordData(initialPasswordData);
    } catch (err) {
      let errorMsg = 'Failed to update password';
      let fieldErrors = { ...initialPasswordErrors };
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else {
          // Map field errors
          Object.entries(err.response.data).forEach(([key, value]) => {
            if (fieldErrors[key] !== undefined) {
              fieldErrors[key] = Array.isArray(value) ? value.join(' ') : value;
            } else {
              errorMsg = Array.isArray(value) ? value.join(' ') : value;
            }
          });
        }
      }
      setPasswordError(errorMsg);
      setPasswordFieldErrors(fieldErrors);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="admin-profile-root">
      <Typography variant="h4" className="admin-profile-title" gutterBottom>
        Manage Profile
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left Column - Profile Information */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} className="admin-profile-paper" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" className="admin-profile-section-title" gutterBottom>
              Basic Information
            </Typography>
            <form className="admin-profile-form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Facebook link"
                    name="facebook_link"
                    value={profileData.facebook_link}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Twitter link"
                    name="twitter_link"
                    value={profileData.twitter_link}
                    onChange={handleProfileChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="LinkedIn link"
                    name="linkedin_link"
                    value={profileData.linkedin_link}
                    onChange={handleProfileChange}
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  className="admin-profile-upload-btn"
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>

        {/* Password Update Section */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} className="admin-profile-paper" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" className="admin-profile-section-title" gutterBottom>
              Change Password
            </Typography>

            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} autoComplete="off" className="admin-profile-form">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current password"
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    error={!!passwordFieldErrors.currentPassword}
                    helperText={passwordFieldErrors.currentPassword}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('current')}
                            edge="end"
                          >
                            {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New password"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    error={!!passwordFieldErrors.newPassword}
                    helperText={passwordFieldErrors.newPassword}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('new')}
                            edge="end"
                          >
                            {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm new password"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    error={!!passwordFieldErrors.confirmPassword}
                    helperText={passwordFieldErrors.confirmPassword}
                    autoComplete="new-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => togglePasswordVisibility('confirm')}
                            edge="end"
                          >
                            {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>

              <Box className="admin-profile-password-reqs">
                <Typography variant="body2" color="inherit" sx={{ mb: 1 }}>
                  Password requirements:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  <li>Minimum 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                </ul>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={
                    passwordLoading ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                  className="admin-profile-upload-btn"
                >
                  {passwordLoading ? <CircularProgress size={24} /> : 'Update Password'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminProfileSettings;