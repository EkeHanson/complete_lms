import { authAPI, userAPI, setAuthTokens } from '../config';

export const login = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    console.log('Login API response:', response.data);
    if (!response.data.user) {
      throw new Error('No user data in login response');
    }
    setAuthTokens(response.data.access, response.data.refresh);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    setAuthTokens(response.data.access, response.data.refresh);
    return {
      user: response.data.user,
    };
  } catch (error) {
    throw error;
  }
};

export { authAPI, userAPI };