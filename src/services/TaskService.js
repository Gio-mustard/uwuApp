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
 * Finds the next upcoming task by suggested time on the current day.
 * Returns null if no task has a suggestedTime.
 *
 * @param {Array<import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask>} allTasks
 * @param {Date} now
 * @returns {import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask | null}
 */
export function getNextEvent(allTasks, now) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const withTime = allTasks.filter((t) => t.suggestedTime);
  const upcoming = withTime.filter((t) => {
    const [h, m] = t.suggestedTime.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  upcoming.sort((a, b) => {
    const [ah, am] = a.suggestedTime.split(':').map(Number);
    const [bh, bm] = b.suggestedTime.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  return upcoming[0] ?? withTime[withTime.length - 1] ?? null;
}
