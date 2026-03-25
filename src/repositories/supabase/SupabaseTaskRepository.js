/**
 * @fileoverview SupabaseTaskRepository — Concrete implementation of ITaskRepository.
 *
 * Connects to the normalized Supabase schema (Class Table Inheritance + user_weeks).
 * All write operations go through security-definer RPCs; reads go through
 * typed RPC functions that enforce RLS server-side.
 *
 * The active week is resolved internally on initialization. Use the static
 * factory method instead of the constructor directly:
 *
 * @example
 * const repo = await SupabaseTaskRepository.create(user);
 */

import { ITaskRepository } from '../ITaskRepository';
import { supabase } from '../../lib/supabaseClient';
import { createDailyTask } from '../../domain/models/DailyTask';
import { createWeeklyTask } from '../../domain/models/WeeklyTask';

export class SupabaseTaskRepository extends ITaskRepository {
  /**
   * @param {import('../domain/models/User').User} user
   * @param {{ id: string, week_id: string }} activeWeek - Resolved internally by create().
   */
  constructor(user, activeWeek) {
    super(user);

    /** @type {string} UUID of the active user_weeks row */
    this.userWeekId = activeWeek.id;

    /** @type {string} Human-readable identifier, e.g. "2025-W12" */
    this.weekId = activeWeek.week_id;
  }

  // ─── Factory ─────────────────────────────────────────────────────────────────

  /**
   * Resolves the active week from the DB and returns a ready-to-use repository.
   * This is the only intended way to instantiate this class.
   *
   * @param {import('../domain/models/User').User} user
   * @returns {Promise<SupabaseTaskRepository>}
   */
  static async create(user) {
    const { data, error } = await supabase
      .from('user_weeks')
      .select('id, week_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data)  throw new Error('No active week found for this user.');

    return new SupabaseTaskRepository(user, data);
  }

  // ─── Daily Tasks ────────────────────────────────────────────────────────────

  async getDailyTasks() {
    const { data, error } = await supabase.rpc('get_daily_tasks', {
      p_user_week_id: this.userWeekId,
    });

    if (error) throw new Error(error.message);

    return (data ?? []).map((t)=>(createDailyTask({
      id:            t.id,
      title:         t.title,
      description:   t.description   ?? null,
      suggestedTime: t.suggested_time ? t.suggested_time.substring(0, 5) : null,
      assignedDays:  t.assigned_days  ?? [],
      // Preserve the { [weekId]: day[] } domain shape.
      completions: t.completed_days.length > 0
        ? { [this.weekId]: t.completed_days }
        : {},
    })))
  }

  /**
   * @param {import('../domain/models/DailyTask').DailyTask} task
   */
  async addDailyTask(task) {
    const { data: newId, error } = await supabase.rpc('add_daily_task', {
      p_user_week_id:   this.userWeekId,
      p_title:          task.title,
      p_description:    task.description  ?? null,
      p_suggested_time: task.suggestedTime ?? null,
      p_assigned_days:  task.assignedDays,
      p_is_recurring:   task.isRecurring  ?? false,
    });

    if (error) throw new Error(error.message);
    return { ...task, id: newId };
  }

  /**
   * @param {string} id
   * @param {Partial<import('../domain/models/DailyTask').DailyTask>} updates
   */
  async updateDailyTask(id, updates) {
    const { error } = await supabase.rpc('update_daily_task', {
      p_task_id:        id,
      p_title:          updates.title         ?? null,
      p_description:    updates.description   ?? null,
      p_suggested_time: updates.suggestedTime ?? null,
      p_assigned_days:  updates.assignedDays  ?? null,
    });

    if (error) throw new Error(error.message);
    return { id, ...updates };
  }

  /**
   * @param {string} taskId
   * @param {string} _weekId - Ignored; the repo always uses the active week.
   * @param {number} day     - ISO day number (1 = Mon … 7 = Sun).
   */
  async completeDailyTask(taskId, _weekId, day) {
    const { error } = await supabase.rpc('complete_daily_task', {
      p_task_id:      taskId,
      p_user_week_id: this.userWeekId,
      p_day_id:       day,
    });

    // 23505 = unique_violation: user clicked twice before UI updated — safe to ignore.
    if (error && error.code !== '23505') throw new Error(error.message);
  }

  /**
   * @param {string} taskId
   * @param {string} _weekId
   * @param {number} day
   */
  async uncompleteDailyTask(taskId, _weekId, day) {
    const { error } = await supabase.rpc('uncomplete_daily_task', {
      p_task_id:      taskId,
      p_user_week_id: this.userWeekId,
      p_day_id:       day,
    });

    if (error) throw new Error(error.message);
  }

  // ─── Weekly Tasks ───────────────────────────────────────────────────────────

  async getWeeklyTasks() {
    const { data, error } = await supabase.rpc('get_weekly_tasks', {
      p_user_week_id: this.userWeekId,
    });

    if (error) throw new Error(error.message);

    return (data ?? []).map((t) => (createWeeklyTask({
      id:            t.id,
      title:         t.title,
      description:   t.description   ?? null,
      suggestedTime: t.suggested_time ? t.suggested_time.substring(0, 5) : null,
      requiredCount: t.required_count,
      // Preserve the { [weekId]: count } domain shape.
      completions: t.completed_count > 0
        ? { [this.weekId]: t.completed_count }
        : {},
    })));
  }

  /**
   * @param {import('../domain/models/WeeklyTask').WeeklyTask} task
   */
  async addWeeklyTask(task) {
    const { data: newId, error } = await supabase.rpc('add_weekly_task', {
      p_user_week_id:   this.userWeekId,
      p_title:          task.title,
      p_description:    task.description  ?? null,
      p_suggested_time: task.suggestedTime ?? null,
      p_required_count: task.requiredCount,
      p_is_recurring:   task.isRecurring  ?? false,

    });

    if (error) throw new Error(error.message);
    return { ...task, id: newId };
  }

  /**
   * @param {string} id
   * @param {Partial<import('../domain/models/WeeklyTask').WeeklyTask>} updates
   */
  async updateWeeklyTask(id, updates) {
    const { error } = await supabase.rpc('update_weekly_task', {
      p_task_id:        id,
      p_title:          updates.title         ?? null,
      p_description:    updates.description   ?? null,
      p_suggested_time: updates.suggestedTime ?? null,
      p_required_count: updates.requiredCount ?? null,
    });

    if (error) throw new Error(error.message);
    return { id, ...updates };
  }

  /**
   * @param {string} taskId
   * @param {string} _weekId - Ignored; the repo always uses the active week.
   */
  async completeWeeklyTask(taskId, _weekId) {
    const { error } = await supabase.rpc('complete_weekly_task', {
      p_task_id:      taskId,
      p_user_week_id: this.userWeekId,
    });

    if (error) throw new Error(error.message);
  }

  /**
   * @param {string} taskId
   * @param {string} _weekId - Ignored; the repo always uses the active week.
   */
  async uncompleteWeeklyTask(taskId, _weekId) {
    const { error } = await supabase.rpc('uncomplete_weekly_task', {
      p_task_id:      taskId,
      p_user_week_id: this.userWeekId,
    });

    if (error) throw new Error(error.message);
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  async deleteTask(id) {
    const { error } = await supabase.rpc('delete_task', {
      p_task_id: id,
    });

    if (error) throw new Error(error.message);
  }

  // ─── History ────────────────────────────────────────────────────────────────

  async getWeekHistory() {
    const { data, error } = await supabase.rpc('get_week_history');

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      weekId:         row.week_id,
      startDate:      row.start_date,
      endDate:        row.end_date,
      totalTasks:     row.total_tasks,
      completedTasks: row.completed_tasks,
      taskSnapshots:  row.snapshot_data,
    }));
  }

  /**
   * No-op: history is written atomically inside close_week() on the DB side.
   * Kept to satisfy the ITaskRepository contract.
   *
   * @param {import('../domain/models/WeekHistory').WeekHistory} _history
   */
  async saveWeekHistory(_history) {
    // Intentional no-op — see close_week() in Postgres.
  }
}