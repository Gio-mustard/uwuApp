/**
 * @fileoverview DailyTask domain model.
 *
 * A DailyTask is a recurring task that MUST be assigned to between 1 and 7
 * specific days of the week. It can only be marked as completed on one of
 * its assigned days, and only if that assigned day matches the current day.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} DailyTask
 * @property {string}   id            - Unique identifier (UUID).
 * @property {'daily'}  type          - Discriminator literal.
 * @property {string}   title         - Short title for the task.
 * @property {string}   [description] - Optional longer description.
 * @property {string|null} suggestedTime - Suggested time in "HH:MM" format, or null.
 * @property {number[]} assignedDays  - ISO week-days (1=Mon … 7=Sun) this task is assigned to.
 * @property {Object.<string, number[]>} completions
 *   Map of weekId → array of ISO-day numbers completed that week.
 *   e.g. { "2024-W12": [1, 3] } means Monday and Wednesday were done on week 12.
 */

/**
 * Creates a new DailyTask with safe defaults.
 * @param {Partial<DailyTask>} data
 * @returns {DailyTask}
 */
export function createDailyTask(data) {
  return {
    id: data.id ?? uuidv4(),
    type: 'daily',
    title: data.title ?? '',
    description: data.description ?? '',
    suggestedTime: data.suggestedTime ?? null,
    assignedDays: data.assignedDays ?? [],
    completions: data.completions ?? {},
  };
}
