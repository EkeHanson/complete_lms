// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { authAPI, userAPI } from '../services/auth';
import { QA_ROLES } from '../constants/qaRoles';
import { useLocation } from 'react-router-dom';

// Create context
const AuthContext = createContext();

// Main provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Enhanced user data transformation
  const transformUserData = (userData) => {
    return {
      ...userData,
      role: userData.role || 'TRAINER',
      qaStats: {
        lastSampled: userData.lastSampled || null,
        complianceScore: userData.complianceScore || 0,
        completedTrainings: userData.completedTrainings || [],
      },
      permissions: QA_ROLES[userData.role]?.permissions || [],
    };
  };

// src/contexts/AuthContext.jsx
const fetchUser = useCallback(async () => {
  if (['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    setLoading(false);
    return;
  }

  if (user && !['/login', '/signup', '/forgot-password'].includes(location.pathname)) {
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const response = await authAPI.getCurrentUser();
    console.log('Fetch user response:', response.data);
    alert('Fetch user response:', response.data);
    if (!response.data) {
      throw new Error('No user data returned');
    }
    const userData = transformUserData(response.data);
    setUser(userData);
    // Set tenant schema in API calls
    api.defaults.headers['X-Tenant-Schema'] = response.data.tenant_schema;
    setError(null);
  } catch (err) {
    console.error('Fetch user error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    setError(err.message);
    setUser(null);
  } finally {
    setLoading(false);
  }
}, [location.pathname, user]);

const login = async (credentials) => {
  try {
    setLoading(true);
    const response = await authAPI.login(credentials);
    if (!response.data?.user) {
      throw new Error('Invalid credentials');
    }
    console.log('Login response:', response.data); // Debug log
    alert('Login response:', response.data); // Debug log
    const transformedUser = transformUserData(response.data.user);
    setUser(transformedUser);
    setError(null);
    return transformedUser;
  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    setError(err.message);
    throw err;
  } finally {
    setLoading(false);
  }
};
  // Initialize auth on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);


const logout = async () => {
    try {
        await authAPI.logout();
        document.cookie = 'access_token=; Max-Age=0; path=/';
        document.cookie = 'refresh_token=; Max-Age=0; path=/';
    } catch (err) {
        console.error('Logout error:', err);
    } finally {
        setUser(null);
    }
};

  // Permission check
  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  // Get dashboard route based on role
const getDashboardRoute = () => {
  if (!user) {
    console.warn('No user found in getDashboardRoute');
    return '/login';
  }
  const role = user.role?.toLowerCase();
  console.log('User role in getDashboardRoute:', role); // Debug log
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin';
    case 'instructor':
    case 'trainer':
      return '/instructor-dashboard';
    case 'learner':
    case 'student':
      return '/student-dashboard';
    case 'iqa_lead':
    case 'eqa_auditor':
      return '/iqa';
    default:
      console.warn('Unknown role:', role);
      return '/dashboard';
  }
};
  // Update user profile
  const updateUser = async (updates) => {
    try {
      const response = await userAPI.updateUser(user.id, updates);
      setUser((prev) => ({
        ...prev,
        ...response.data,
        qaStats: {
          ...prev.qaStats,
          ...response.data.qaStats,
        },
      }));
    } catch (err) {
      console.error('Update failed:', err);
      throw err;
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    hasPermission,
    getDashboardRoute,
    refetchUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Base auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// QA-specific auth hook
export const useQAAuth = () => {
  const auth = useAuth();
  return {
    ...auth,
    isIQALead: auth.hasPermission('sample_work'),
    isEQAAuditor: auth.hasPermission('manage_evidence'),
    canViewReports: auth.hasPermission('view_reports'),
  };
};
