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
 * Finds the most relevant task to display — either the next upcoming task or
 * the most recently overdue one — based on proximity to the current time.
 *
 * Rules:
 * - Only tasks with a `suggestedTime` are considered.
 * - Completed tasks are excluded (daily done today, weekly at required count).
 * - Daily tasks are only shown if today is one of their assigned days.
 * - **Overdue**: a task whose time has already passed but has not been completed.
 * - **Upcoming**: a task whose time is still in the future (>= currentMinutes).
 *
 * Decision logic:
 * 1. No overdue AND no upcoming → returns `null` (e.g. no tasks have suggestedTime)
 * 2. No overdue               → returns `{ task: upcoming, isOverdue: false }`
 * 3. No upcoming              → returns `{ task: overdue,  isOverdue: true  }`
 * 4. Both exist               → picks whichever is temporally closer to `now`
 *    - If the overdue task is closer (or equally close) → overdue wins
 *    - Otherwise → upcoming wins
 *
 * @param {Array<import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask>} allTasks
 * @param {Date}   now
 * @param {number} todayIsoDay - ISO day of today (1=Mon…7=Sun)
 * @param {string} weekId      - Current week identifier
 * @returns {{ task: import('../domain/models/DailyTask').DailyTask | import('../domain/models/WeeklyTask').WeeklyTask, isOverdue: boolean } | null}
 */
export function getNextEvent(allTasks, now, todayIsoDay, weekId) {
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  function toSeconds(t) {
    const [h, m] = t.suggestedTime.split(':').map(Number);
    return h * 3600 + m * 60;
  }

  /** @param {any} t */
  function isEligible(t) {
    if (!t.suggestedTime) return false;
    if (t.type === 'daily') {
      if (!t.assignedDays.includes(todayIsoDay)) return false;
      if (isDailyTaskDoneOnDay(t, weekId, todayIsoDay)) return false;
    } else {
      if (isWeeklyTaskComplete(t, weekId)) return false;
    }
    return true;
  }

  const eligible = allTasks.filter(isEligible);

  // Split into overdue (past) and upcoming (future / right on time)
  const overdues  = eligible.filter(t => toSeconds(t) < currentSeconds);
  const upcomings = eligible.filter(t => toSeconds(t) >= currentSeconds);

  // Case 1: nothing to show
  if (overdues.length === 0 && upcomings.length === 0) return null;

  // Find closest overdue (fewest seconds ago)
  const closestOverdue = overdues.length > 0
    ? overdues.reduce((best, t) =>
        currentSeconds - toSeconds(t) < currentSeconds - toSeconds(best) ? t : best
      )
    : null;

  // Find soonest upcoming (fewest seconds ahead)
  upcomings.sort((a, b) => toSeconds(a) - toSeconds(b));
  const closestUpcoming = upcomings.length > 0 ? upcomings[0] : null;

  // Case 2: only upcoming
  if (!closestOverdue) return { task: closestUpcoming, isOverdue: false, nextUpcoming: closestUpcoming };

  // Case 3: only overdue — no upcoming task exists
  if (!closestUpcoming) return { task: closestOverdue, isOverdue: true, nextUpcoming: null };

  // Case 4: both exist — pick temporally closest (in seconds)
  const distOverdue  = currentSeconds - toSeconds(closestOverdue);
  const distUpcoming = toSeconds(closestUpcoming) - currentSeconds;

  return distOverdue <= distUpcoming
    ? { task: closestOverdue,  isOverdue: true,  nextUpcoming: closestUpcoming }
    : { task: closestUpcoming, isOverdue: false, nextUpcoming: closestUpcoming };
}


