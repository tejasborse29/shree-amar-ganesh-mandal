import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('amgm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('amgm_auth_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate session on mount
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('amgm_auth_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('amgm_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // If token expired or invalid, clear and logout
          if (err.response?.status === 401 || (err.message && err.message.includes('401'))) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('amgm_auth_token', res.token);
      localStorage.setItem('amgm_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'लॉगिन अयशस्वी');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('amgm_auth_token', res.token);
      localStorage.setItem('amgm_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'नोंदणी अयशस्वी');
  };

  const forgotPassword = async (identifier) => {
    const res = await api.post('/auth/forgot-password', { identifier });
    if (res.success) {
      return res;
    }
    throw new Error(res.message || 'पडताळणी कोड पाठवता आला नाही');
  };

  const resetPassword = async (identifier, otp, newPassword) => {
    const res = await api.post('/auth/reset-password', { identifier, otp, newPassword });
    if (res.success) {
      return res;
    }
    throw new Error(res.message || 'पासवर्ड बदलता आला नाही');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('amgm_auth_token');
    localStorage.removeItem('amgm_user');
  };

  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    hasRole,
    isSuperAdmin: user?.role === 'super_admin',
    isTreasurer: user?.role === 'treasurer',
    isReceiptManager: user?.role === 'receipt_manager',
    isEventManager: user?.role === 'event_manager',
    isVolunteer: user?.role === 'volunteer'
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
