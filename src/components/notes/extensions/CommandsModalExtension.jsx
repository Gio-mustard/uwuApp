import { useState, useEffect, useRef } from 'react';
import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Modal } from '../../modals/Modal';
import editor_commands from './commands';
import "./commandsModalExtension.css"

// ─── React view rendered inside the editor ────────────────────────────────────
function CommandsModalView({ editor, deleteNode }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null);

    const handleCommand = (commandFn) => {
        deleteNode();
        if (commandFn) commandFn(editor);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % editor_commands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + editor_commands.length) % editor_commands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                handleCommand(editor_commands[selectedIndex].action);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                deleteNode();
            }
        };

        // Usamos capture (true) para evitar que Tiptap atrape las flechas
        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [selectedIndex, editor, deleteNode]);

    useEffect(() => {
        if (listRef.current) {
            const selectedButton = listRef.current.children[selectedIndex];
            if (selectedButton) {
                selectedButton.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    return (
        <NodeViewWrapper className="commands-modal-node" style={{ display: 'inline-block' }}>
            <span style={{ opacity: 0.5 }}>/</span>

            <Modal
                overlayClass='commads-modal-view-overlay'
                sheetClass='commads-modal-view'
                open={true}
                onClose={() => deleteNode()}
            >
                <div style={{  display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 35%', color: 'var(--color-text, #1a1a1a)' }}>
                        Comandos
                    </h2>
                    <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {editor_commands.map((cmd, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`btn-command ${selectedIndex === i ? 'selected' : ''}`}
                                onMouseEnter={() => setSelectedIndex(i)}
                                onClick={() => handleCommand(cmd.action)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color, #eee)',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            >
                                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{cmd.title}</span>
                                <span style={{ fontSize: '13px', marginTop: '4px' }}>{cmd.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </NodeViewWrapper>
    );
}

// ─── Extension definition ─────────────────────────────────────────────────────
export const CommandsModal = Node.create({
    name: 'commandsModal',
    group: 'block',
    atom: true,

    parseHTML() {
        return [{ tag: 'div[data-commands-modal]' }];
    },

    renderHTML({ HTMLAttributes }) {
        HTMLAttributes.class = 'commands-modal-wrapper';
        return ['div', mergeAttributes(HTMLAttributes, { 'data-commands-modal': 'true' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(CommandsModalView);
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: /^\/\s$/,
                type: this.type,
            }),
        ];
    },
});
