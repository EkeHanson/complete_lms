// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as PasswordIcon,
  Visibility as ShowPasswordIcon,
  VisibilityOff as HidePasswordIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { login, getDashboardRoute, error: authError, user, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  // Add to your Login component
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('session_expired') === '1') {
    setErrors({
      general: 'Your session has expired. Please log in again.'
    });
    // Clean URL without reload
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

// src/pages/Login.js
useEffect(() => {
  if (user && !authLoading) {
    console.log('User authenticated:', user);
    const route = getDashboardRoute();
    console.log('Navigating to:', route);
    alert('Navigating to:', route);
    if (route === '/login') {
      setErrors((prev) => ({
        ...prev,
        general: 'User data not properly set after login',
      }));
    } else if (window.location.pathname !== route) {
      navigate(route, { replace: true });
    }
  }
}, [user, authLoading, getDashboardRoute, navigate]);

  // Display authError from context if present
  useEffect(() => {
    if (authError) {
      setErrors((prev) => ({
        ...prev,
        general: authError,
      }));
    }
  }, [authError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      general: '',
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
    }

    setErrors(newErrors);
    return valid;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    await login(formData);
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack,
    });
    setErrors({
      general: error.response?.data?.detail || 'Login failed. Please try again.',
    });
    if (error.response?.data?.remaining_attempts) {
      setRemainingAttempts(error.response.data.remaining_attempts);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Container maxWidth="sm" sx={{ py: isMobile ? 4 : 8 }}>
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
        }}
      >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            mb: 1,
          }}
        >
          Welcome Back
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sign in to access your account
        </Typography>
      </Box>

        {errors.general && (
          <Alert
            severity={remainingAttempts !== null && remainingAttempts <= 2 ? 'warning' : 'error'}
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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 3,
            }}
          >
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
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
        </Box>

        <Box
          sx={{
            textAlign: 'center',
            mt: 3,
          }}
        >
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