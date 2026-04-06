/**
 * @fileoverview NotesPage — Main notes screen.
 *
 * Two views:
 *  - 'list'   → notes grid with search, filters, sort
 *  - 'editor' → full-page NoteEditorView (replaces page content)
 */

import { useState, useCallback } from 'react';
import { useSession } from '../../context/SessionContext';
import { AppShell } from '../../components/layout/AppShell';
import { NoteCard } from './NoteCard';
import { NoteEditorView } from '../../components/notes/NoteEditorView';
import './NotesPage.css';

export function NotesPage() {
  const { useNotes } = useSession();
  const { notes, tags, loading, filters, setFilters, saveNote, deleteNote, saveTag } = useNotes();

  // 'list' | 'editor'
  const [view,       setView]       = useState('list');
  const [activeNote, setActiveNote] = useState(null);
  const [filterTagsOpen, setFilterTagsOpen] = useState(false);

  const activeTagIds = filters.tagIds ?? [];

  // ─── Navigation ────────────────────────────────────────────────────────────
  const openEditor = useCallback((note = null) => {
    setActiveNote(note);
    setView('editor');
  }, []);

  const closeEditor = useCallback(() => {
    setView('list');
    setActiveNote(null);
  }, []);

  // ─── Tag filter toggle ──────────────────────────────────────────────────────
  const toggleTagFilter = useCallback((tagId) => {
    const next = activeTagIds.includes(tagId)
      ? activeTagIds.filter((id) => id !== tagId)
      : [...activeTagIds, tagId];
    setFilters({ tagIds: next });
  }, [activeTagIds, setFilters]);

  // ─── Editor view ────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <AppShell>
        <NoteEditorView
          note={activeNote}
          onBack={closeEditor}
          onSave={saveNote}
          tags={tags}
          onCreateTag={saveTag}
        />
      </AppShell>
    );
  }

  // ─── List view ──────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="notes-page">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <header className="notes-header">
          <div className="notes-header__top">
            <h1 className="notes-header__title">Notas</h1>
            <button
              id="notes-new-btn"
              className="btn-primary notes-new-btn"
              onClick={() => openEditor(null)}
              aria-label="Nueva nota"
            >
              <span className="notes-new-btn__icon">+</span>
              <span className="notes-new-btn__label">Nueva nota</span>
            </button>
          </div>

          {/* Search */}
          <div className="notes-search">
            <span className="notes-search__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="notes-search__input"
              type="search"
              placeholder="Buscar por título…"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              aria-label="Buscar notas"
            />
            {filters.search && (
              <button
                className="notes-search__clear"
                onClick={() => setFilters({ search: '' })}
                aria-label="Limpiar búsqueda"
              >×</button>
            )}
          </div>
        </header>

        {/* ── Filters bar ────────────────────────────────────────────────── */}
        <div className="notes-filters">
          <div className="notes-filters__sort">
            <select
              className="notes-sort-select"
              value={`${filters.sortBy}:${filters.sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split(':');
                setFilters({ sortBy: by, sortDir: dir });
              }}
              aria-label="Ordenar notas"
            >
              <option value="updated_at:desc">Editadas (recientes)</option>
              <option value="updated_at:asc">Editadas (antiguas)</option>
              <option value="created_at:desc">Creadas (recientes)</option>
              <option value="created_at:asc">Creadas (antiguas)</option>
            </select>
          </div>

          {tags.length > 0 && (
            <div className="notes-filters__tags">
              <button
                className={`notes-filter-toggle${filterTagsOpen ? ' notes-filter-toggle--active' : ''}`}
                onClick={() => setFilterTagsOpen((v) => !v)}
                aria-expanded={filterTagsOpen}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Etiquetas
                {activeTagIds.length > 0 && (
                  <span className="notes-filter-toggle__count">{activeTagIds.length}</span>
                )}
              </button>

              {filterTagsOpen && (
                <div className="notes-tag-filter-bar">
                  {tags.map((tag) => {
                    const active = activeTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        className={`tag-chip notes-tag-filter-chip${active ? ' notes-tag-filter-chip--active' : ''}`}
                        style={{ '--chip-color': tag.color ?? '#6b7280' }}
                        onClick={() => toggleTagFilter(tag.id)}
                      >
                        <span className="tag-chip__dot" />
                        {tag.name}
                      </button>
                    );
                  })}
                  {activeTagIds.length > 0 && (
                    <button
                      className="notes-clear-tags"
                      onClick={() => setFilters({ tagIds: [] })}
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Notes grid ─────────────────────────────────────────────────── */}
        <main className="notes-grid-area">
          {loading ? (
            <div className="notes-loading">
              <div className="notes-loading__spinner" />
              <p>Cargando notas…</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="notes-empty">
              <div className="notes-empty__icon">📝</div>
              <h2 className="notes-empty__title">
                {filters.search || activeTagIds.length > 0
                  ? 'Sin resultados'
                  : 'Aún no tienes notas'}
              </h2>
              <p className="notes-empty__body">
                {filters.search || activeTagIds.length > 0
                  ? 'Intenta con otra búsqueda o filtro.'
                  : 'Crea tu primera nota con el botón de arriba.'}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note, i) => (
                <NoteCard
                  key={note.id ?? i}
                  note={note}
                  onClick={() => openEditor(note)}
                  onDelete={deleteNote}
                />
              ))}
            </div>
          )}
        </main>

        {/* FAB (mobile) */}
        <button
          id="notes-fab"
          className="fab notes-fab"
          onClick={() => openEditor(null)}
          aria-label="Nueva nota"
        >
          +
        </button>
      </div>
    </AppShell>
  );
}
