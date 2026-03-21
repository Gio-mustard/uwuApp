/**
 * @fileoverview TaskService — Business logic for task operations.
 *
 * Pure helper functions that determine task completion state and
 * filter tasks by day. Keeps this logic out of components and contexts.
 */

/**
 * Returns whether a daily task can be interacted with on the given day.
 * A daily task's checkbox is only active on the day it is assigned AND
 * that day matches today.
 *
 * @param {import('../domain/models/DailyTask').DailyTask} task
 * @param {number} selectedDay - ISO day currently selected in the UI (1–7).
 * @param {number} todayDay    - ISO day of today (1–7).
 * @returns {boolean}
 */
export function isDailyTaskInteractable(task, selectedDay, todayDay) {
  return (
    task.assignedDays.includes(selectedDay) && selectedDay === todayDay
  );
}

/**
 * Returns whether a daily task is completed on the given day for a given week.
 *
 * @param {import('../domain/models/DailyTask').DailyTask} task
 * @param {string} weekId
 * @param {number} day
 * @returns {boolean}
 */
export function isDailyTaskDoneOnDay(task, weekId, day) {
  return (task.completions[weekId] ?? []).includes(day);
}

/**
 * Returns whether a weekly task has met its required completion count.
 *
 * @param {import('../domain/models/WeeklyTask').WeeklyTask} task
 * @param {string} weekId
 * @returns {boolean}
 */
export function isWeeklyTaskComplete(task, weekId) {
  return (task.completions[weekId] ?? 0) >= task.requiredCount;
}

/**
 * Returns the number of times a weekly task has been completed this week.
 *
 * @param {import('../domain/models/WeeklyTask').WeeklyTask} task
 * @param {string} weekId
 * @returns {number}
 */
export function getWeeklyTaskCount(task, weekId) {
  return task.completions[weekId] ?? 0;
}

/**
 * Filters daily tasks to only those assigned to a specific day.
 *
 * @param {import('../domain/models/DailyTask').DailyTask[]} tasks
 * @param {number} day - ISO day number (1–7).
 * @returns {import('../domain/models/DailyTask').DailyTask[]}
 */
export function getDailyTasksForDay(tasks, day) {
  return tasks.filter((t) => t.assignedDays.includes(day));
}

/**
 * Finds the next upcoming task by suggested time, relative to the current moment.
 *
 * Rules:
 * - Only tasks with a `suggestedTime` are considered.
 * - Completed tasks are excluded (daily done today, weekly at required count).
 * - Daily tasks are only shown if today is one of their assigned days.
 * - A task is "upcoming" when its time ≥ the current time.
 * - Returns null when nothing is upcoming today.
 *
 * @param {Array<import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask>} allTasks
 * @param {Date}   now
 * @param {number} todayIsoDay - ISO day of today (1=Mon…7=Sun)
 * @param {string} weekId      - Current week identifier
 * @returns {import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask | null}
 */
export function getNextEvent(allTasks, now, todayIsoDay, weekId) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = allTasks.filter((t) => {
    if (!t.suggestedTime) return false;

    if (t.type === 'daily') {
      // Must be assigned to today.
      if (!t.assignedDays.includes(todayIsoDay)) return false;
      // Skip if already completed today.
      if (isDailyTaskDoneOnDay(t, weekId, todayIsoDay)) return false;
    } else {
      // Weekly: skip if already met the required count.
      if (isWeeklyTaskComplete(t, weekId)) return false;
    }

    const [h, m] = t.suggestedTime.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const [ah, am] = a.suggestedTime.split(':').map(Number);
    const [bh, bm] = b.suggestedTime.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  return candidates[0];
}


