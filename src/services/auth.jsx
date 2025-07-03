// src/services/auth.jsx
import { authAPI } from '../config';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    return {
      user: response.data.user,
    };
  } catch (error) {
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

// Export authAPI for use in other modules
export { authAPI };