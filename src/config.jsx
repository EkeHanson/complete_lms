// config.js
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:9090/';
const API_BASE_URL = 'https://complete-lms-api.onrender.com';

// Create base axios instance without default Content-Type
const api = axios.create({
  baseURL: API_BASE_URL,
  // No default headers - they'll be set per request
});

// Helper function to get CSRF token from cookies
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// API endpoints configuration
export const userAPI = {

      // Add this with the other userAPI functions
  getUserActivities: (params = {}) => api.get('/users/api/user-activities/', {
    params,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  // User management
  getUsers: (params = {}) => api.get('/users/api/users/', {
    params,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  // User management
  fetchRoleStats : (params = {}) => api.get('/users/api/users/role_stats/', {
    params,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  getUser: (id) => api.get(`/users/api/users/${id}/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  createUser: (userData) => api.post('/users/api/register/', userData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  updateUser: (id, userData) => api.patch(`/users/api/users/${id}/`, userData, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  deleteUser: (id) => api.delete(`/users/api/users/${id}/`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  // Bulk user upload
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/users/api/users/bulk_upload/', formData, {
      headers: {
        // Let browser set Content-Type with boundary automatically
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'X-CSRFToken': getCSRFToken()
      },
      withCredentials: true
    });
  },
  
  getUserStats: () => api.get('/users/api/users/stats/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
};

export const authAPI = {
    
  // Authentication
  login: (credentials) => api.post('/users/api/token/', credentials, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  
  logout: () => api.post('/users/api/logout/', {
    refresh: localStorage.getItem('refresh_token')
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  refreshToken: (refreshToken) => api.post('/users/api/token/refresh/', {
    refresh: refreshToken
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  
  getCurrentUser: () => api.get('/users/api/profile/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  }),
  
  register: (userData) => api.post('/users/api/register/', userData, {
    headers: {
      'Content-Type': 'application/json'
    }
  }),
  
  verifyToken: (token) => api.post('/users/api/token/verify/', {
    token: token
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
};


// Utility functions
export const setAuthTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Default export
export default {
  API_BASE_URL,
  api,
  userAPI,
  authAPI,
  setAuthTokens,
  clearAuthTokens,
  getAuthHeader
};

//ENDPOINTS
// Create a user: http://127.0.0.1:9090/users/api/register/
