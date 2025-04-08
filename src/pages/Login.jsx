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
  useMediaQuery
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as PasswordIcon,
  Visibility as ShowPasswordIcon,
  VisibilityOff as HidePasswordIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Apple as AppleIcon
} from '@mui/icons-material';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: false,
    password: false
  });
  const [loading, setLoading] = useState(false);

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
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: false,
      password: false
    };

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = true;
      valid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = true;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        // Handle successful login (redirect, etc.)
      }, 1500);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic
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

        {/* Social Login Buttons */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSocialLogin('google')}
                sx={{
                  py: 1.5,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <GoogleIcon />
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSocialLogin('facebook')}
                sx={{
                  py: 1.5,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <FacebookIcon />
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleSocialLogin('apple')}
                sx={{
                  py: 1.5,
                  borderColor: theme.palette.divider,
                  '&:hover': {
                    borderColor: theme.palette.divider
                  }
                }}
              >
                <AppleIcon />
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Divider */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          my: 4
        }}>
          <Divider sx={{ flexGrow: 1 }} />
          <Typography variant="body2" sx={{ 
            px: 2, 
            color: theme.palette.text.secondary
          }}>
            OR
          </Typography>
          <Divider sx={{ flexGrow: 1 }} />
        </Box>

        {/* Login Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            helperText={errors.email ? 'Please enter a valid email address' : ''}
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
            error={errors.password}
            helperText={errors.password ? 'Password must be at least 6 characters' : ''}
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