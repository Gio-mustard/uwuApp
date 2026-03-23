/**
 * @fileoverview WeekService — Business logic for week management.
 *
 * Split into two sections:
 *
 * 1. Pure helpers  — week ID generation, bounds, formatting,
 *    snapshot building. No side effects, no network calls.
 *
 * 2. Async operations — open/close week against Supabase, and the
 *    bootstrap function that wires everything together on app start.
 */

import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  format,
} from 'date-fns';
import { supabase } from '../lib/supabaseClient';
import { SupabaseTaskRepository } from '../repositories/supabase/SupabaseTaskRepository';
// ─── Pure Helpers  ────────────────────────────────────────────────

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
    end:   endOfISOWeek(date),
  };
}

/**
 * Formats a date range as a human-readable string in Spanish.
 * e.g. "26 mar - 1 abr"
 *
 * @param {string} startIso - ISO date string for the start of the week.
 * @param {string} endIso   - ISO date string for the end of the week.
 * @returns {string}
 */
export function formatWeekRange(startIso, endIso) {
  const start = new Date(startIso);
  const end   = new Date(endIso);
  const fmtDay   = (d) => format(d, 'd');
  const fmtMonth = (d) =>
    d.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  return `${fmtDay(start)} ${fmtMonth(start)} - ${fmtDay(end)} ${fmtMonth(end)}`;
}

/**
 * Determines whether a new week has started compared to a previously stored weekId.
 *
 * @param {string} storedWeekId - The weekId stored from the last app open.
 * @param {Date}   now          - The current date.
 * @returns {boolean}
 */
export function isNewWeek(storedWeekId, now) {
  return getWeekId(now) !== storedWeekId;
}

/**
 * Parses a weekId string back into the Monday–Sunday bounds of that week.
 *
 * @param {string} weekId - e.g. "2024-W12"
 * @returns {{ start: Date, end: Date }}
 */
export function getWeekBoundsFromId(weekId) {
  const [yearStr, wStr] = weekId.split('-W');
  const year  = parseInt(yearStr, 10);
  const week  = parseInt(wStr, 10);
  const jan4  = new Date(year, 0, 4);
  const startOfWeek1 = startOfISOWeek(jan4);
  const start = new Date(startOfWeek1);
  start.setDate(start.getDate() + (week - 1) * 7);
  return { start, end: endOfISOWeek(start) };
}

/**
 * Builds the current week's snapshot from the task lists.
 * Used by closeWeek() before persisting to week_history.
 *
 * @param {import('../domain/models/DailyTask').DailyTask[]}   dailyTasks
 * @param {import('../domain/models/WeeklyTask').WeeklyTask[]} weeklyTasks
 * @param {string} weekId
 * @returns {import('../domain/models/WeekHistory').WeekHistory}
 */
export function buildWeekHistorySnapshot(dailyTasks, weeklyTasks, weekId) {
  const { start, end } = getWeekBoundsFromId(weekId);
  const snapshots = [];

  for (const task of dailyTasks) {
    const doneCount = (task.completions[weekId] ?? []).length;
    const required  = task.assignedDays.length;
    snapshots.push({
      taskId:         task.id,
      title:          task.title,
      type:           'daily',
      completed:      doneCount >= required,
      completedCount: doneCount,
      requiredCount:  required,
    });
  }

  for (const task of weeklyTasks) {
    const doneCount = task.completions[weekId] ?? 0;
    snapshots.push({
      taskId:         task.id,
      title:          task.title,
      type:           'weekly',
      completed:      doneCount >= task.requiredCount,
      completedCount: doneCount,
      requiredCount:  task.requiredCount,
    });
  }

  const completedTasks = snapshots.filter((s) => s.completed).length;

  return {
    weekId,
    startDate:     start.toISOString(),
    endDate:       end.toISOString(),
    totalTasks:    snapshots.length,
    completedTasks,
    taskSnapshots: snapshots,
  };
}

// ─── Async Operations ────────────────────────────────────────────────────────

/**
 * Creates a new active week in the DB for the given user.
 * Throws if an active week already exists (guard is enforced by the RPC).
 *
 * @param {string} userId
 * @param {Date}   [now=new Date()]
 * @returns {Promise<{ id: string, week_id: string, start_date: string, end_date: string }>}
 */
export async function openWeek(userId, now = new Date()) {
  const weekId        = getWeekId(now);
  const { start, end } = getWeekBounds(now);

  const { data: newId, error } = await supabase.rpc('open_week', {
    p_week_id:    weekId,
    p_start_date: format(start, 'yyyy-MM-dd'),
    p_end_date:   format(end,   'yyyy-MM-dd'),
  });

  if (error) throw new Error(error.message);

  return {
    id:         newId,
    week_id:    weekId,
    start_date: start.toISOString(),
    end_date:   end.toISOString(),
  };
}

/**
 * Closes the current active week and archives it to week_history.
 * The snapshot is built client-side from the live task lists so the
 * close_week() RPC receives a consistent, already-computed picture.
 *
 * @param {SupabaseTaskRepository} repo - The repository bound to the expiring week.
 * @returns {Promise<void>}
 */
export async function closeWeek(repo) {
  const [dailyTasks, weeklyTasks] = await Promise.all([
    repo.getDailyTasks(),
    repo.getWeeklyTasks(),
  ]);

  // Snapshot is built here so the UI can optionally display it before committing.
  const _snapshot = buildWeekHistorySnapshot(dailyTasks, weeklyTasks, repo.weekId);

  const { error } = await supabase.rpc('close_week', {
    p_user_week_id: repo.userWeekId,
  });

  if (error) throw new Error(error.message);
}

/**
 * Bootstraps the repository on every app start.
 *
 * Resolution order:
 *  1. Active week exists and is current      → return repo as-is.
 *  2. Active week exists but is stale        → close it, open a new one, return fresh repo.
 *  3. No active week at all                  → open one, return fresh repo.
 *
 * This is the single entry point your app initialization should call.
 * Re-call it after the user explicitly triggers a week reset if needed.
 *
 * @param {import('../domain/models/User').User} user
 * @param {Date} [now=new Date()]
 * @returns {Promise<SupabaseTaskRepository>}
 */
export async function bootstrapWeek(user, now = new Date()) {
  const { data: weeks, error } = await supabase
    .from('user_weeks')
    .select('id, week_id, end_date, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'next']);

  if (error) throw new Error(error.message);

  const activeWeek = weeks.find((w) => w.status === 'active');
  const nextWeek   = weeks.find((w) => w.status === 'next');

  // ── Case 3: sin semana activa → abrir desde cero ─────────────────────────
  if (!activeWeek) {
    const newWeek = await openWeek(user.id, now);
    return new SupabaseTaskRepository(user, newWeek);
  }

  // ── Case 1: current week ───────────────────────────────
  if (!isNewWeek(activeWeek.week_id, now)) {
    return new SupabaseTaskRepository(user, activeWeek);
  }

  // ── Case 2a: semana vencida + existe 'next' → promover ───────────────────
  if (nextWeek) {
    const { data: promotedId, error: promoteError } = await supabase
      .rpc('promote_next_week', { p_current_week_id: activeWeek.id });

    if (promoteError) throw new Error(promoteError.message);

    return new SupabaseTaskRepository(user, {
      id:      promotedId,
      week_id: nextWeek.week_id,
    });
  }

  // ── Case 2b: semana vencida, sin 'next' → cerrar y abrir normal ──────────
  const staleRepo = new SupabaseTaskRepository(user, activeWeek);
  await closeWeek(staleRepo);

  const newWeek = await openWeek(user.id, now);
  return new SupabaseTaskRepository(user, newWeek);
}

/**
 * Opens the next week and seeds it with recurring tasks from the active week.
 * Call this when the user navigates to the "next week" view for the first time.
 *
 * @param {SupabaseTaskRepository} activeRepo - The current active week repo.
 * @returns {Promise<SupabaseTaskRepository>} A repo scoped to the next week.
 */
export async function openNextWeek(activeRepo) {
  const now          = new Date();
  const nextMonday   = new Date(now);
  nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7 || 7);

  const nextWeekId        = getWeekId(nextMonday);
  const { start, end }    = getWeekBounds(nextMonday);

  // Check if next week already exists (user navigated back and forth)
  const { data: existing } = await supabase
    .from('user_weeks')
    .select('id, week_id')
    .eq('user_id', activeRepo.user.id)
    .eq('status', 'next')
    .maybeSingle();

  if (existing) {
    return new SupabaseTaskRepository(activeRepo.user, {
      id:      existing.id,
      week_id: existing.week_id,
    });
  }

  const { data: newId, error } = await supabase.rpc('open_next_week', {
    p_week_id:    nextWeekId,
    p_start_date: format(start, 'yyyy-MM-dd'),
    p_end_date:   format(end,   'yyyy-MM-dd'),
  });

  if (error) throw new Error(error.message);

  return new SupabaseTaskRepository(activeRepo.user, {
    id:      newId,
    week_id: nextWeekId,
  });
}