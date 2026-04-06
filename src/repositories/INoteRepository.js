/**
 * @fileoverview INoteRepository — Abstract interface for note & tag persistence.
 *
 * Concrete implementations (SupabaseNoteRepository, MockNoteRepository) must
 * extend this class and override every method.
 *
 * Follows the same Repository Pattern used by ITaskRepository.
 */

export class INoteRepository {
  /**
   * @param {import('../domain/models/User').User} user - The currently authenticated user.
   */
  constructor(user) {
    if (!user || !user.id) {
      throw new Error('INoteRepository requires a valid authenticated user.');
    }
    /** @type {import('../domain/models/User').User} */
    this.user = user;
  }

  // ─── Notes ──────────────────────────────────────────────────────────────────

  /**
   * Fetches notes for the current user with optional filtering.
   *
   * @param {{
   *   tagIds?:   string[],   - Filter by tag UUIDs (AND logic)
   *   search?:   string,     - ILIKE filter on title
   *   sortBy?:   'created_at' | 'updated_at',
   *   sortDir?:  'asc' | 'desc',
   * }} [filters]
   * @returns {Promise<import('../domain/models/Note').Note[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getNotes(filters) {
    throw new Error('INoteRepository.getNotes() must be implemented.');
  }

  /**
   * Creates or updates a note.
   * If `note.id` is null a new note is created; otherwise it is updated.
   *
   * @param {import('../domain/models/Note').Note} note
   * @returns {Promise<import('../domain/models/Note').Note>} Saved note with server timestamps.
   */
  // eslint-disable-next-line no-unused-vars
  async upsertNote(note) {
    throw new Error('INoteRepository.upsertNote() must be implemented.');
  }

  /**
   * Deletes a note by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteNote(id) {
    throw new Error('INoteRepository.deleteNote() must be implemented.');
  }

  // ─── Tags ────────────────────────────────────────────────────────────────────

  /**
   * Fetches all tags owned by the current user.
   * @returns {Promise<import('../domain/models/Tag').Tag[]>}
   */
  async getTags() {
    throw new Error('INoteRepository.getTags() must be implemented.');
  }

  /**
   * Creates or updates a tag.
   * @param {import('../domain/models/Tag').Tag} tag
   * @returns {Promise<import('../domain/models/Tag').Tag>}
   */
  // eslint-disable-next-line no-unused-vars
  async upsertTag(tag) {
    throw new Error('INoteRepository.upsertTag() must be implemented.');
  }

  /**
   * Deletes a tag by ID.
   * @param {string} id
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line no-unused-vars
  async deleteTag(id) {
    throw new Error('INoteRepository.deleteTag() must be implemented.');
  }
}
