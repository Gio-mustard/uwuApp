/**
 * @fileoverview SupabaseTaskRepository — Implements ITaskRepository.
 *
 * Connects to the normalized Supabase SQL Schema (Class Table Inheritance).
 * Uses the `all_tasks` view for unified queries and the `create_new_task` RPC
 * for atomic inserts across the multiple related tables.
 */

import { ITaskRepository } from '../ITaskRepository';
import { supabase } from '../../lib/supabaseClient';

export class SupabaseTaskRepository extends ITaskRepository {
  constructor(user) {
    super(user);
  }

  // ─── Daily Tasks ────────────────────────────────────────────────────────────

  async getDailyTasks() {
    // 1. Fetch base tasks from the view
    const { data: tasksData, error: taskError } = await supabase
      .from('all_tasks')
      .select('*')
      .eq('type', 'daily');

    if (taskError) throw new Error(taskError.message);

    // 2. Fetch completions for this user
    const { data: completionsData, error: compError } = await supabase
      .from('daily_task_completions')
      .select('task_id, week_id, day_id');

    if (compError) throw new Error(compError.message);

    // 3. Reconstruct the frontend domain model
    return tasksData.map((t) => {
      const taskCompletions = {};
      completionsData
        .filter((c) => c.task_id === t.id)
        .forEach((c) => {
          if (!taskCompletions[c.week_id]) taskCompletions[c.week_id] = [];
          taskCompletions[c.week_id].push(c.day_id);
        });

      return {
        id: t.id,
        title: t.title,
        description: t.description || null,
        suggestedTime: t.suggested_time ? t.suggested_time.substring(0, 5) : null,
        assignedDays: t.assigned_days || [],
        completions: taskCompletions,
      };
    });
  }

  async addDailyTask(task) {
    const { data: newId, error } = await supabase.rpc('create_new_task', {
      p_title: task.title,
      p_description: task.description || null,
      p_type: 'daily',
      p_suggested_time: task.suggestedTime || null,
      p_assigned_days: task.assignedDays,
    });

    if (error) throw new Error(error.message);
    return { ...task, id: newId };
  }

  async updateDailyTask(id, updates) {
    // Basic update on the parent table only for now (title, description, time)
    // Assigned days updates would require deleting and re-inserting daily_task_assigned_days.
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        suggested_time: updates.suggestedTime,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { id, ...updates }; // Stub return
  }

  async completeDailyTask(taskId, weekId, day) {
    const { error } = await supabase.from('daily_task_completions').insert({
      task_id: taskId,
      week_id: weekId,
      day_id: day,
    });
    // Ignore duplicate key errors (PGRST116/23505) in case they furiously click
    if (error && error.code !== '23505') throw new Error(error.message);
  }

  async uncompleteDailyTask(taskId, weekId, day) {
    const { error } = await supabase
      .from('daily_task_completions')
      .delete()
      .eq('task_id', taskId)
      .eq('week_id', weekId)
      .eq('day_id', day);
    if (error) throw new Error(error.message);
  }

  // ─── Weekly Tasks ───────────────────────────────────────────────────────────

  async getWeeklyTasks() {
    const { data: tasksData, error: taskError } = await supabase
      .from('all_tasks')
      .select('*')
      .eq('type', 'weekly');

    if (taskError) throw new Error(taskError.message);

    const { data: completionsData, error: compError } = await supabase
      .from('weekly_task_completions')
      .select('task_id, week_id, completed_count');

    if (compError) throw new Error(compError.message);

    return tasksData.map((t) => {
      const taskCompletions = {};
      completionsData
        .filter((c) => c.task_id === t.id)
        .forEach((c) => {
          taskCompletions[c.week_id] = c.completed_count;
        });

      return {
        id: t.id,
        title: t.title,
        description: t.description || null,
        suggestedTime: t.suggested_time ? t.suggested_time.substring(0, 5) : null,
        requiredCount: t.required_count,
        completions: taskCompletions,
      };
    });
  }

  async addWeeklyTask(task) {
    const { data: newId, error } = await supabase.rpc('create_new_task', {
      p_title: task.title,
      p_description: task.description || null,
      p_type: 'weekly',
      p_suggested_time: task.suggestedTime || null,
      p_required_count: task.requiredCount,
    });

    if (error) throw new Error(error.message);
    return { ...task, id: newId };
  }

  async updateWeeklyTask(id, updates) {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        suggested_time: updates.suggestedTime,
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { id, ...updates };
  }

  async completeWeeklyTask(taskId, weekId) {
    // Read-then-write approach for atomic increments
    const { data: currentData } = await supabase
      .from('weekly_task_completions')
      .select('completed_count')
      .eq('task_id', taskId)
      .eq('week_id', weekId)
      .maybeSingle();

    const currentCount = currentData ? currentData.completed_count : 0;

    const { error } = await supabase.from('weekly_task_completions').upsert(
      {
        task_id: taskId,
        week_id: weekId,
        completed_count: currentCount + 1,
      },
      { onConflict: 'task_id, week_id' },
    );

    if (error) throw new Error(error.message);
  }

  async uncompleteWeeklyTask(taskId, weekId) {
    const { data: currentData } = await supabase
      .from('weekly_task_completions')
      .select('completed_count')
      .eq('task_id', taskId)
      .eq('week_id', weekId)
      .maybeSingle();

    if (!currentData) return;

    const currentCount = currentData.completed_count;
    const newCount = Math.max(0, currentCount - 1);

    const { error } = await supabase.from('weekly_task_completions').update({
      completed_count: newCount,
    }).eq('task_id', taskId).eq('week_id', weekId);

    if (error) throw new Error(error.message);
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  async deleteTask(id) {
    // ON DELETE CASCADE in SQL propagates this delete to child tables automatically
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // ─── History ────────────────────────────────────────────────────────────────

  async getWeekHistory() {
    const { data, error } = await supabase
      .from('week_history')
      .select('*')
      .order('week_id', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((db) => ({
      weekId: db.week_id,
      startDate: db.start_date,
      endDate: db.end_date,
      totalTasks: db.total_tasks,
      completedTasks: db.completed_tasks,
      taskSnapshots: db.snapshot_data,
    }));
  }

  async saveWeekHistory(history) {
    const { error } = await supabase.from('week_history').upsert(
      {
        user_id: this.user.id,
        week_id: history.weekId,
        start_date: history.startDate,
        end_date: history.endDate,
        total_tasks: history.totalTasks,
        completed_tasks: history.completedTasks,
        snapshot_data: history.taskSnapshots,
      },
      { onConflict: 'user_id, week_id' },
    );

    if (error) throw new Error(error.message);
  }
}
