import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (username, password) => {
    try {
      // Attempt real authentication against auth-service
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json(); // returns { token, username, role }
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        return true;
      }
    } catch (err) {
      console.warn("Real auth-service failed or unreachable. Falling back to simulated authentication.", err);
    }

    // Simulated login fallback
    if (username === 'admin' && password === 'admin') {
      const dummyToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4Njk2MDAwMCwiZXhwIjoyMDg2OTYwMDAwfQ.dummySignature";
      const userData = { token: dummyToken, username: 'admin', role: 'ADMIN' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
