// src/services/auth.jsx
import { authAPI, userAPI } from '../config';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    console.log('Login API response:', response.data); // Debug log
    if (!response.data.user) {
      throw new Error('No user data in login response');
    }
    return {
      user: response.data.user,
    };
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await authAPI.getCurrentUser();
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    return {
      user: response.data.user,
    };
  } catch (error) {
    throw error;
  }
};

export { authAPI, userAPI };
