/**
 * @fileoverview App.jsx — Root application component.
 *
 * Sets up React Router with protected routes (authenticated users see
 * Home/History; unauthenticated users see Login). The TaskProvider is
 * only mounted when the user is authenticated to avoid loading tasks
 * before a session is established.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';

/**
 * Inner router — rendered only after auth state is resolved.
 * @param {{ taskRepository: import('./repositories/ITaskRepository').ITaskRepository }} props
 */
function AppRouter({ taskRepository }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100svh',
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

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <TaskProvider repository={taskRepository}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TaskProvider>
  );
}

/**
 * @param {{
 *   authRepository: import('./repositories/IAuthRepository').IAuthRepository,
 *   taskRepository: import('./repositories/ITaskRepository').ITaskRepository,
 * }} props
 */
export function App({ authRepository, taskRepository }) {
  return <AppRouter taskRepository={taskRepository} />;
}
