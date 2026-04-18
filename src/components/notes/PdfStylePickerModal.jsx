import { useState, useEffect } from 'react';
import { Modal } from '../modals/Modal';
import { pdfPageStyleRegistry } from '../../services/pdf';
import { marked } from 'marked';
import { PdfThemeCard } from './PdfThemeCard';
import './PdfStylePickerModal.css';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onExport: (themeName: string) => void,
 *   noteTitle: string,
 *   noteContent: string,
 *   noteId: string | null
 * }} props
 */
export function PdfStylePickerModal({
  open,
  onClose,
  onExport,
  noteTitle,
  noteContent,
  noteId,
}) {
  const [themes, setThemes] = useState([]);
  const [selected, setSelected] = useState('default');

  useEffect(() => {
    if (open) {
      setThemes(pdfPageStyleRegistry.getAll());
      
      // Load preference from localStorage
      if (noteId) {
        const saved = localStorage.getItem(`pdf-theme:${noteId}`);
        if (saved && pdfPageStyleRegistry.getMeta(saved)) {
          setSelected(saved);
        } else {
          setSelected('default');
        }
      } else {
        setSelected('default');
      }
    }
  }, [open, noteId]);

  const handleExport = () => {
    if (noteId) {
      localStorage.setItem(`pdf-theme:${noteId}`, selected);
    }
    onExport(selected);
    onClose();
  };

  const titleSnippet = noteTitle ? noteTitle.slice(0, 25) + (noteTitle.length > 25 ? '...' : '') : 'Sin título';
  
  // Parse markdown securely into HTML for the preview snippet
  const parsedHtml = marked.parse(noteContent?.slice(0, 500) || '*Aún no has escrito nada en esta nota...*');

  return (
    <Modal
      useDrawer
      open={open}
      onClose={onClose}      
    >
      <div className="pdf-picker__body">
        <h2 className="pdf-picker__title">Exportar a PDF</h2>
        <p className="pdf-picker__desc">Elige un estilo visual para tu documento.</p>

        <div className="pdf-picker__grid">
          {themes.map((theme) => {
            const isSelected = selected === theme.name;
            const preview = theme.preview || { bg: '#fff', text: '#000', accent: '#000', header: 'transparent' };
            
            return (
              <PdfThemeCard
                key={theme.name}
                preview={preview}
                label={theme.label || theme.name}
                title={titleSnippet}
                contentHtml={parsedHtml}
                active={isSelected}
                onClick={() => setSelected(theme.name)}
              />
            );
          })}
        </div>

        <footer className="pdf-picker__footer">
          <button className="btn-primary pdf-picker__btn" onClick={handleExport}>
            Exportar PDF
          </button>
          <button className="pdf-picker__cancel" onClick={onClose}>
            Cancelar
          </button>
        </footer>
      </div>
    </Modal>
  );
}
