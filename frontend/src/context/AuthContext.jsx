import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ecommerce_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated user on app initialization if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('ecommerce_token');

      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data && response.data.success !== false) {
          setUser(response.data);
          setToken(storedToken);
        } else {
          throw new Error('Failed to retrieve user profile');
        }
      } catch (error) {
        console.error('Auth restoration failed:', error.response?.data?.message || error.message);
        localStorage.removeItem('ecommerce_token');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async ({ email, password }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      if (data && data.success) {
        const { token: userToken, _id, name, email: userEmail, role } = data;
        localStorage.setItem('ecommerce_token', userToken);
        setToken(userToken);
        const userData = { _id, name, email: userEmail, role };
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Register handler
  const register = async ({ name, email, password }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const data = response.data;

      if (data && data.success) {
        const { token: userToken, _id, name: userName, email: userEmail, role } = data;
        localStorage.setItem('ecommerce_token', userToken);
        setToken(userToken);
        const userData = { _id, name: userName, email: userEmail, role };
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('ecommerce_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
