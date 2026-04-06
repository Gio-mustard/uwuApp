/**
 * @fileoverview NoteEditorView — Mobile-first custom Markdown editor.
 *
 * Three modes (cycled with the top-right button):
 *  - 'write'   → textarea only (default)
 *  - 'split'   → textarea + live preview side by side (desktop) / stacked (mobile)
 *  - 'preview' → rendered preview only
 *
 * Auto-save: debounce 800ms + flush on back navigation.
 */

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { marked } from 'marked';
import { TagInput } from './TagInput';
import './NoteEditorView.css';

const AUTOSAVE_DELAY = 800;

marked.setOptions({ breaks: true, gfm: true });

const MODES = ['write', 'split', 'preview'];

// ─── Toolbar actions ──────────────────────────────────────────────────────────
const ACTIONS = [
  { id: 'bold',   title: 'Negrita',   label: 'B',  style: 'bold',   apply: (s) => `**${s || 'texto'}**` },
  { id: 'italic', title: 'Itálica',   label: 'I',  style: 'italic', apply: (s) => `*${s || 'texto'}*` },
  { id: 'h2',     title: 'Encabezado',label: 'H',  apply: (s) => `## ${s || 'Título'}`, linePrefix: true },
  { id: 'ul',     title: 'Lista',     label: '≡',  apply: (s) => `- ${s || 'ítem'}`, linePrefix: true },
  { id: 'code',   title: 'Código',    label: '<>', apply: (s) => `\`${s || 'código'}\`` },
  { id: 'quote',  title: 'Cita',      label: '❝', apply: (s) => `> ${s || 'cita'}`, linePrefix: true },
  { id: 'hr',     title: 'Separador', label: '—',  apply: () => '\n---\n' },
  { id: 'link',   title: 'Enlace',    label: '⎘',  apply: (s) => `[${s || 'texto'}](url)` },
];

function EditorToolbar({ textareaRef, onContentChange }) {
  const applyAction = useCallback((action) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const val   = el.value;
    const sel   = val.slice(start, end);
    const insert = action.apply(sel);

    let newVal, newCursor;
    if (action.linePrefix) {
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      newVal    = val.slice(0, lineStart) + insert + val.slice(end);
      newCursor = lineStart + insert.length;
    } else {
      newVal    = val.slice(0, start) + insert + val.slice(end);
      newCursor = start + insert.length;
    }

    // Update value without losing React controlled state
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    setter.call(el, newVal);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.setSelectionRange(newCursor, newCursor);
    el.focus();
    onContentChange(newVal);
  }, [textareaRef, onContentChange]);

  return (
    <div className="nev-toolbar" role="toolbar" aria-label="Formato">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          className={`nev-toolbar__btn${a.style ? ` nev-toolbar__btn--${a.style}` : ''}`}
          title={a.title}
          aria-label={a.title}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); applyAction(a); }}
          onTouchStart={(e) => { e.preventDefault(); applyAction(a); }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── Mode cycle button ────────────────────────────────────────────────────────
const MODE_META = {
  write: {
    next: 'split',
    icon: (
      // "split" icon — two vertical panels
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
    label: 'Split',
  },
  split: {
    next: 'preview',
    icon: (
      // "eye" icon — preview only
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: 'Preview',
  },
  preview: {
    next: 'write',
    icon: (
      // "edit" icon — back to write
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    label: 'Editar',
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export function NoteEditorView({ note, onBack, onSave, tags, onCreateTag }) {
  const titleId = useId();

  const [title,   setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [selTags, setSelTags] = useState(note?.tags    ?? []);
  const [mode,    setMode]    = useState('write');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const savedNoteRef = useRef(note ?? null);
  const pendingSave  = useRef(null);
  const isLeaving    = useRef(false);
  const textareaRef  = useRef(null);

  // Reset when note changes
  useEffect(() => {
    isLeaving.current = false;
    setTitle(note?.title   ?? '');
    setContent(note?.content ?? '');
    setSelTags(note?.tags   ?? []);
    setMode('write');
    setSaved(false);
    savedNoteRef.current = note ?? null;
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => {
      if (!title) {
        document.getElementById(titleId)?.focus();
      } else {
        textareaRef.current?.focus();
      }
    }, 80);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Save ──────────────────────────────────────────────────────────────────
  const performSave = useCallback(async (t, c, tg) => {
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
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[NoteEditorView] save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [onSave]);

  // Debounced auto-save
  useEffect(() => {
    if (pendingSave.current) clearTimeout(pendingSave.current);
    pendingSave.current = setTimeout(() => {
      performSave(title, content, selTags);
    }, AUTOSAVE_DELAY);
    return () => { if (pendingSave.current) clearTimeout(pendingSave.current); };
  }, [title, content, selTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cmd/Ctrl + S
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (pendingSave.current) clearTimeout(pendingSave.current);
        performSave(title, content, selTags);
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [title, content, selTags, performSave]);

  const handleBack = useCallback(async () => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    if (pendingSave.current) { clearTimeout(pendingSave.current); pendingSave.current = null; }
    await performSave(title, content, selTags);
    onBack();
  }, [title, content, selTags, performSave, onBack]);

  const cycleMode = () => setMode((m) => MODE_META[m].next);

  const showWrite   = mode === 'write' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';
  const previewHtml = showPreview ? marked.parse(content || '*Sin contenido*') : '';

  return (
    <div className="nev" data-mode={mode}>

      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="nev__topbar">
        <button className="nev__back" onClick={handleBack} aria-label="Volver a notas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Notas</span>
        </button>

        <div className="nev__status" aria-live="polite">
          {saving && <span className="nev__saving"><span className="nev__dot" /> Guardando</span>}
          {saved && !saving && <span className="nev__saved">✓ Guardado</span>}
        </div>

        <button
          className={`nev__mode-btn nev__mode-btn--${MODE_META[mode].next}`}
          onClick={cycleMode}
          aria-label={MODE_META[mode].label}
          title={MODE_META[mode].label}
        >
          {MODE_META[mode].icon}
          <span>{MODE_META[mode].label}</span>
        </button>
      </div>

      {/* ── Meta: title + tags ──────────────────────────────────────────── */}
      <div className="nev__meta">
        <label htmlFor={titleId} className="visually-hidden">Título</label>
        <input
          id={titleId}
          className="nev__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sin título"
          autoComplete="off"
        />
        <TagInput
          availableTags={tags}
          selectedTags={selTags}
          onChange={setSelTags}
          onCreate={onCreateTag}
        />
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="nev__body">

        {/* Write pane */}
        {showWrite && (
          <div className="nev__write-pane">
            <EditorToolbar textareaRef={textareaRef} onContentChange={setContent} />
            <textarea
              ref={textareaRef}
              className="nev__textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={'Escribe aquí…\n\nUsa # encabezados, **negrita**, *itálica*, - listas'}
              spellCheck
              autoCapitalize="sentences"
            />
          </div>
        )}

        {/* Preview pane */}
        {showPreview && (
          <div
            className="nev__preview-pane"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}

      </div>
    </div>
  );
}
