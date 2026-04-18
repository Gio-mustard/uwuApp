import './PdfThemeCard.css';

/**
 * @param {{
 *   preview: { bg: string, text: string, accent: string, header: string, align?: string },
 *   label?: string,
 *   title: string,
 *   contentHtml?: string,
 *   contentNode?: React.ReactNode,
 *   active?: boolean,
 *   isMassive?: boolean,
 *   onClick?: () => void,
 *   onDelete?: () => void
 * }} props
 */
export function PdfThemeCard({
  preview,
  label,
  title,
  contentHtml,
  contentNode,
  active = false,
  isMassive = false,
  onClick,
  onDelete,
}) {
  const Component = onClick ? 'button' : 'div';
  
  let className = 'pdf-theme-card';
  if (active) className += ' pdf-theme-card--active';
  if (isMassive) className += ' pdf-theme-card--massive';
  if (onDelete) className += ' pdf-theme-card--custom';

  const defaultPreview = { bg: '#fff', text: '#000', accent: '#000', header: 'transparent', align: 'left', ...preview };

  return (
    <Component
      className={className}
      onClick={onClick}
      style={{
        backgroundColor: defaultPreview.bg,
        color: defaultPreview.text,
        boxShadow: active ? '0 0 0 2px var(--color-primary)' : 'none',
        borderColor: active ? 'transparent' : 'var(--color-border)'
      }}
    >
      <div 
        className="pdf-theme-card__mini" 
        style={{ 
          alignItems: defaultPreview.align === 'center' ? 'center' : 'flex-start', 
          textAlign: defaultPreview.align || 'left',
          backgroundColor: defaultPreview.bg
        }}
      >
        <div className="pdf-theme-card__header" style={{ borderBottomColor: defaultPreview.header }}>
          <div className="pdf-theme-card__fake-title" style={{ color: defaultPreview.accent }}>
          {title}
        </div>
        </div>
        
        
        {contentHtml ? (
          <div 
            className="pdf-theme-card__fake-text" 
            dangerouslySetInnerHTML={{ __html: contentHtml }}
            style={{ color: defaultPreview.text }}
          />
        ) : (
          <div className="pdf-theme-card__fake-text" style={{ color: defaultPreview.text }}>
            {contentNode}
          </div>
        )}
      </div>

      {label && (
        <div className="pdf-theme-card__label">
          {label}
        </div>
      )}

      {onDelete && (
        <button 
          className="pdf-theme-card__delete" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Eliminar Estilo"
        >
          ×
        </button>
      )}
    </Component>
  );
}
