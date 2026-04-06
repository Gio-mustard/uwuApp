/**
 * @fileoverview TagInput — Inline tag creator/selector.
 *
 * Allows the user to search existing tags, select them, and create
 * new ones on-the-fly exactly like Notion's tag input.
 *
 * Props:
 *  - availableTags: Tag[]          — all tags from context
 *  - selectedTags:  Tag[]          — tags currently on the note
 *  - onChange: (tags: Tag[]) => void
 *  - onCreate: (name: string) => Promise<Tag>
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import './TagInput.css';

// Soft pastel palette for auto-assigning tag colors
const TAG_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#ef4444', '#14b8a6', '#f97316',
];

function getTagColor(name) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

/**
 * @param {{
 *   availableTags: import('../../domain/models/Tag').Tag[],
 *   selectedTags:  import('../../domain/models/Tag').Tag[],
 *   onChange:      (tags: import('../../domain/models/Tag').Tag[]) => void,
 *   onCreate:      (name: string) => Promise<import('../../domain/models/Tag').Tag>,
 * }} props
 */
export function TagInput({ availableTags = [], selectedTags = [], onChange, onCreate }) {
  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const selectedIds = new Set(selectedTags.map((t) => t.id).filter(Boolean));

  const suggestions = availableTags.filter(
    (t) =>
      !selectedIds.has(t.id) &&
      t.name.toLowerCase().includes(query.toLowerCase())
  );

  const canCreate =
    query.trim().length > 0 &&
    !availableTags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase());

  const handleSelect = useCallback(
    (tag) => {
      onChange([...selectedTags, tag]);
      setQuery('');
      inputRef.current?.focus();
    },
    [selectedTags, onChange]
  );

  const handleRemove = useCallback(
    (tagId) => {
      onChange(selectedTags.filter((t) => t.id !== tagId));
    },
    [selectedTags, onChange]
  );

  const handleCreate = useCallback(async () => {
    const name = query.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const newTag = await onCreate({ name, color: getTagColor(name) });
      onChange([...selectedTags, newTag]);
      setQuery('');
    } finally {
      setCreating(false);
      inputRef.current?.focus();
    }
  }, [query, creating, onCreate, selectedTags, onChange]);

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && canCreate) {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === 'Backspace' && query === '' && selectedTags.length > 0) {
      handleRemove(selectedTags[selectedTags.length - 1].id);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="tag-input" ref={wrapperRef}>
      <div className="tag-input__field" onClick={() => inputRef.current?.focus()}>
        {selectedTags.map((tag) => (
          <span
            key={tag.id ?? tag.name}
            className="tag-chip"
            style={{ '--chip-color': tag.color ?? '#6b7280' }}
          >
            <span className="tag-chip__dot" />
            {tag.name}
            <button
              className="tag-chip__remove"
              onClick={(e) => { e.stopPropagation(); handleRemove(tag.id); }}
              aria-label={`Quitar etiqueta ${tag.name}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          className="tag-input__text"
          value={query}
          placeholder={selectedTags.length === 0 ? 'Agregar etiqueta…' : ''}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
      </div>

      {open && (suggestions.length > 0 || canCreate) && (
        <div className="tag-input__dropdown">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              className="tag-input__option"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(tag); }}
            >
              <span className="tag-chip__dot" style={{ background: tag.color ?? '#6b7280' }} />
              {tag.name}
            </button>
          ))}

          {canCreate && (
            <button
              className="tag-input__option tag-input__option--create"
              onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
              disabled={creating}
            >
              <span className="tag-input__create-icon">+</span>
              Crear «{query.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
