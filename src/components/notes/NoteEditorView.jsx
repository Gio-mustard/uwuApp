/**
 * @fileoverview NoteEditorView — Full-page in-place note editor.
 *
 * Replaces the modal/panel. NotesPage swaps the entire page content
 * to render this view when creating or editing a note.
 *
 * Auto-save: debounce 800 ms on any change + save on back.
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { TagInput } from './TagInput';
import './NoteEditorView.css';

const AUTOSAVE_DELAY = 800;

/**
 * @param {{
 *   note:        import('../../domain/models/Note').Note | null,
 *   onBack:      () => void,
 *   onSave:      (note: object) => Promise<import('../../domain/models/Note').Note>,
 *   tags:        import('../../domain/models/Tag').Tag[],
 *   onCreateTag: (tagData: object) => Promise<import('../../domain/models/Tag').Tag>,
 * }} props
 */
export function NoteEditorView({ note, onBack, onSave, tags, onCreateTag }) {
  const titleId = useId();

  const [title,   setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [selTags, setSelTags] = useState(note?.tags    ?? []);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const savedNoteRef  = useRef(note ?? null);
  const pendingSave   = useRef(null);
  const isLeavingRef  = useRef(false);

  // Reset when note changes (opening a different note)
  useEffect(() => {
    isLeavingRef.current = false;
    setTitle(note?.title   ?? '');
    setContent(note?.content ?? '');
    setSelTags(note?.tags   ?? []);
    savedNoteRef.current = note ?? null;
    setSaved(false);
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Core save ───────────────────────────────────────────────────────────────
  const performSave = useCallback(
    async (t, c, tg) => {
      if (!t.trim() && !c.trim()) return;
      setSaving(true);
      try {
        const result = await onSave({
          id:      savedNoteRef.current?.id ?? null,
          title:   t,
          content: c,
          tags:    tg,
        });
        savedNoteRef.current = result;
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      } catch (err) {
        console.error('NoteEditorView: save failed', err);
      } finally {
        setSaving(false);
      }
    },
    [onSave]
  );

  // ─── Debounced auto-save ─────────────────────────────────────────────────────
  useEffect(() => {
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(() => {
      performSave(title, content, selTags);
    }, AUTOSAVE_DELAY);
    return () => { if (pendingSave.current) clearTimeout(pendingSave.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, selTags]);

  // ─── Save on back ────────────────────────────────────────────────────────────
  const handleBack = useCallback(async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;
    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }
    await performSave(title, content, selTags);
    onBack();
  }, [title, content, selTags, performSave, onBack]);

  // Cmd/Ctrl+S
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        performSave(title, content, selTags);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [title, content, selTags, performSave]);

  return (
    <div className="note-editor-view" data-color-mode="light">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="nev-topbar">
        <button
          className="nev-back-btn"
          onClick={handleBack}
          aria-label="Volver a notas"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Notas</span>
        </button>

        <div className="nev-status" aria-live="polite">
          {saving && (
            <span className="nev-status__saving">
              <span className="nev-status__dot" />
              Guardando…
            </span>
          )}
          {saved && !saving && (
            <span className="nev-status__saved">✓ Guardado</span>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="nev-content">
        {/* Title */}
        <label htmlFor={titleId} className="visually-hidden">Título</label>
        <input
          id={titleId}
          className="nev-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sin título"
          autoComplete="off"
          spellCheck
        />

        {/* Tags */}
        <div className="nev-tags">
          <TagInput
            availableTags={tags}
            selectedTags={selTags}
            onChange={setSelTags}
            onCreate={onCreateTag}
          />
        </div>

        {/* MD Editor */}
        <div className="nev-editor">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            preview="live"
            hideToolbar={false}
            visibleDragbar={false}
            height="100%"
            textareaProps={{
              placeholder: 'Escribe aquí… Usa # para encabezados, **negrita**, *itálica*',
              spellCheck: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
