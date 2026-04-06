/**
 * @fileoverview NoteCard — Card preview for a single note in the notes grid.
 */

import { marked, Marked } from 'marked';
import './NoteCard.css';
import { useEffect, useState } from 'react';

// Create an isolated instance of Marked so @tiptap/markdown doesn't pollute the tokenizers globally
import { getEasterEggMarkedExtension } from '../../components/notes/eastereggs';

const cardMarked = new Marked({ breaks: true, gfm: true });
cardMarked.use({ extensions: [getEasterEggMarkedExtension()] });

/**
 * @param {{
 *   note:     import('../../domain/models/Note').Note,
 *   onClick:  () => void,
 *   onDelete: (id: string) => Promise<void>,
 * }} props
 */
export function NoteCard({ note, onClick, onDelete }) {
  const [updatedDate,setUpdatedDate] = useState(note.updatedAt
    ? formatDate(note.updatedAt)
    : formatDate(note.createdAt));

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(note.id);
  }

  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    if (!note) return;
    // marked.parse is synchronous since we have no async extensions loaded
    setPreviewHtml(cardMarked.parse(note.content || ""));
  }, [note]);
  return (
    <article className="note-card" onClick={onClick} tabIndex={0} role="button"
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <header className="note-card__header">
        <h3 className="note-card__title">
          {note.title || <span className="note-card__untitled">Sin título</span>}
        </h3>
        <button
          className="note-card__delete"
          onClick={handleDelete}
          aria-label="Eliminar nota"
          title="Eliminar nota"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </header>

      {note.content && (
        <div 
          className="note-card__preview nev__prose" 
          dangerouslySetInnerHTML={{ __html: previewHtml }} 
        />
      )}

      {note.tags.length > 0 && (
        <div className="note-card__tags">
          {note.tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id ?? tag.name}
              className="tag-chip tag-chip--sm"
              style={{ '--chip-color': tag.color ?? '#6b7280' }}
            >
              <span className="tag-chip__dot" />
              {tag.name}
            </span>
          ))}
          {note.tags.length > 4 && (
            <span className="note-card__more-tags">+{note.tags.length - 4}</span>
          )}
        </div>
      )}

      <footer className="note-card__footer">
        <time className="note-card__date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {updatedDate}
        </time>
      </footer>
    </article>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffH = diffMs / 3_600_000;
  const diffD = diffMs / 86_400_000;

  if (diffH < 1) return 'Hace un momento';
  if (diffH < 24) return `Hace ${Math.floor(diffH)} h`;
  if (diffD < 2) return 'Ayer';
  if (diffD < 7) return `Hace ${Math.floor(diffD)} días`;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
