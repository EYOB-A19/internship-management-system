import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, setApiToken, getApiToken } from '../services/apiClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [catalog, setCatalog] = useState({
    universities: [],
    departments: [],
    fieldsOfStudy: [],
    skills: [],
    locations: ['Addis Ababa', 'Adama', 'Bahir Dar', 'Hawassa', 'Jimma', 'Mekelle', 'Gondar'],
    academicLevels: ['Diploma', 'BSc', 'BA', 'MSc', 'MA', 'PhD', 'Other'],
  });
  const [loading, setLoading] = useState(true);

  const refreshCatalog = useCallback(async () => {
    try {
      const res = await apiFetch('/catalog');
      if (res.data) {
        setCatalog(res.data);
      }
    } catch {
      // Keep default catalog fallback if network hiccups
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const token = getApiToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/auth/me');
      setUser(res.data.user);
      setProfile(res.data.profile);
      setUnreadCount(res.data.unreadNotifications || 0);
    } catch {
      setApiToken(null);
      setUser(null);
      setProfile(null);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
    refreshSession();
  }, [refreshCatalog, refreshSession]);

  const login = async (email, password) => {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setApiToken(res.data.token);
    setUser(res.data.user);
    setProfile(res.data.profile);
    await refreshSession();
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: formData,
    });
    setApiToken(res.data.token);
    setUser(res.data.user);
    setProfile(res.data.profile);
    await refreshSession();
    return res.data.user;
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore logout network error
    }
    setApiToken(null);
    setUser(null);
    setProfile(null);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        unreadCount,
        catalog,
        loading,
        login,
        register,
        logout,
        refreshSession,
        refreshCatalog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
