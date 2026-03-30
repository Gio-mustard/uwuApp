/**
 * @fileoverview VaulTask domain model.
 *
 * A VaulTask represents an immediate or pending action stored in the Vaul
 * (Baúl). These tasks are usually things that the user needs to do "right now"
 * or without a specific recurring schedule.
 */

/**
 * @typedef {Object} VaulTask
 * @property {string|null} id    - Unique identifier (UUID) or null if not yet saved.
 * @property {string}      title - Short title describing the task.
 */

/**
 * Creates a new VaulTask with safe defaults.
 * 
 * @param {Partial<VaulTask>} data - Initial data for the task.
 * @returns {VaulTask}
 */
export function createVaulTask(data) {
  return {
    id: data.id ?? null,
    title: data.title ?? '',
  };
}
