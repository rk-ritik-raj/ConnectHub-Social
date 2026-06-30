import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth session on mount to persist login state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (username, email, password, fullName) => {
    try {
      const res = await api.post('/auth/signup', { username, email, password, fullName });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed. Please try again.' };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed.' };
    }
  };

  const login = async (loginIdentifier, password) => {
    try {
      const res = await api.post('/auth/login', { loginIdentifier, password });
      if (res.data.success) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed. Please check your credentials.' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to request reset.' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, newPassword });
      return res.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password.' };
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        signup,
        verifyEmail,
        login,
        logout,
        forgotPassword,
        resetPassword,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
