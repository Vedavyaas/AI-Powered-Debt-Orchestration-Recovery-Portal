import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, managerService, agentService } from '../services/api';

const AuthContext = createContext(null);

/** Decode JWT payload without a library */
const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken]     = useState(localStorage.getItem('dca_auth_token') || null);
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = decodeJwt(token);
    if (!payload) {
      logout();
      return;
    }

    // Extract role from JWT (with scope fallback)
    const role = payload.role
      || (payload.scope ? payload.scope.replace('ROLE_', '').split(' ')[0] : null);

    // Set basic user info from JWT immediately (fast)
    setUser({ name: payload.sub, role, company: '', email: '' });
    setLoading(false);

    // Then enrich with company + email based on role
    let fetchSelfPromise = null;
    if (role === 'ADMIN') {
      fetchSelfPromise = authService.getSelf();
    } else if (role === 'MANAGER') {
      fetchSelfPromise = managerService.getSelf();
    } else if (role === 'AGENT') {
      fetchSelfPromise = agentService.getSelf();
    }

    if (fetchSelfPromise) {
      fetchSelfPromise
        .then((dto) => {
          setUser((prev) => ({
            ...prev,
            id:      dto?.id,
            company: dto?.company ?? '',
            email:   dto?.email   ?? '',
          }));
        })
        .catch(() => {
          // Non-fatal — user is still authenticated, just no company shown
        });
    }
  }, [token]);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    if (data.token) {
      localStorage.setItem('dca_auth_token', data.token);
      setToken(data.token);
    }
    return data;
  };

  const registerAdmin = async (adminData) => {
    return await authService.registerAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('dca_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      token, user, loading, setUser,
      isAuthenticated: !!token && !!user,
      login, registerAdmin, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
