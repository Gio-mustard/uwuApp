/**
 * @fileoverview Note domain model.
 *
 * A Note represents a markdown document created by the user.
 * It can have multiple tags, a title, and rich MD content.
 */

/**
 * @typedef {Object} Note
 * @property {string|null}  id        - UUID or null if not yet persisted.
 * @property {string}       title     - Short title for the note.
 * @property {string}       content   - Markdown content body.
 * @property {Tag[]}        tags      - Array of associated Tag objects.
 * @property {string|null}  createdAt - ISO timestamp (from DB).
 * @property {string|null}  updatedAt - ISO timestamp of last save.
 */

/**
 * Creates a Note with safe defaults.
 * @param {Partial<Note>} data
 * @returns {Note}
 */
export function createNote(data = {}) {
  return {
    id:        data.id        ?? null,
    title:     data.title     ?? '',
    content:   data.content   ?? '',
    tags:      data.tags      ?? [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}
