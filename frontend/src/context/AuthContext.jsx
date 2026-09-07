import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('novyra_user');
      const token = localStorage.getItem('novyra_access_token');

      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await api.get('/auth/me');
          if (res.data?.data) {
            setUser(res.data.data);
            localStorage.setItem('novyra_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('Initial session validation skipped/failed:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    if (res.data?.success && res.data?.data) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('novyra_access_token', accessToken);
      localStorage.setItem('novyra_refresh_token', refreshToken);
      localStorage.setItem('novyra_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Login failed' };
  };

  const loginWithGoogle = async (googleData) => {
    const res = await api.post('/auth/google', googleData);
    if (res.data?.success && res.data?.data) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('novyra_access_token', accessToken);
      localStorage.setItem('novyra_refresh_token', refreshToken);
      localStorage.setItem('novyra_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Google login failed' };
  };

  const loginWithTelegram = async (telegramData) => {
    const res = await api.post('/auth/telegram', telegramData);
    if (res.data?.success && res.data?.data) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('novyra_access_token', accessToken);
      localStorage.setItem('novyra_refresh_token', refreshToken);
      localStorage.setItem('novyra_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Telegram login failed' };
  };

  const register = async (fullName, username, email, phoneNumber, password, referralCode) => {
    const res = await api.post('/auth/register', {
      fullName,
      username,
      email,
      phoneNumber,
      password,
      referralCode: referralCode || undefined
    });

    if (res.data?.success && res.data?.data) {
      const { accessToken, refreshToken, user: userData } = res.data.data;
      localStorage.setItem('novyra_access_token', accessToken);
      localStorage.setItem('novyra_refresh_token', refreshToken);
      localStorage.setItem('novyra_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || 'Registration failed' };
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('novyra_refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    localStorage.removeItem('novyra_access_token');
    localStorage.removeItem('novyra_refresh_token');
    localStorage.removeItem('novyra_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('novyra_user', JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
    return user;
  };

  const roles = user?.roles || [];
  const isAdmin = roles.includes('SuperAdmin') || roles.includes('Admin');
  const isFinanceAdmin = isAdmin || roles.includes('FinanceAdmin');
  const isSupportAgent = isAdmin || roles.includes('SupportAgent');
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated,
        isAdmin,
        isFinanceAdmin,
        isSupportAgent,
        loading,
        login,
        loginWithGoogle,
        loginWithTelegram,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
