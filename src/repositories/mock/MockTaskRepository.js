/**
 * @fileoverview MockTaskRepository — Development implementation of ITaskRepository.
 *
 * Uses an in-memory store (seeded with example tasks) and persists state to
 * localStorage so that data survives page refreshes during development.
 * Replace with ApiTaskRepository or similar once a real backend is available.
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
const STORAGE_KEY_DAILY = 'uwu_daily_tasks';
const STORAGE_KEY_WEEKLY = 'uwu_weekly_tasks';
const STORAGE_KEY_HISTORY = 'uwu_week_history';

function delay(ms = MOCK_DELAY) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Seed data for a fresh installation. */
function buildSeedData() {
  const weekId = getWeekId(new Date());

  const daily = [
    createDailyTask({
      id: 'dt-001',
      title: 'Tomar 2L de ácido',
      description: 'Mantenerse hidratado durante todo el día.',
      suggestedTime: '13:00',
      assignedDays: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                     DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
      completions: { [weekId]: [] },
    }),
  ];

  const weekly = [
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

  /** Build a past week example for the history page. */
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
        { taskId: 'wt-001', title: 'Lavar carro', type: 'weekly', completed: true,  completedCount: 3, requiredCount: 3 },
        { taskId: 'wt-002', title: 'Ver película', type: 'weekly', completed: true,  completedCount: 1, requiredCount: 1 },
        { taskId: 'wt-003', title: 'Estudiar',    type: 'weekly', completed: true,  completedCount: 2, requiredCount: 2 },
        { taskId: 'dt-001', title: 'Tomar 2L de ácido', type: 'daily', completed: true, completedCount: 7, requiredCount: 7 },
        { taskId: 'dt-002', title: 'Comer',        type: 'daily', completed: false, completedCount: 5, requiredCount: 7 },
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

  constructor() {
    super();
    const rawDaily = localStorage.getItem(STORAGE_KEY_DAILY);
    const rawWeekly = localStorage.getItem(STORAGE_KEY_WEEKLY);
    const rawHistory = localStorage.getItem(STORAGE_KEY_HISTORY);

    if (rawDaily && rawWeekly && rawHistory) {
      this.#dailyTasks = JSON.parse(rawDaily);
      this.#weeklyTasks = JSON.parse(rawWeekly);
      this.#history = JSON.parse(rawHistory);
    } else {
      const seed = buildSeedData();
      this.#dailyTasks = seed.daily;
      this.#weeklyTasks = seed.weekly;
      this.#history = seed.history;
      this.#persist();
    }
  }

  /** Writes the current state to localStorage. */
  #persist() {
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(this.#dailyTasks));
    localStorage.setItem(STORAGE_KEY_WEEKLY, JSON.stringify(this.#weeklyTasks));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(this.#history));
  }

  // ─── Daily Tasks ────────────────────────────────────────────────────────────

  /** @override */
  async getDailyTasks() {
    await delay();
    return [...this.#dailyTasks];
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
    const task = this.#dailyTasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`DailyTask "${taskId}" not found.`);
    if (!task.completions[weekId]) task.completions[weekId] = [];
    if (!task.completions[weekId].includes(day)) {
      task.completions[weekId].push(day);
    }
    this.#persist();
  }

  /** @override */
  async uncompleteDailyTask(taskId, weekId, day) {
    await delay();
    const task = this.#dailyTasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`DailyTask "${taskId}" not found.`);
    if (task.completions[weekId]) {
      task.completions[weekId] = task.completions[weekId].filter((d) => d !== day);
    }
    this.#persist();
  }

  // ─── Weekly Tasks ───────────────────────────────────────────────────────────

  /** @override */
  async getWeeklyTasks() {
    await delay();
    return [...this.#weeklyTasks];
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
    const task = this.#weeklyTasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`WeeklyTask "${taskId}" not found.`);
    task.completions[weekId] = (task.completions[weekId] ?? 0) + 1;
    this.#persist();
  }

  /** @override */
  async uncompleteWeeklyTask(taskId, weekId) {
    await delay();
    const task = this.#weeklyTasks.find((t) => t.id === taskId);
    if (!task) throw new Error(`WeeklyTask "${taskId}" not found.`);
    task.completions[weekId] = Math.max(0, (task.completions[weekId] ?? 0) - 1);
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
