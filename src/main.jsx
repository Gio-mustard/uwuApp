/**
 * @fileoverview main.jsx — Application entry point.
 *
 * This is where the concrete repository implementations are instantiated and
 * injected into the application via the AuthProvider and App component.
 *
 * To switch from mock repositories to real ones (e.g. Supabase, REST API),
 * simply swap the imports and instantiations here — no other files need to change.
 *
 * Development repositories used:
 *   - MockAuthRepository  → simulates login/register with in-memory users
 *   - MockTaskRepository  → simulates data persistence via localStorage
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { MockAuthRepository } from './repositories/mock/MockAuthRepository';
import { MockTaskRepository } from './repositories/mock/MockTaskRepository';

// ── Instantiate repositories (swap these for production implementations) ──────
const authRepository = new MockAuthRepository();
const taskRepository = new MockTaskRepository();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider repository={authRepository}>
      <App authRepository={authRepository} taskRepository={taskRepository} />
    </AuthProvider>
  </StrictMode>,
);
