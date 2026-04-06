import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { EASTER_EGGS } from '../eastereggs';

export const EasterEggExtension = Extension.create({
  name: 'easterEgg',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('easterEgg'),
        state: {
          init(_, { doc }) {
            return getDecorations(doc);
          },
          apply(transaction, oldState) {
            return transaction.docChanged ? getDecorations(transaction.doc) : oldState;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

function getDecorations(doc) {
  const decorations = [];

  doc.descendants((node, pos) => {
    // Only target text nodes
    if (node.isText && node.text) {
      Object.entries(EASTER_EGGS).forEach(([word, color]) => {
        // Find exact words isolated by word boundaries (\b) ignoring case
        const regex = new RegExp(`\\b(${word})\\b`, 'gi');
        let match;
        while ((match = regex.exec(node.text)) !== null) {
          const start = pos + match.index;
          const end = start + match[0].length;

          decorations.push(
            Decoration.inline(start, end, {
              style: `color: ${color}; font-weight: 700; text-shadow: 0 0 8px ${color}55;`,
              class: 'easter-egg-match'
            })
          );
        }
      });
    }
  });

  return DecorationSet.create(doc, decorations);
}
