// src/services/auth.js
import { authAPI } from '../config';
import axios from 'axios';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      // Get and store user profile
      const profileResponse = await getProfile();
      localStorage.setItem('user', JSON.stringify(profileResponse.data));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  authAPI.logout().then(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  });
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const refreshToken = async () => {
  try {
    const response = await axios.post(`${authAPI.baseURL}token/refresh/`, {
      refresh: localStorage.getItem('refresh_token')
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  return authAPI.getCurrentUser();
};

// Optional: You can still provide a default export that contains all methods
const authService = {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  register,
  getProfile
};

export { authAPI };
export default authService;

