/**
 * @fileoverview MockTaskRepository — Development implementation of ITaskRepository.
 *
 * All data is scoped to the authenticated user via localStorage keys that
 * include `user.id`. This ensures two different users on the same device
 * cannot access each other's tasks.
 *
 * Keys used:
 *   - `uwu_{user.id}_daily`
 *   - `uwu_{user.id}_weekly`
 *   - `uwu_{user.id}_history`
 *
 * @extends {ITaskRepository}
 */

import { ITaskRepository } from '../ITaskRepository';
import { createDailyTask } from '../../domain/models/DailyTask';
import { createWeeklyTask } from '../../domain/models/WeeklyTask';
import { createWeekHistory } from '../../domain/models/WeekHistory';
import { DayOfWeek } from '../../domain/enums/DayOfWeek';
import { getWeekId, getWeekBounds } from '../../services/WeekService';

const MOCK_DELAY = 250;

/** @param {number} ms */
function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Builds user-scoped localStorage key names. */
function buildKeys(userId) {
  return {
    daily:   `uwu_${userId}_daily`,
    weekly:  `uwu_${userId}_weekly`,
    history: `uwu_${userId}_history`,
  };
}

/**
 * Builds seed data for a first-time user.
 * @param {string} weekId
 * @returns {{ daily: DailyTask[], weekly: WeeklyTask[], history: WeekHistory[] }}
 */
function buildSeedData(weekId) {
  let daily = [
    createDailyTask({
      id: 'dt-001',
      title: 'Tomar 2L de ácido',
      description: 'Mantenerse hidratado durante todo el día.',
      suggestedTime: '13:00',
      assignedDays: [
        DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY,
      ],
      completions: { [weekId]: [] },
    }),
  ];
  daily = []

  let weekly = [
    createWeeklyTask({
      id: 'wt-001',
      title: 'Lavar carro',
      description: 'Lavar y aspirar el interior.',
      suggestedTime: '18:30',
      requiredCount: 3,
      completions: { [weekId]: 0 },
    }),
    createWeeklyTask({
      id: 'wt-002',
      title: 'Estudiar',
      description: 'Sesiones de estudio para el proyecto principal.',
      suggestedTime: null,
      requiredCount: 2,
      completions: { [weekId]: 0 },
    }),
    createWeeklyTask({
      id: 'wt-003',
      title: 'Ver una película',
      description: null,
      suggestedTime: null,
      requiredCount: 1,
      completions: { [weekId]: 0 },
    }),
  ];
  weekly = []

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);
  const pastWeekId = getWeekId(pastDate);
  const { start, end } = getWeekBounds(pastDate);

  const history = [
    createWeekHistory({
      weekId: pastWeekId,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      totalTasks: 5,
      completedTasks: 4,
      taskSnapshots: [
        { taskId: 'wt-001', title: 'Lavar carro',       type: 'weekly', completed: true,  completedCount: 3, requiredCount: 3 },
        { taskId: 'wt-002', title: 'Ver película',       type: 'weekly', completed: true,  completedCount: 1, requiredCount: 1 },
        { taskId: 'wt-003', title: 'Estudiar',           type: 'weekly', completed: true,  completedCount: 2, requiredCount: 2 },
        { taskId: 'dt-001', title: 'Tomar 2L de ácido',  type: 'daily',  completed: true,  completedCount: 7, requiredCount: 7 },
        { taskId: 'dt-002', title: 'Comer',              type: 'daily',  completed: false, completedCount: 5, requiredCount: 7 },
      ],
    }),
  ];

  return { daily, weekly, history };
}

export class MockTaskRepository extends ITaskRepository {
  /** @type {import('../../domain/models/DailyTask').DailyTask[]} */
  #dailyTasks;
  /** @type {import('../../domain/models/WeeklyTask').WeeklyTask[]} */
  #weeklyTasks;
  /** @type {import('../../domain/models/WeekHistory').WeekHistory[]} */
  #history;
  /** @type {{ daily: string, weekly: string, history: string }} */
  #keys;

  /**
   * @param {import('../../domain/models/User').User} user - The authenticated user.
   *   All data is stored under keys scoped to `user.id`.
   */
  constructor(user) {
    super(user); // Stores this.user and validates the user object.
    this.#keys = buildKeys(user.id);

    const rawDaily   = localStorage.getItem(this.#keys.daily);
    const rawWeekly  = localStorage.getItem(this.#keys.weekly);
    const rawHistory = localStorage.getItem(this.#keys.history);

    if (rawDaily && rawWeekly && rawHistory) {
      this.#dailyTasks  = JSON.parse(rawDaily);
      this.#weeklyTasks = JSON.parse(rawWeekly);
      this.#history     = JSON.parse(rawHistory);
    } else {
      const seed = buildSeedData(getWeekId(new Date()));
      this.#dailyTasks  = seed.daily;
      this.#weeklyTasks = seed.weekly;
      this.#history     = seed.history;
      this.#persist();
    }
  }

  /** Writes the current state to user-scoped localStorage keys. */
  #persist() {
    localStorage.setItem(this.#keys.daily,   JSON.stringify(this.#dailyTasks));
    localStorage.setItem(this.#keys.weekly,  JSON.stringify(this.#weeklyTasks));
    localStorage.setItem(this.#keys.history, JSON.stringify(this.#history));
  }

  // ─── Daily Tasks ────────────────────────────────────────────────────────────

  /** @override */
  async getDailyTasks() {
    await delay();
    // Return deep-enough copies so React state holds independent objects.
    return this.#dailyTasks.map((t) => ({ ...t, completions: { ...t.completions } }));
  }

  /** @override */
  async addDailyTask(task) {
    await delay();
    this.#dailyTasks.push(task);
    this.#persist();
    return task;
  }

  /** @override */
  async updateDailyTask(id, updates) {
    await delay();
    const idx = this.#dailyTasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`DailyTask with id "${id}" not found.`);
    this.#dailyTasks[idx] = { ...this.#dailyTasks[idx], ...updates };
    this.#persist();
    return this.#dailyTasks[idx];
  }

  /** @override */
  async completeDailyTask(taskId, weekId, day) {
    await delay();
    const idx = this.#dailyTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`DailyTask "${taskId}" not found.`);
    const task = this.#dailyTasks[idx];
    const days = task.completions[weekId] ?? [];
    if (!days.includes(day)) {
      // Create a new object — never mutate in place.
      this.#dailyTasks[idx] = {
        ...task,
        completions: { ...task.completions, [weekId]: [...days, day] },
      };
    }
    this.#persist();
  }

  /** @override */
  async uncompleteDailyTask(taskId, weekId, day) {
    await delay();
    const idx = this.#dailyTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`DailyTask "${taskId}" not found.`);
    const task = this.#dailyTasks[idx];
    const days = task.completions[weekId] ?? [];
    this.#dailyTasks[idx] = {
      ...task,
      completions: { ...task.completions, [weekId]: days.filter((d) => d !== day) },
    };
    this.#persist();
  }

  // ─── Weekly Tasks ───────────────────────────────────────────────────────────

  /** @override */
  async getWeeklyTasks() {
    await delay();
    // Return deep-enough copies so React state holds independent objects.
    return this.#weeklyTasks.map((t) => ({ ...t, completions: { ...t.completions } }));
  }

  /** @override */
  async addWeeklyTask(task) {
    await delay();
    this.#weeklyTasks.push(task);
    this.#persist();
    return task;
  }

  /** @override */
  async updateWeeklyTask(id, updates) {
    await delay();
    const idx = this.#weeklyTasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`WeeklyTask with id "${id}" not found.`);
    this.#weeklyTasks[idx] = { ...this.#weeklyTasks[idx], ...updates };
    this.#persist();
    return this.#weeklyTasks[idx];
  }

  /** @override */
  async completeWeeklyTask(taskId, weekId) {
    await delay();
    const idx = this.#weeklyTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`WeeklyTask "${taskId}" not found.`);
    const task = this.#weeklyTasks[idx];
    // Create a new object — never mutate in place so React state stays independent.
    this.#weeklyTasks[idx] = {
      ...task,
      completions: { ...task.completions, [weekId]: (task.completions[weekId] ?? 0) + 1 },
    };
    this.#persist();
  }

  /** @override */
  async uncompleteWeeklyTask(taskId, weekId) {
    await delay();
    const idx = this.#weeklyTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) throw new Error(`WeeklyTask "${taskId}" not found.`);
    const task = this.#weeklyTasks[idx];
    this.#weeklyTasks[idx] = {
      ...task,
      completions: { ...task.completions, [weekId]: Math.max(0, (task.completions[weekId] ?? 0) - 1) },
    };
    this.#persist();
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  /** @override */
  async deleteTask(id) {
    await delay();
    this.#dailyTasks = this.#dailyTasks.filter((t) => t.id !== id);
    this.#weeklyTasks = this.#weeklyTasks.filter((t) => t.id !== id);
    this.#persist();
  }

  // ─── History ────────────────────────────────────────────────────────────────

  /** @override */
  async getWeekHistory() {
    await delay();
    return [...this.#history].sort((a, b) => (a.weekId < b.weekId ? 1 : -1));
  }

  /** @override */
  async saveWeekHistory(history) {
    await delay();
    const idx = this.#history.findIndex((h) => h.weekId === history.weekId);
    if (idx >= 0) {
      this.#history[idx] = history;
    } else {
      this.#history.push(history);
    }
    this.#persist();
  }
}
