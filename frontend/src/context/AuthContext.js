import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Add token to requests if available
  useEffect(() => {
    const token = localStorage.getItem('portfolio-token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const logout = () => {
    // Clear token
    localStorage.removeItem('portfolio-token');
    delete axios.defaults.headers.common['Authorization'];

    // Clear state
    setUser(null);
    setIsAuthenticated(false);

    toast.success('Logged out successfully');
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('portfolio-token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('/auth/verify');
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', credentials);

      if (response.data.success) {
        const { token, user } = response.data;

        // Store token
        localStorage.setItem('portfolio-token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Update state
        setUser(user);
        setIsAuthenticated(true);

        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);

      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
