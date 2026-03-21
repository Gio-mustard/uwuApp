/**
 * @fileoverview MockAuthRepository — Development implementation of IAuthRepository.
 *
 * Simulates authentication using an in-memory store seeded with one test user.
 * No network calls are made. This class is intended ONLY for the development
 * stage; replace it with a real implementation (e.g. SupabaseAuthRepository)
 * once a backend is available.
 *
 * @extends {IAuthRepository}
 */

import { IAuthRepository } from '../IAuthRepository';
import { createUser } from '../../domain/models/User';
import { v4 as uuidv4 } from 'uuid';

/** Simulated network delay in milliseconds. */
const MOCK_DELAY = 300;

/** @type {Map<string, {user: import('../../domain/models/User').User, password: string}>} */
const USER_STORE = new Map([
  [
    'giomus@uwu.app',
    {
      user: createUser({
        id: 'user-001',
        email: 'giomus@uwu.app',
        displayName: 'Giomus',
        username: '@giomus',
        avatarUrl: null,
      }),
      password: '123456',
    },
  ],
]);

/** Simulates async latency. */
function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAuthRepository extends IAuthRepository {
  /** @type {import('../../domain/models/User').User | null} */
  #currentUser = null;

  constructor() {
    super();
    // Restore session from localStorage if available.
    const saved = localStorage.getItem('uwu_mock_user');
    if (saved) {
      this.#currentUser = JSON.parse(saved);
    }
  }

  /** @override */
  async login(email, password) {
    await delay();
    const entry = USER_STORE.get(email.toLowerCase());
    if (!entry || entry.password !== password) {
      throw new Error('Invalid email or password.');
    }
    this.#currentUser = entry.user;
    localStorage.setItem('uwu_mock_user', JSON.stringify(this.#currentUser));
    return this.#currentUser;
  }

  /** @override */
  async register(email, password, displayName) {
    await delay();
    const key = email.toLowerCase();
    if (USER_STORE.has(key)) {
      throw new Error('An account with this email already exists.');
    }
    const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;
    const user = createUser({ id: uuidv4(), email, displayName, username: handle });
    USER_STORE.set(key, { user, password });
    this.#currentUser = user;
    localStorage.setItem('uwu_mock_user', JSON.stringify(this.#currentUser));
    return user;
  }

  /** @override */
  async logout() {
    await delay(100);
    this.#currentUser = null;
    localStorage.removeItem('uwu_mock_user');
    localStorage.removeItem('uwu_daily_tasks');
    localStorage.removeItem('uwu_week_history');
    localStorage.removeItem('uwu_weekly_tasks');
    
  }

  /** @override */
  async getCurrentUser() {
    await delay(100);
    return this.#currentUser;
  }
}
