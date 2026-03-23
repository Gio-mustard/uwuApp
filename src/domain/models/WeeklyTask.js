/**
 * @fileoverview WeeklyTask domain model.
 *
 * A WeeklyTask is a recurring task that must be completed a minimum number of
 * times per week, but is NOT restricted to any specific day. The user may
 * mark it as done on any day of the week, up to `requiredCount` times.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {Object} WeeklyTask
 * @property {string}    id            - Unique identifier (UUID).
 * @property {'weekly'}  type          - Discriminator literal.
 * @property {string}    title         - Short title for the task.
 * @property {string}    [description] - Optional longer description.
 * @property {string|null} suggestedTime - Suggested time in "HH:MM" format, or null.
 * @property {number}    requiredCount - Minimum number of completions per week (≥ 1).
 * @property {Object.<string, number>} completions
 *   Map of weekId → number of times completed that week.
 *   e.g. { "2024-W12": 2 } means done twice on week 12.
 */

/**
 * Creates a new WeeklyTask with safe defaults.
 * @param {Partial<WeeklyTask>} data
 * @returns {WeeklyTask}
 */
export function createWeeklyTask(data) {
  console.log(data)
  return {
    id: data.id ?? uuidv4(),
    type: 'weekly',
    title: data.title ?? '',
    description: data.description ?? '',
    suggestedTime: data.suggestedTime ?? null,
    requiredCount: data.requiredCount ?? 1,
    completions: data.completions ?? {},
    isRecurring:data.isRecurring,
  };
}
