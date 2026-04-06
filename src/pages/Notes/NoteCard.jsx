/**
 * @fileoverview NoteCard — Card preview for a single note in the notes grid.
 */

import './NoteCard.css';

/**
 * @param {{
 *   note:     import('../../domain/models/Note').Note,
 *   onClick:  () => void,
 *   onDelete: (id: string) => Promise<void>,
 * }} props
 */
export function NoteCard({ note, onClick, onDelete }) {
  const preview = stripMarkdown(note.content).slice(0, 140);
  const updatedDate = note.updatedAt
    ? formatDate(note.updatedAt)
    : formatDate(note.createdAt);

  function handleDelete(e) {
    e.stopPropagation();
    onDelete(note.id);
  }

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

      {preview && (
        <p className="note-card__preview">{preview}{note.content.length > 140 ? '…' : ''}</p>
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
          {updatedDate}
        </time>
      </footer>
    </article>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripMarkdown(md = '') {
  return md
    .replace(/#{1,6}\s?/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

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
