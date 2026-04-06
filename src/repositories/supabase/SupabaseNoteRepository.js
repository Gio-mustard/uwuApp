/**
 * @fileoverview SupabaseNoteRepository — Concrete implementation of INoteRepository.
 *
 * Matches the exact RPC signatures deployed in Supabase:
 *  - get_notes     → returns table(id, title, content, created_at, updated_at, tags jsonb)
 *  - upsert_note   → returns table(id uuid)
 *  - delete_note   → returns void
 *  - get_tags      → returns table(id, name, color)
 *  - upsert_tag    → returns table(id, name, color)
 *  - delete_tag    → returns void
 */

import { INoteRepository } from '../INoteRepository';
import { supabase } from '../../lib/supabaseClient';
import { createNote } from '../../domain/models/Note';
import { createTag } from '../../domain/models/Tag';

export class SupabaseNoteRepository extends INoteRepository {
  /**
   * @param {import('../../domain/models/User').User} user
   */
  constructor(user) {
    super(user);
  }

  // ─── Notes ──────────────────────────────────────────────────────────────────

  /**
   * @param {{
   *   tagIds?:  string[],
   *   search?:  string,
   *   sortBy?:  string,
   *   sortDir?: string,
   * }} [filters]
   */
  async getNotes(filters = {}) {
    const { data, error } = await supabase.rpc('get_notes', {
      p_user_id:  this.user.id,
      // Pass null when empty so the SQL "IS NULL" check works correctly
      p_tag_ids:  filters.tagIds?.length ? filters.tagIds : null,
      p_search:   filters.search?.trim() || null,
      p_sort_by:  filters.sortBy  ?? 'updated_at',
      p_sort_dir: filters.sortDir ?? 'desc',
    });

    if (error) throw new Error(error.message);

    // data is an array of typed table rows; `tags` column is JSONB
    return (data ?? []).map((row) =>
      createNote({
        id:        row.id,
        title:     row.title,
        content:   row.content,
        // tags is a jsonb array: [{ id, name, color }, ...]
        tags:      Array.isArray(row.tags)
          ? row.tags.map((t) => createTag({ id: t.id, name: t.name, color: t.color }))
          : [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })
    );
  }

  /**
   * @param {import('../../domain/models/Note').Note} note
   */
  async upsertNote(note) {
    const { data, error } = await supabase.rpc('upsert_note', {
      p_user_id: this.user.id,
      p_id:      note.id ?? null,
      p_title:   note.title,
      p_content: note.content,
      // Function expects uuid[] — send empty array instead of null
      p_tag_ids: note.tags.map((t) => t.id).filter(Boolean),
    });

    if (error) throw new Error(error.message);

    // returns table(id uuid) → data is [{id: uuid}]
    const savedId = Array.isArray(data) ? data[0]?.id : data?.id;

    return createNote({
      ...note,
      id: savedId ?? note.id,
    });
  }

  /**
   * @param {string} id
   */
  async deleteNote(id) {
    const { error } = await supabase.rpc('delete_note', {
      p_id:      id,
      p_user_id: this.user.id,
    });

    if (error) throw new Error(error.message);
  }

  // ─── Tags ────────────────────────────────────────────────────────────────────

  async getTags() {
    const { data, error } = await supabase.rpc('get_tags', {
      p_user_id: this.user.id,
    });

    if (error) throw new Error(error.message);

    // returns table(id, name, color) — no linked_task_id in this function
    return (data ?? []).map((row) =>
      createTag({
        id:    row.id,
        name:  row.name,
        color: row.color,
      })
    );
  }

  /**
   * @param {import('../../domain/models/Tag').Tag} tag
   */
  async upsertTag(tag) {
    const { data, error } = await supabase.rpc('upsert_tag', {
      p_user_id: this.user.id,
      p_id:      tag.id    ?? null,
      p_name:    tag.name,
      p_color:   tag.color ?? '#6366f1',
      // Note: p_linked_task_id is not in the deployed function signature
    });

    if (error) throw new Error(error.message);

    // returns table(id, name, color) → data is [{id, name, color}]
    const row = Array.isArray(data) ? data[0] : data;

    return createTag({
      id:    row.id,
      name:  row.name,
      color: row.color,
    });
  }

  /**
   * @param {string} id
   */
  async deleteTag(id) {
    const { error } = await supabase.rpc('delete_tag', {
      p_id:      id,
      p_user_id: this.user.id,
    });

    if (error) throw new Error(error.message);
  }
}
