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
import { useSession } from '../../context/SessionContext';
import { PlusIcon } from '../common/Icons';
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
  const { useNotes } = useSession();
  const { saveTag, deleteTag } = useNotes();

  const [query, setQuery]       = useState('');
  const [open, setOpen]         = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  
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
          {suggestions.map((tag) => {
            const isEditing = editingTag?.id === tag.id;
            return (
              <div
                key={tag.id}
                className="tag-input__option-wrapper"
              >
                <button
                  className="tag-input__option"
                  style={{ flexWrap: 'wrap', cursor: isEditing ? 'default' : 'pointer' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!isEditing) handleSelect(tag);
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
                    <span className="tag-chip__dot" style={{ background: tag.color ?? '#6b7280' }} />
                    <span style={{ flex: 1, textAlign: 'left' }}>{tag.name}</span>
                    
                    <span
                      className="tag-input__edit-btn"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingTag(isEditing ? null : { ...tag });
                      }}
                      title="Editar etiqueta"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </span>
                  </div>

                  {isEditing && (
                    <div className="tag-input__edit-modal" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                      <input
                        className="tag-input__edit-input"
                        value={editingTag.name}
                        onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <div className="tag-input__edit-colors">
                        {TAG_COLORS.map(c => (
                          <div
                            key={c}
                            className={`tag-input__color-swatch ${editingTag.color === c ? 'active' : ''}`}
                            style={{ background: c }}
                            onClick={(e) => { e.stopPropagation(); setEditingTag({ ...editingTag, color: c }); }}
                          />
                        ))}
                      </div>
                      <div className="tag-input__edit-actions">
                        <span
                          className="tag-input__edit-btn-save"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!editingTag.name) return;
                            await saveTag(editingTag);
                            setEditingTag(null);
                          }}
                        >
                          Guardar
                        </span>
                        <span
                          className="tag-input__edit-btn-delete"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteTag(tag.id);
                            setEditingTag(null);
                            handleRemove(tag.id);
                          }}
                        >
                          Eliminar
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {canCreate && (
            <button
              className="tag-input__option tag-input__option--create"
              onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
              disabled={creating}
            >
              <span className="tag-input__create-icon"><PlusIcon /></span>
              Crear «{query.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}
