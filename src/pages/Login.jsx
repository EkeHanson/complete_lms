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
import './Login.css';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_expired') === '1') {
      setErrors({
        general: 'Your session has expired. Please log in again.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user && !authLoading) {
      console.log('User authenticated:', user);
      const route = getDashboardRoute();
      console.log('Navigating to:', route);
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
    <Box className="login-container">
      <Box className="wave wave-1" />
      <Box className="wave wave-2" />
      <Box className="wave wave-3" />
      <Container maxWidth="xs" sx={{ py: isMobile ? 2 : 4, display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
        <Paper
          className="login-card"
          sx={{
            p: isMobile ? 2 : 3,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(30, 58, 138, 0.15)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                mb: 1,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Welcome
            </Typography>
            <Typography variant="body2" sx={{ color: '#111827', opacity: 0.7 }}>
              Sign in to your account
            </Typography>
          </Box>

          {errors.general && (
            <Alert
              severity={remainingAttempts !== null && remainingAttempts <= 2 ? 'warning' : 'error'}
              sx={{ mb: 2, fontSize: '0.85rem' }}
            >
              {errors.general}
              {remainingAttempts !== null && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    Remaining attempts: {remainingAttempts}
                  </Typography>
                  {remainingAttempts <= 2 && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      <Link href="/forgot-password">Reset your password</Link> if you've forgotten it
                    </Typography>
                  )}
                </Box>
              )}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: errors.email ? 'error.main' : '#1E3A8A', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(30, 58, 138, 0.3)' },
                  '&:hover fieldset': { borderColor: '#1E3A8A' },
                  '&.Mui-focused fieldset': { borderColor: '#1E3A8A', borderWidth: '2px' },
                },
                '& .MuiInputLabel-root': { color: '#111827', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1E3A8A' },
              }}
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
                    <PasswordIcon sx={{ color: errors.password ? 'error.main' : '#1E3A8A', fontSize: '1.1rem' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <HidePasswordIcon sx={{ color: '#1E3A8A', fontSize: '1.1rem' }} />
                      ) : (
                        <ShowPasswordIcon sx={{ color: '#1E3A8A', fontSize: '1.1rem' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: 'rgba(30, 58, 138, 0.3)' },
                  '&:hover fieldset': { borderColor: '#1E3A8A' },
                  '&.Mui-focused fieldset': { borderColor: '#1E3A8A', borderWidth: '2px' },
                },
                '& .MuiInputLabel-root': { color: '#111827', fontSize: '0.9rem' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1E3A8A' },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mb: 2,
              }}
            >
              <Link href="/forgot-password" variant="body2" sx={{ color: '#3B82F6', fontWeight: 500, fontSize: '0.85rem' }}>
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
                py: 1.2,
                fontWeight: 600,
                fontSize: '0.9rem',
                backgroundColor: '#1E3A8A',
                borderRadius: '8px',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#3B82F6' },
                '&:disabled': { backgroundColor: '#1E3A8A', opacity: 0.5 },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: '#111827', fontSize: '0.85rem' }}>
              Don't have an account?{' '}
              <Link href="/signup" sx={{ color: '#7C3AED', fontWeight: 600 }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;