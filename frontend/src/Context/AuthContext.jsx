import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { clearAuthToken, setAuthToken } from '../Services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('stockscope_token');
      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        clearAuthToken();
        localStorage.removeItem('stockscope_token');
        localStorage.removeItem('stockscope_user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [navigate]);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user: authUser, token } = response.data.data;

    localStorage.setItem('stockscope_token', token);
    localStorage.setItem('stockscope_user', JSON.stringify(authUser));
    setAuthToken(token);
    setUser(authUser);
    toast.success('Welcome back to StockScope');
    navigate('/', { replace: true });
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    toast.success('Account created successfully. Please sign in.');
    navigate('/login', { replace: true });
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      clearAuthToken();
      localStorage.removeItem('stockscope_token');
      localStorage.removeItem('stockscope_user');
      setUser(null);
      toast.success('Signed out');
      navigate('/login', { replace: true });
    }
  };

  const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    setUser(response.data.data);
    return response.data;
  };

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    getCurrentUser,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
