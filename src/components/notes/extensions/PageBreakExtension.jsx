/**
 * @fileoverview TipTap extension for page-break nodes.
 *
 * • Serializes to `<div data-page-break="true"></div>` in markdown storage.
 * • Parses back from that HTML tag when loading (requires html:true in Markdown).
 * • Renders a clickable NodeView in the editor — click to delete.
 * • Applies page-break-before: always at print / PDF time.
 */

import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';


// ─── React view rendered inside the editor ────────────────────────────────────
function PageBreakView({ deleteNode, selected }) {
  return (
    <NodeViewWrapper contentEditable={false}>
      <div
        className={`nev-page-break${selected ? ' nev-page-break--selected' : ''}`}
        data-page-break="true"
      >
        <span className="nev-page-break__label" title="Clic para eliminar salto de página">Nueva página</span>
        <span className="nev-page-break__delete"  onClick={()=>{
          deleteNode()
          }}>✕</span>
      </div>
    </NodeViewWrapper>
  );
}

// ─── Extension definition ─────────────────────────────────────────────────────
export const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  atom: true,

  
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML({ HTMLAttributes }) {
    HTMLAttributes.class = 'html2pdf__page-break'
    return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true' })];
  },

  
  addNodeView() {
    return ReactNodeViewRenderer(PageBreakView);
  },

  /**
   * Markdown serialization.
   * @tiptap/extension-markdown reads storage.markdown.serialize to know
   * how to turn this node into a markdown string.
   * We output raw HTML so that it round-trips when html:true is set.
   */
  addStorage() {
    return {
      markdown: {
        serialize(state, node) {
          state.write('<div data-page-break="true" class="html2pdf__page-break"></div>');
          state.closeBlock(node);
        },
      },
    };
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain }) =>
          chain().insertContent({ type: this.name }).run(),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\/page\s$/,
        type: this.type,
      }),
    ];
  },

  addKeyboardShortcuts() {
    // prosemirror-keymap convention
    return {
      'Mod-Enter': () => this.editor.commands.insertPageBreak(),
    };
  },
});
