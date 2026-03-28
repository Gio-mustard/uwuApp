/**
 * @fileoverview SessionContext — Application session gateway.
 *
 * `SessionProvider` is the top-level authenticated context. It:
 *   1. Checks for an active user via {IAuthRepository} on mount.
 *   2. Renders {LoginPage} if no authenticated user is found.
 *   3. Once a user is confirmed, calls `taskRepositoryFactory(user)` to
 *      create a user-scoped {ITaskRepository} instance, then mounts
 *      {TaskProvider} so tasks are always scoped to the current user.
 *
 * `useSession()` exposes sub-hooks — not flat data — so each consumer
 * only subscribes to the context slice it needs, preventing cross-domain
 * re-renders as the app grows.
 *
 * See session_context_pattern.md for the full architecture guide.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { TaskProvider, useTasks } from './TaskContext';
import { LoginPage } from '../pages/LoginPage';


function SessionLoader() {
  // ─── Internal loading spinner ────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        width: '100%',
        maxWidth: 'var(--max-width)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
    </div>
  );
}

// ─── Inner gateway (needs access to AuthContext) ──────────────────────────────

/**
 * Reads auth state and conditionally mounts the TaskProvider + children.
 * This component must be rendered inside an {AuthProvider}.
 *
 * @param {{
 *   children: React.ReactNode,
 *   taskRepositoryFactory: (user: import('../domain/models/User').User) => import('../repositories/ITaskRepository').ITaskRepository,
 * }} props
 */
function SessionGateway({ children, taskRepositoryFactory }) {
  const { user, loading } = useAuth();
  const [taskRepository, setTaskRepository] = useState(null);
  const [repoLoading, setRepoLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setTaskRepository(null);
      return;
    }

    let cancelled = false;
    setRepoLoading(true);

    taskRepositoryFactory(user)
      .then((repo) => {
        if (!cancelled) setTaskRepository(repo);
      })
      .catch((err) => {
        console.error('Failed to initialize task repository:', err);
      })
      .finally(() => {
        if (!cancelled) setRepoLoading(false);
      });

    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading || repoLoading) return <SessionLoader />;
  if (!user) return <LoginPage />;
  if (!taskRepository) return <SessionLoader />;

  return (
    <TaskProvider repository={taskRepository}>
      {children}
    </TaskProvider>
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Mounts all session-scoped providers.
 * Place this at the root of the authenticated app (typically inside {BrowserRouter}).
 *
 * @param {{
 *   children: React.ReactNode,
 *   authRepository: import('../repositories/IAuthRepository').IAuthRepository,
 *   taskRepositoryFactory: (user: import('../domain/models/User').User) => import('../repositories/ITaskRepository').ITaskRepository,
 * }} props
 */
export function SessionProvider({ children, authRepository, taskRepositoryFactory }) {
  return (
    <AuthProvider repository={authRepository}>
      <SessionGateway taskRepositoryFactory={taskRepositoryFactory}>
        {children}
      </SessionGateway>
    </AuthProvider>
  );
}

/**
 * Returns the available session sub-hooks.
 *
 * Each sub-hook accesses its own React Context independently, so a component
 * that only calls `useAuth()` will NOT re-render when task state changes,
 * and vice versa. `useSession()` itself has zero re-render cost.
 *
 * @returns {{
 *   useAuth:  () => import('./AuthContext').AuthContextValue,
 *   useTasks: () => import('./TaskContext').TaskContextValue,
 * }}
 *
 * @example
 * // Only subscribes to auth state:
 * const { useAuth } = useSession();
 * const { user, logout } = useAuth();
 *
 * // Only subscribes to task state:
 * const { useTasks } = useSession();
 * const { dailyTasks } = useTasks();
 */
export function useSession() {
  // Zero-cost: just returns references to existing hooks.
  // No useContext() call here — each sub-hook does its own subscription.
  return { useAuth, useTasks };
}
