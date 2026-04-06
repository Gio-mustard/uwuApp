/**
 * @fileoverview Tag domain model.
 *
 * A Tag is an exclusive entity of the Notes domain.
 * It can optionally reference a daily or weekly task by ID.
 */

/**
 * @typedef {Object} Tag
 * @property {string|null}  id            - UUID or null if not yet persisted.
 * @property {string}       name          - Label text.
 * @property {string|null}  color         - Hex or CSS color string, e.g. "#F59E0B".
 * @property {string|null}  linkedTaskId  - Optional reference to a daily/weekly task UUID.
 */

/**
 * Creates a Tag with safe defaults.
 * @param {Partial<Tag>} data
 * @returns {Tag}
 */
export function createTag(data = {}) {
  return {
    id:           data.id           ?? null,
    name:         data.name         ?? '',
    color:        data.color        ?? null,
    linkedTaskId: data.linkedTaskId ?? null,
  };
}
