/**
 * @fileoverview WeekService — Business logic for week management.
 *
 * Provides pure, framework-agnostic functions for:
 * - Generating week identifiers ("YYYY-WNN")
 * - Computing the Monday–Sunday bounds of any week
 * - Detecting new-week boundaries for reset logic
 */

import { getISOWeek, getISOWeekYear, startOfISOWeek, endOfISOWeek, format } from 'date-fns';

/**
 * Returns a stable week identifier string for a given date.
 * Format: "YYYY-WNN" where NN is the ISO week number (zero-padded).
 *
 * @param {Date} date
 * @returns {string}  e.g. "2024-W12"
 */
export function getWeekId(date) {
  const year = getISOWeekYear(date);
  const week = getISOWeek(date);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Returns the Monday and Sunday Date objects for the ISO week containing `date`.
 *
 * @param {Date} date
 * @returns {{ start: Date, end: Date }}
 */
export function getWeekBounds(date) {
  return {
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
  };
}

/**
 * Formats a date range as a human-readable string in Spanish.
 * e.g. "26 mar - 1 feb"
 *
 * @param {string} startIso - ISO date string for the start of the week.
 * @param {string} endIso   - ISO date string for the end of the week.
 * @returns {string}
 */
export function formatWeekRange(startIso, endIso) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmtDay = (d) => format(d, 'd');
  const fmtMonth = (d) =>
    d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  return `${fmtDay(start)} ${fmtMonth(start)} - ${fmtDay(end)} ${fmtMonth(end)}`;
}

/**
 * Determines whether a new week has started compared to a previously stored weekId.
 *
 * @param {string} storedWeekId  - The weekId stored from the last app open.
 * @param {Date}   now           - The current date.
 * @returns {boolean}
 */
export function isNewWeek(storedWeekId, now) {
  return getWeekId(now) !== storedWeekId;
}

/**
 * Builds the current week's snapshot from the task lists.
 * This is used when saving a completed week to history.
 *
 * @param {import('../domain/models/DailyTask').DailyTask[]}  dailyTasks
 * @param {import('../domain/models/WeeklyTask').WeeklyTask[]} weeklyTasks
 * @param {string} weekId
 * @returns {import('../domain/models/WeekHistory').WeekHistory}
 */
export function buildWeekHistorySnapshot(dailyTasks, weeklyTasks, weekId) {
  const { start, end } = getWeekBoundsFromId(weekId);
  const snapshots = [];

  for (const task of dailyTasks) {
    const doneCount = (task.completions[weekId] ?? []).length;
    const required = task.assignedDays.length;
    snapshots.push({
      taskId: task.id,
      title: task.title,
      type: 'daily',
      completed: doneCount >= required,
      completedCount: doneCount,
      requiredCount: required,
    });
  }

  for (const task of weeklyTasks) {
    const doneCount = task.completions[weekId] ?? 0;
    snapshots.push({
      taskId: task.id,
      title: task.title,
      type: 'weekly',
      completed: doneCount >= task.requiredCount,
      completedCount: doneCount,
      requiredCount: task.requiredCount,
    });
  }

  const completedTasks = snapshots.filter((s) => s.completed).length;

  return {
    weekId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalTasks: snapshots.length,
    completedTasks,
    taskSnapshots: snapshots,
  };
}

/**
 * Parses a weekId string back into a Date for any Monday of that week.
 * @param {string} weekId - e.g. "2024-W12"
 * @returns {{ start: Date, end: Date }}
 */
export function getWeekBoundsFromId(weekId) {
  // Parse "YYYY-WNN"
  const [yearStr, wStr] = weekId.split('-W');
  const year = parseInt(yearStr, 10);
  const week = parseInt(wStr, 10);
  // Jan 4th is always in week 1
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = startOfISOWeek(jan4);
  const start = new Date(startOfWeek1);
  start.setDate(start.getDate() + (week - 1) * 7);
  return { start, end: endOfISOWeek(start) };
}
