import { useState, useEffect } from 'react';
import { saveCustomStyle, deleteCustomStyle, getCustomStyles } from '../../services/pdf/CustomPdfStyles.js';
import { Modal } from '../modals/Modal';
import { PlusIcon } from '../common/Icons';
import { PdfThemeCard } from '../notes/PdfThemeCard';
import './CustomPdfStyleBuilder.css';

export function CustomPdfStyleBuilder() {
  const [styles, setStyles] = useState([]);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const [name, setName] = useState('');
  const [bg, setBg] = useState('#ffffff');
  const [text, setText] = useState('#334155');
  const [accent, setAccent] = useState('#e85d5d');

  useEffect(() => {
    setStyles(getCustomStyles());
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    
    const id = 'custom-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const newStyle = { id, name: name.trim(), bg, text, accent };
    saveCustomStyle(newStyle);
    setStyles(getCustomStyles());
    setName('');
    setIsBuilderOpen(false);
  };

  const handleDelete = (id) => {
    deleteCustomStyle(id);
    setStyles(getCustomStyles());
  };

  return (
    <div className="custom-pdf-styles">
      {/* Grid of existing custom styles */}
      <div className="custom-pdf-styles__list">
        <div className="pdf-picker__grid">
          {/* Create Button Card */}
          <button 
            className="pdf-theme-card pdf-theme-card--create"
            onClick={() => setIsBuilderOpen(true)}
          >
            <div className="pdf-theme-card__create-icon">
              <PlusIcon />
            </div>
            <div className="pdf-theme-card__label" style={{ borderTop: 'none' }}>Nuevo Estilo</div>
          </button>

          {styles.map(style => (
            <PdfThemeCard
              key={style.id}
              preview={{ bg: style.bg, text: style.text, accent: style.accent, header: style.accent + '40' }}
              label={style.name}
              title="Título"
              contentNode="Texto texto..."
              onDelete={() => handleDelete(style.id)}
            />
          ))}
        </div>
      </div>

      <Modal 
        useDrawer 
        open={isBuilderOpen} 
        onClose={() => setIsBuilderOpen(false)}
        drawerContentClass="pdf-builder-drawer vaul-drawer__content"
      >
        <div className="pdf-builder-drawer__body">
          {/* Big Live Preview */}
          <div className="pdf-builder-drawer__preview-pane">
            <PdfThemeCard
              isMassive
              preview={{ bg, text, accent, header: accent + '40' }}
              title={name || 'Título de Muestra'}
              contentNode={(
                <>
                  <p style={{ margin: 0, paddingBottom: '4px' }}>Este es un vistazo a escala de tu documento.</p>
                  <p style={{ margin: 0 }}>Modifica los colores abajo para verlo cambiar dinámicamente.</p>
                </>
              )}
            />
          </div>

          {/* Controls at the bottom */}
          <div className="pdf-builder-drawer__controls">
            <h2 className="pdf-builder-drawer__title">Configurar Estilo</h2>
            
            <div className="pdf-builder-form">
              <div className="pdf-builder-group">
                <label>Nombre del Estilo</label>
                <input 
                  type="text" 
                  placeholder="Ej. Tema Oscuro" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="pdf-builder-input"
                />
              </div>
              
              <div className="pdf-builder-colors">
                <div className="pdf-builder-group">
                  <label>Fondo</label>
                  <input type="color" value={bg} onChange={e => setBg(e.target.value)} />
                </div>
                <div className="pdf-builder-group">
                  <label>Texto</label>
                  <input type="color" value={text} onChange={e => setText(e.target.value)} />
                </div>
                <div className="pdf-builder-group">
                  <label>Acento</label>
                  <input type="color" value={accent} onChange={e => setAccent(e.target.value)} />
                </div>
                
                <div className="pdf-builder-actions">
                  <button 
                    className="btn-primary pdf-builder-save" 
                    onClick={handleSave} 
                    disabled={!name.trim()}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
