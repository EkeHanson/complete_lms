import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Grid,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as PasswordIcon,
  Visibility as ShowPasswordIcon,
  VisibilityOff as HidePasswordIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setRemainingAttempts(null); // Reset remaining attempts on new submission
    setErrors(prev => ({ ...prev, general: '' })); // Clear previous errors
    
    try {
      const response = await login(formData.email, formData.password);
      
      // Store tokens and user data
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on role
      switch(response.user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'instructor':
          navigate('/instructor-dashboard');
          break;
        case 'learner':
          navigate('/learner-dashboard');
          break;
        case 'owner':
          navigate('/owner-dashboard');
          break;
        default:
          navigate('/');
      }
      
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases from backend
      if (error.response) {
        const { data } = error.response;
        
        // Check for account suspension message
        if (data.detail && data.detail.includes('Account suspended')) {
          errorMessage = 'Your account has been suspended due to too many failed attempts. Please contact support.';
        } 
        // Check for remaining attempts message
        else if (data.detail && data.detail.includes('attempts remaining')) {
          const attemptsLeft = parseInt(data.detail.match(/\d+/)[0]);
          setRemainingAttempts(attemptsLeft);
          errorMessage = data.detail;
        }
        // Check for custom validation errors
        else if (data.email || data.password) {
          setErrors(prev => ({
            ...prev,
            email: data.email || '',
            password: data.password || ''
          }));
          errorMessage = 'Please fix the errors above';
        }
      }
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: isMobile ? 4 : 8 }}>
      <Paper elevation={isMobile ? 0 : 3} sx={{ 
        p: isMobile ? 2 : 4, 
        borderRadius: 2,
        border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`
      }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 700,
            mb: 1
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to access your account
          </Typography>
        </Box>

        {/* Error message */}
        {errors.general && (
          <Alert 
            severity={
              remainingAttempts !== null && remainingAttempts <= 2 ? 
              'warning' : 'error'
            } 
            sx={{ mb: 3 }}
          >
            {errors.general}
            {remainingAttempts !== null && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Remaining attempts: {remainingAttempts}
                </Typography>
                {remainingAttempts <= 2 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <Link href="/forgot-password">Reset your password</Link> if you've forgotten it
                  </Typography>
                )}
              </Box>
            )}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color={errors.email ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PasswordIcon color={errors.password ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mb: 3
          }}>
            <Link href="/forgot-password" variant="body2">
              Forgot Password?
            </Link>
          </Box>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              mb: 2,
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>

        {/* Sign Up Link */}
        <Box sx={{ 
          textAlign: 'center',
          mt: 3
        }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link href="/signup" fontWeight={600}>
              Sign up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;