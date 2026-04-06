# NoteEditorView Documentation

`NoteEditorView` is a mobile-first, highly configurable Markdown editor designed for UwuApp. It supports multiple distinct modes of interacting with markdown content.

## Editor Modes
The editor supports the following modes, driven by the constants exported in `NoteEditorConstants.jsx`:
- **WYSIWYG** (`EDITOR_MODES.WYSIWYG`): A Notion-style rich-text editor powered by **Tiptap**. Markdown formatting (like `**bold**` or `- list`) is processed and rendered inline as you type, creating a polished writing experience.
- **Write** (`EDITOR_MODES.WRITE`): A raw Markdown `textarea` with a simple formatting toolbar.
- **Split** (`EDITOR_MODES.SPLIT`): A side-by-side (desktop) or vertically stacked (mobile) view showing the raw Markdown editor and a live HTML rendering simultaneously.
- **Preview** (`EDITOR_MODES.PREVIEW`): A read-only mode that renders the Markdown as clean HTML using `marked`.

## Props Reference

- `note`: Object containing at least `title`, `content` (a markdown string), and `tags`. Omit or pass `null` for a brand new note.
- `onBack`: `() => void`. Triggered when the user clicks the back button.
- `onSave`: `async (note) => void`. Function that securely persists changes. The editor automatically debounces keystrokes and saves silently.
- `tags`: Array of all available user tags (used for dropdown auto-suggestions).
- `onCreateTag`: `async (tagData) => void`. Function to handle instantiation of a new tag if the user creates one from the editor's tag input.
- `availableModes`: (Optional) Array of `EDITOR_MODES` dictating which modes the user can toggle between. Defaults to all 4 available modes.
- `initialMode`: (Optional) String denoting which mode to default to when the editor initially mounts. Falls back to the first element in `availableModes`.

---

## 💻 Example Usage

You can embed the `NoteEditorView` within any container to give users rich note-taking abilities. 

### 1. Full Editor Experience (All Modes)
By default, all modes are available. The user will see a toggle button in the top right to switch dynamically between WYSIWYG, Split, Write, and Preview.

```jsx
import { NoteEditorView } from '../../components/notes/NoteEditorView';

export function FullNotesFeature({ activeNote, goBack, performSave, existingTags, createTag }) {
  return (
    <NoteEditorView
      note={activeNote}
      onBack={goBack}
      onSave={performSave}
      tags={existingTags}
      onCreateTag={createTag}
    />
  );
}
```

### 2. Restricted to WYSIWYG (Notion-Style Only)
If you configure an array containing a single mode via `availableModes`, the editor hides the mode toggle button entirely. This enforces a consistent interface, ideal for simpler apps or inline task descriptions.

```jsx
import { NoteEditorView } from '../../components/notes/NoteEditorView';
import { EDITOR_MODES } from '../../components/notes/NoteEditorConstants';

export function SimpleNoteWidget({ activeNote, goBack, performSave, existingTags, createTag }) {
  return (
    <NoteEditorView
      note={activeNote}
      onBack={goBack}
      onSave={performSave}
      tags={existingTags}
      onCreateTag={createTag}
      availableModes={[EDITOR_MODES.WYSIWYG]}
      initialMode={EDITOR_MODES.WYSIWYG}
    />
  );
}
```

## Internal Serialization (Developer Note)
Under the hood, all active modes funnel into a unified internal React `content` state. Regardless of whether the user edits visually via Tiptap (`WysiwygPane`) or manually types code in the Split view textarea, **the ultimate source of truth is always standard Markdown**. 

The WYSIWYG pane parses Markdown initialization via `marked`, and delegates DOM mutations entirely to Tiptap core extensions (like `StarterKit` and `TaskItem`). Every keystroke in the editor dynamically leverages Tiptap's markdown serializer (`editor.getMarkdown()`) to update the React state.
