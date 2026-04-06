/**
 * @fileoverview NoteContext — React context for Notes & Tags state.
 *
 * Manages all note and tag data (CRUD + filters) for the current user.
 * The concrete INoteRepository instance is injected from SessionContext.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createNote } from '../domain/models/Note';
import { createTag } from '../domain/models/Tag';

/** @type {React.Context<NoteContextValue>} */
const NoteContext = createContext(null);

/**
 * @typedef {Object} NoteFilters
 * @property {string}   search   - Title search string (ILIKE)
 * @property {string[]} tagIds   - Filter by tag IDs
 * @property {string}   sortBy   - 'updated_at' | 'created_at'
 * @property {string}   sortDir  - 'asc' | 'desc'
 */

/**
 * @typedef {Object} NoteContextValue
 * @property {import('../domain/models/Note').Note[]} notes
 * @property {import('../domain/models/Tag').Tag[]}   tags
 * @property {boolean}      loading
 * @property {NoteFilters}  filters
 * @property {(f: Partial<NoteFilters>) => void} setFilters
 * @property {(note: object) => Promise<import('../domain/models/Note').Note>} saveNote
 * @property {(id: string) => Promise<void>} deleteNote
 * @property {(tag: object) => Promise<import('../domain/models/Tag').Tag>} saveTag
 * @property {(id: string) => Promise<void>} deleteTag
 */

const DEFAULT_FILTERS = {
  search:  '',
  tagIds:  [],
  sortBy:  'updated_at',
  sortDir: 'desc',
};

/**
 * @param {{
 *   children:   React.ReactNode,
 *   repository: import('../repositories/INoteRepository').INoteRepository,
 * }} props
 */
export function NoteProvider({ children, repository }) {
  const [notes, setNotes]     = useState([]);
  const [tags, setTags]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFiltersState] = useState(DEFAULT_FILTERS);

  // Merge-patch setter so callers only pass the changed keys
  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const [fetchedNotes, fetchedTags] = await Promise.all([
          repository.getNotes(),
          repository.getTags(),
        ]);
        if (!cancelled) {
          setNotes(fetchedNotes);
          setTags(fetchedTags);
        }
      } catch (err) {
        console.error('NoteContext failed to load data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [repository]);

  // Filtered + searched notes (client-side for instant feedback)
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q));
    }

    if (filters.tagIds.length > 0) {
      result = result.filter((n) =>
        filters.tagIds.every((tid) => n.tags.some((t) => t.id === tid))
      );
    }

    result.sort((a, b) => {
      const aVal = a[filters.sortBy === 'created_at' ? 'createdAt' : 'updatedAt'] ?? '';
      const bVal = b[filters.sortBy === 'created_at' ? 'createdAt' : 'updatedAt'] ?? '';
      return filters.sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    return result;
  }, [notes, filters]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const saveNote = useCallback(async (noteData) => {
    const note = createNote({ ...noteData });
    const saved = await repository.upsertNote(note);

    setNotes((prev) => {
      const exists = prev.some((n) => n.id === saved.id);
      if (exists) return prev.map((n) => (n.id === saved.id ? saved : n));
      return [saved, ...prev];
    });

    return saved;
  }, [repository]);

  const deleteNote = useCallback(async (id) => {
    await repository.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, [repository]);

  const saveTag = useCallback(async (tagData) => {
    const tag = createTag({ ...tagData });
    const saved = await repository.upsertTag(tag);

    setTags((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      if (exists) return prev.map((t) => (t.id === saved.id ? saved : t));
      return [...prev, saved];
    });

    return saved;
  }, [repository]);

  const deleteTag = useCallback(async (id) => {
    await repository.deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    // Also remove tag from all notes in local state
    setNotes((prev) =>
      prev.map((n) => ({ ...n, tags: n.tags.filter((t) => t.id !== id) }))
    );
  }, [repository]);

  return (
    <NoteContext.Provider
      value={{
        notes: filteredNotes,
        tags,
        loading,
        filters,
        setFilters,
        saveNote,
        deleteNote,
        saveTag,
        deleteTag,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

/**
 * Custom hook for consuming NoteContext.
 * Must be used inside a <NoteProvider />.
 * @returns {NoteContextValue}
 */
export function useNotes() {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error('useNotes must be used within a NoteProvider.');
  return ctx;
}
