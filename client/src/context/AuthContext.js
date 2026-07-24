import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { registerOrLogin, updateProfile as apiUpdateProfile } from '../api/users';

const AuthContext = createContext(null);

const TOKEN_KEY = 'farmco_token';
const USER_KEY = 'farmco_user';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const persist = useCallback((userObj, token) => {
    try {
      if (userObj) localStorage.setItem(USER_KEY, JSON.stringify(userObj));
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      /* ignore storage errors */
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      /* ignore */
    }
  }, []);

  // If the axios client detects a 401, clear our session state too.
  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('farmco:unauthorized', handler);
    return () => window.removeEventListener('farmco:unauthorized', handler);
  }, []);

  const authenticate = useCallback(
    async ({ phone, name, language, role, pin }) => {
      setLoading(true);
      setError('');
      try {
        const data = await registerOrLogin({ phone, name, language, role, pin });
        const { token, ...userObj } = data;
        setUser(userObj);
        persist(userObj, token);
        return userObj;
      } catch (err) {
        const message =
          err.response?.data?.error || 'Something went wrong. Please try again.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const updateProfile = useCallback(
    async (payload) => {
      const updated = await apiUpdateProfile(payload);
      setUser((prev) => ({ ...prev, ...updated }));
      persist({ ...user, ...updated });
      return updated;
    },
    [persist, user]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      error,
      authenticate,
      logout,
      updateProfile,
      setUser,
    }),
    [user, loading, error, authenticate, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
