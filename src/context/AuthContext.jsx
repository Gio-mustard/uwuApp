/**
 * @fileoverview AuthContext — React context for authentication state.
 *
 * Provides the current user, loading state, and auth methods (login, register,
 * logout) to the entire component tree. The concrete IAuthRepository instance
 * is injected at the top level in main.jsx, keeping components decoupled from
 * the authentication provider.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

/** @type {React.Context<AuthContextValue>} */
const AuthContext = createContext(null);

/**
 * @typedef {Object} AuthContextValue
 * @property {import('../domain/models/User').User | null} user     - Current user, or null if unauthenticated.
 * @property {boolean}  loading   - True while checking/restoring session.
 * @property {string|null} error  - Last auth error message.
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(email: string, password: string, displayName: string) => Promise<void>} register
 * @property {() => Promise<void>} logout
 * @property {(file: File, userId: string) => Promise<void>} uploadAvatar
 */

/**
 * AuthProvider wraps the application and exposes auth state/methods.
 *
 * @param {{ children: React.ReactNode, repository: import('../repositories/IAuthRepository').IAuthRepository }} props
 */
export function AuthProvider({ children, repository }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount.
  useEffect(() => {
    repository.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [repository]);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      const u = await repository.login(email, password);
      setUser(u);
    },
    [repository],
  );

  const register = useCallback(
    async (email, password, displayName) => {
      setError(null);
      const u = await repository.register(email, password, displayName);
      setUser(u);
    },
    [repository],
  );

  const logout = useCallback(async () => {
    await repository.logout();
    setUser(null);
  }, [repository]);

  const uploadAvatar = useCallback(
    async (file, userId) => {
      setError(null);
      const newUrl = await repository.uploadAvatar(file, userId);
      setUser((prev) => prev ? { ...prev, avatarUrl: newUrl } : null);
    },
    [repository]
  );

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook for consuming the AuthContext.
 * Must be used inside an <AuthProvider />.
 *
 * @returns {AuthContextValue}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
