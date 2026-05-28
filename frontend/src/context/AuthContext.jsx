import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      // If a token exists on init, set axios default header so requests include it
      if (token) {
        try { api.defaults.headers.common.Authorization = `Bearer ${token}`; } catch (e) {}
      }
      if (token && savedUser) return JSON.parse(savedUser);
      return null;
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      return null;
    }
  });

  useEffect(() => {
    // If token exists but user missing, try to fetch profile or decode token later.
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Attempt quick profile fetch (best-effort) to repopulate user state
      api.get('/api/auth/me').then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }).catch(() => {
        // ignore - user will be redirected to login on actual API calls if invalid
      });
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    if (token) localStorage.setItem('token', token);
    // Ensure axios default header is set on login
    if (token) {
      try { api.defaults.headers.common.Authorization = `Bearer ${token}`; } catch (e) {}
    }
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    try { delete api.defaults.headers.common.Authorization; } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
