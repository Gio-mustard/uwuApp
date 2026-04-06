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

import { StrictMode, use } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App';
import { SupabaseAuthRepository } from './repositories/supabase/SupabaseAuthRepository';
import { SupabaseTaskRepository } from './repositories/supabase/SupabaseTaskRepository';
import { SupabaseNoteRepository } from './repositories/supabase/SupabaseNoteRepository';
import { bootstrapWeek } from './services/WeekService';

// ── Instantiate auth repository (stateless, created once) ─────────────────────
const authRepository = new SupabaseAuthRepository();

// ── Task repository factory (called per login with the authenticated user) ─────
const taskRepositoryFactory = (user) => bootstrapWeek(user);

// ── Note repository factory ────────────────────────────────────────────────────
const noteRepositoryFactory = (user) => new SupabaseNoteRepository(user);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App
      authRepository={authRepository}
      taskRepositoryFactory={taskRepositoryFactory}
      noteRepositoryFactory={noteRepositoryFactory}
    />
  </StrictMode>,
);
