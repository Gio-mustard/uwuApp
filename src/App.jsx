/**
 * @fileoverview App.jsx — Root application component.
 *
 * Sets up the {SessionProvider} which handles:
 *   - Auth session detection (shows LoginPage if not authenticated)
 *   - Creating a user-scoped {ITaskRepository} after login
 *   - Mounting {AuthProvider} and {TaskProvider} as internal implementation details
 *
 * All route-guarding and context orchestration is delegated to {SessionProvider}.
 * Components access auth and task state via `useSession()` sub-hooks.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import { HomePage } from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';

/**
 * @param {{
 *   authRepository: import('./repositories/IAuthRepository').IAuthRepository,
 *   taskRepositoryFactory: (user: import('./domain/models/User').User) => import('./repositories/ITaskRepository').ITaskRepository,
 * }} props
 */
export function App({ authRepository, taskRepositoryFactory }) {
  return (
    <SessionProvider
      authRepository={authRepository}
      taskRepositoryFactory={taskRepositoryFactory}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/historial" element={<HistoryPage />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}
