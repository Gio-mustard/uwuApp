/**
 * @fileoverview main.jsx — Application entry point.
 *
 * Instantiates the concrete repository implementations and injects them
 * into the app via {SessionProvider}.
 *
 * To swap from mock repositories to production ones (e.g. Supabase, REST API),
 * only change the imports/factories here — no other files need to change.
 *
 * `taskRepositoryFactory` is a function `(user) => ITaskRepository` called by
 * {SessionProvider} after a successful login. This ensures each repository
 * instance is scoped to the authenticated user.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { MockAuthRepository } from './repositories/mock/MockAuthRepository';
import { MockTaskRepository } from './repositories/mock/MockTaskRepository';

// ── Instantiate auth repository (stateless, created once) ─────────────────────
const authRepository = new MockAuthRepository();

// ── Task repository factory (called per login with the authenticated user) ─────
// Swap for: (user) => new ApiTaskRepository(user) for production.
const taskRepositoryFactory = (user) => new MockTaskRepository(user);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App
      authRepository={authRepository}
      taskRepositoryFactory={taskRepositoryFactory}
    />
  </StrictMode>,
);
