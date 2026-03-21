/**
 * @fileoverview WeekHistory domain model.
 *
 * Captures a snapshot of ALL tasks (completed and not completed) at the end of
 * each calendar week. This enables the History page to display a full picture
 * of weekly performance, including tasks that were missed.
 */

/**
 * @typedef {Object} TaskSnapshot
 * @property {string}   taskId        - ID of the original task.
 * @property {string}   title         - Task title at time of snapshot.
 * @property {'daily'|'weekly'} type  - Task type.
 * @property {boolean}  completed     - Whether the task met its goal for the week.
 * @property {number}   completedCount
 *   For daily tasks: number of assigned days on which it was completed.
 *   For weekly tasks: number of times it was completed.
 * @property {number}   requiredCount
 *   For daily tasks: number of assigned days (target).
 *   For weekly tasks: requiredCount target.
 */

/**
 * @typedef {Object} WeekHistory
 * @property {string}         weekId         - Unique week identifier in "YYYY-WW" format.
 * @property {string}         startDate      - ISO string for Monday of the week.
 * @property {string}         endDate        - ISO string for Sunday of the week.
 * @property {number}         totalTasks     - Total number of tasks (completed + not completed).
 * @property {number}         completedTasks - Number of tasks that met their weekly goal.
 * @property {TaskSnapshot[]} taskSnapshots  - Full list of tasks with their completion status.
 */

/**
 * Creates a WeekHistory record.
 * @param {Partial<WeekHistory>} data
 * @returns {WeekHistory}
 */
export function createWeekHistory(data) {
  return {
    weekId: data.weekId ?? '',
    startDate: data.startDate ?? new Date().toISOString(),
    endDate: data.endDate ?? new Date().toISOString(),
    totalTasks: data.totalTasks ?? 0,
    completedTasks: data.completedTasks ?? 0,
    taskSnapshots: data.taskSnapshots ?? [],
  };
}
