// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { authAPI } from '../config';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Fetch current user on mount
//     const fetchUser = async () => {
//       try {
//         const response = await authAPI.getCurrentUser();
//         setUser(response.data);
//       } catch (error) {
//         console.error('Failed to fetch user:', error);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, []);

//   const login = async (credentials) => {
//     try {
//       const response = await authAPI.login(credentials);
//       const { access, refresh } = response.data;
//       authAPI.setAuthTokens(access, refresh);
//       const userResponse = await authAPI.getCurrentUser();
//       setUser(userResponse.data);
//       return userResponse.data;
//     } catch (error) {
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//       authAPI.clearAuthTokens();
//       setUser(null);
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   const updateUser = (updatedUser) => {
//     setUser(updatedUser);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../services/auth';
import { useQuality } from './QualityContext';

// Define all QA roles and permissions
const QA_ROLES = {
  IQA_LEAD: {
    permissions: [
      'view_assessments', 
      'sample_work', 
      'conduct_observations',
      'manage_feedback'
    ],
    dashboard: '/dashboard/iqa'
  },
  EQA_AUDITOR: {
    permissions: [
      'view_reports',
      'manage_evidence',
      'schedule_audits',
      'submit_compliance'
    ],
    dashboard: '/dashboard/eqa'
  },
  TRAINER: {
    permissions: [
      'submit_work',
      'view_feedback',
      'request_verification'
    ],
    dashboard: '/dashboard/trainer'
  },
  ADMIN: {
    permissions: ['*'],
    dashboard: '/dashboard/admin'
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { updateRiskThresholds } = useQuality();

  // Fetch user with extended QA data
  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAPI.getCurrentUser();
      
      if (!response.data) {
        throw new Error('No user data returned');
      }

      // Enhance user object with QA-specific data
      const userWithQA = {
        ...response.data,
        role: response.data.role || 'TRAINER', // Default role
        qaStats: {
          lastSampled: response.data.lastSampled || null,
          complianceScore: response.data.complianceScore || 0,
          completedTrainings: response.data.completedTrainings || []
        },
        permissions: QA_ROLES[response.data.role]?.permissions || []
      };

      setUser(userWithQA);
      setError(null);

      // Set risk thresholds based on organization settings
      if (response.data.organization) {
        updateRiskThresholds(response.data.organization.qaSettings?.riskThresholds);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [updateRiskThresholds]);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await authAPI.refreshToken(refreshToken);
          await fetchUser();
        } else {
          setLoading(false);
        }
      } catch (err) {
        localStorage.removeItem('refreshToken');
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchUser]);

  // Login handler with QA role detection
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (!response.data?.access) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh || '');

      await fetchUser();
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  // Check permission for QA features
  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  // Get user's dashboard route based on role
  const getDashboardRoute = () => {
    return QA_ROLES[user?.role]?.dashboard || '/dashboard';
  };

  // Update user profile (including QA-specific fields)
  const updateUser = async (updates) => {
    try {
      const response = await authAPI.updateUser({
        ...updates,
        userId: user.id
      });

      setUser(prev => ({
        ...prev,
        ...response.data,
        qaStats: {
          ...prev.qaStats,
          ...response.data.qaStats
        }
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
    refetchUser: fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook for QA-specific auth checks
export const useQAAuth = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    isIQALead: auth.hasPermission('sample_work'),
    isEQAAuditor: auth.hasPermission('manage_evidence'),
    canViewReports: auth.hasPermission('view_reports')
  };
};