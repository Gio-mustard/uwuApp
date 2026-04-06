/**
 * @fileoverview NoteEditorView — Mobile-first note editor with 4 modes.
 *
 * Modes (cycled by the top-right button):
 *  write   → plain textarea  +  minimal markdown toolbar
 *  split   → textarea (left/top) + live HTML preview (right/bottom)
 *  wysiwyg → Tiptap WYSIWYG: inline rendering while writing (Notion-style)
 *  preview → read-only rendered HTML view
 *
 * Auto-save: debounce 800 ms on any content change + flush on back navigation.
 * Markdown storage: content is always persisted as a markdown string.
 */

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import Placeholder from '@tiptap/extension-placeholder';
import { marked, Marked } from 'marked';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { TagInput } from './TagInput';
import { EDITOR_MODES, MODE_META } from './NoteEditorConstants';
import { EasterEggExtension } from './extensions/EasterEggExtension';
import { getEasterEggMarkedExtension } from './eastereggs';
import { exportNoteToPDF } from '../../services/NotesService';
import './NoteEditorView.css';

const AUTOSAVE_DELAY = 200;

// Isolated marked instance for rendering pure previews without tiptap's tokenizer pollution
const editorMarked = new Marked({ breaks: true, gfm: true });
editorMarked.use({ extensions: [getEasterEggMarkedExtension()] });

// ─── Shared toolbar actions (for write/split panes) ───────────────────────────
const WRITE_ACTIONS = [
  { id: 'bold',   title: 'Negrita',    label: 'B',  style: 'bold',   apply: (s) => `**${s || 'texto'}**` },
  { id: 'italic', title: 'Itálica',    label: 'I',  style: 'italic', apply: (s) => `*${s || 'texto'}*` },
  { id: 'h2',     title: 'Encabezado', label: 'H',  apply: (s) => `## ${s || 'Título'}`, linePrefix: true },
  { id: 'ul',     title: 'Lista',      label: '≡',  apply: (s) => `- ${s || 'ítem'}`, linePrefix: true },
  { id: 'code',   title: 'Código',     label: '<>', apply: (s) => `\`${s || 'código'}\`` },
  { id: 'quote',  title: 'Cita',       label: '❝', apply: (s) => `> ${s || 'cita'}`, linePrefix: true },
  { id: 'hr',     title: 'Separador',  label: '—',  apply: () => '\n---\n' },
  { id: 'link',   title: 'Enlace',     label: '⎘',  apply: (s) => `[${s || 'texto'}](url)` },
];

// ─── Write-mode toolbar (inserts markdown syntax in textarea) ─────────────────
function WriteToolbar({ textareaRef, onContentChange }) {
  const apply = useCallback((action) => {
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
      {WRITE_ACTIONS.map((a) => (
        <button
          key={a.id}
          className={`nev-toolbar__btn${a.style ? ` nev-toolbar__btn--${a.style}` : ''}`}
          title={a.title}
          aria-label={a.title}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); apply(a); }}
          onTouchStart={(e) => { e.preventDefault(); apply(a); }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ─── WYSIWYG toolbar (uses Tiptap chain commands) ─────────────────────────────
const WYSIWYG_ACTIONS = [
  { id: 'bold',    title: 'Negrita',    label: 'B',  style: 'bold',   cmd: (e) => e.chain().focus().toggleBold().run() },
  { id: 'italic',  title: 'Itálica',    label: 'I',  style: 'italic', cmd: (e) => e.chain().focus().toggleItalic().run() },
  { id: 'strike',  title: 'Tachado',    label: 'S̶',  cmd: (e) => e.chain().focus().toggleStrike().run() },
  { id: 'h2',      title: 'Encabezado', label: 'H2', cmd: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive('heading', { level: 2 }) },
  { id: 'h3',      title: 'Subtítulo',  label: 'H3', cmd: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive('heading', { level: 3 }) },
  { id: 'ul',      title: 'Lista',      label: '≡',  cmd: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
  { id: 'ol',      title: 'Lista núm.', label: '1.', cmd: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
  { id: 'code',    title: 'Código',     label: '<>', cmd: (e) => e.chain().focus().toggleCode().run(), active: (e) => e.isActive('code') },
  { id: 'quote',   title: 'Cita',       label: '❝', cmd: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
  { id: 'hr',      title: 'Separador',  label: '—',  cmd: (e) => e.chain().focus().setHorizontalRule().run() },
];

function WysiwygToolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="nev-toolbar" role="toolbar" aria-label="Formato">
      {WYSIWYG_ACTIONS.map((a) => {
        const isActive = a.active ? a.active(editor) : editor.isActive(a.id);
        return (
          <button
            key={a.id}
            className={`nev-toolbar__btn${a.style ? ` nev-toolbar__btn--${a.style}` : ''}${isActive ? ' nev-toolbar__btn--on' : ''}`}
            title={a.title}
            aria-label={a.title}
            aria-pressed={isActive}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); a.cmd(editor); }}
            onTouchStart={(e) => { e.preventDefault(); a.cmd(editor); }}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── WYSIWYG Pane (Tiptap editor) ────────────────────────────────────────────
/**
 * Isolated component so useEditor lifecycle matches the wysiwyg pane mount.
 * iniContent is readonly after mount — changes come out via onUpdate only.
 */
function WysiwygPane({ initialContent, onContentChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
      Markdown.configure({
        html: false,
        tightLists: false,
        bulletListMarker: '-',
        breaks: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Placeholder.configure({
        placeholder: 'Escribe tu nota aquí… Usa # encabezados, **negrita**, - listas',
        emptyNodeClass: 'nev-wysiwyg__placeholder',
      }),
      EasterEggExtension,
    ],
    content: initialContent,
    contentType: 'markdown',
    onUpdate({ editor }) {
      try {
        const md = editor.getMarkdown();
        onContentChange(md);
      } catch (e) {
        console.error("Markdown serialization error:", e);
      }
    },
    editorProps: {
      attributes: {
        class: 'nev__wysiwyg-content',
        spellcheck: 'true',
        autocapitalize: 'sentences',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      window.tiptapEditor = editor;
    }
    return () => { window.tiptapEditor = null; };
  }, [editor]);

  return (
    <div className="nev__wysiwyg-pane">
      <WysiwygToolbar editor={editor} />
      <div className="nev__wysiwyg-scroll">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}


// ─── Main component ───────────────────────────────────────────────────────────
export function NoteEditorView({ 
  note, 
  onBack, 
  onSave, 
  tags, 
  onCreateTag,
  availableModes = Object.values(EDITOR_MODES),
  initialMode
}) {
  const titleId = useId();

  const startMode = initialMode && availableModes.includes(initialMode) ? initialMode : availableModes[0];

  const [title,   setTitle]   = useState(note?.title   ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [selTags, setSelTags] = useState(note?.tags    ?? []);
  const [mode,    setMode]    = useState(startMode);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const savedNoteRef = useRef(note ?? null);
  const pendingSave  = useRef(null);
  const isLeaving    = useRef(false);
  const textareaRef  = useRef(null);

  // Reset state when note prop changes
  useEffect(() => {
    isLeaving.current = false;
    setTitle(note?.title   ?? '');
    setContent(note?.content ?? '');
    setSelTags(note?.tags   ?? []);
    setMode(startMode);
    setSaved(false);
    savedNoteRef.current = note ?? null;
  }, [note?.id, startMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Save ──────────────────────────────────────────────────────────────────
  const performSave = useCallback(async (t, c, tg) => {
    if (!t.trim() && !c.trim()) return;

    const prev = savedNoteRef.current;
    if (prev && prev.title === t && prev.content === c && JSON.stringify(prev.tags) === JSON.stringify(tg)) {
      // Bailout if absolutely nothing changed
      return;
    }

    setSaving(true);
    try {
      const result = await onSave({
        id:      prev?.id ?? null,
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

  const handleBack = useCallback(async () => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    if (pendingSave.current) { clearTimeout(pendingSave.current); pendingSave.current = null; }
    await performSave(title, content, selTags);
    onBack();
  }, [title, content, selTags, performSave, onBack]);

  const handleExportPDF = useCallback(() => {
    const htmlContent = editorMarked.parse(content || '*Sin contenido*');
    exportNoteToPDF(title, htmlContent);
  }, [title, content]);

  // Global keydown listeners for shortcuts
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (pendingSave.current) clearTimeout(pendingSave.current);
        performSave(title, content, selTags);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [title, content, selTags, performSave, handleBack]);

  const cycleMode = () => setMode((m) => {
    const idx = availableModes.indexOf(m);
    return availableModes[(idx + 1) % availableModes.length] || availableModes[0];
  });

  const nextModeIndex = (availableModes.indexOf(mode) + 1) % availableModes.length;
  const nextMode = availableModes[nextModeIndex] || mode;

  const showWrite   = mode === EDITOR_MODES.WRITE || mode === EDITOR_MODES.SPLIT;
  const showHtmlPre = mode === EDITOR_MODES.PREVIEW || mode === EDITOR_MODES.SPLIT;
  const previewHtml = showHtmlPre ? editorMarked.parse(content || '*Sin contenido*') : '';

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
          className="nev__mode-btn"
          onClick={handleExportPDF}
          title="Exportar a PDF"
          aria-label="Exportar a PDF"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden-mobile">PDF</span>
        </button>

        {availableModes.length > 1 && (
          <button
            className="nev__mode-btn"
            onClick={cycleMode}
            aria-label={MODE_META[nextMode]?.label}
            title={`Cambiar a: ${MODE_META[nextMode]?.label}`}
          >
            {MODE_META[nextMode]?.icon}
            <span>{MODE_META[nextMode]?.label}</span>
          </button>
        )}
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

        {/* Write pane (raw markdown textarea) */}
        {showWrite && (
          <div className="nev__write-pane">
            <WriteToolbar textareaRef={textareaRef} onContentChange={setContent} />
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

        {/* HTML Preview pane */}
        {showHtmlPre && (
          <div
            className="nev__preview-pane"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        )}

        {/* WYSIWYG pane — remounted when switching into wysiwyg mode */}
        {mode === EDITOR_MODES.WYSIWYG && (
          <WysiwygPane
            key={`wysiwyg-${note?.id ?? 'new'}`}
            initialContent={content}
            onContentChange={setContent}
          />
        )}

      </div>
    </div>
  );
}
