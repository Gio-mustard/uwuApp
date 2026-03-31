import { useRef } from 'react';
import './TimePicker.css';

/**
 * TimePicker — Muestra la hora seleccionada como texto y abre el
 * selector nativo del navegador al picarle al botón.
 *
 * @param {{
 *   id?: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 * }} props
 */
export default function TimePicker({ id, value, onChange, placeholder = 'Sin hora' }) {
  const inputRef = useRef(null);

  const handleOpen = () => {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    } else {
      input.focus();
    }
  };

  /** Formatea "HH:MM" a "HH:MM AM/PM" para mostrar al usuario */
  const formatDisplay = (val) => {
    if (!val) return null;
    const [hStr, mStr] = val.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${period}`;
  };

  const display = formatDisplay(value);

  return (
    <button
      id={id}
      type="button"
      className={`time-picker-btn${display ? ' time-picker-btn--has-value' : ''}`}
      onClick={handleOpen}
      aria-label="Seleccionar hora"
    >
      {/* Input nativo oculto — actúa como fuente de verdad */}
      <input
        ref={inputRef}
        type="time"
        value={value}
        className="time-picker-hidden-input"
        onChange={(e) => onChange(e.target.value)}
      />

      <span className="time-picker-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </span>

      <span className="time-picker-value">
        {display ?? <span className="time-picker-placeholder">{placeholder}</span>}
      </span>

      {display && (
        <span
          className="time-picker-clear"
          role="button"
          aria-label="Borrar hora"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
        >
          ✕
        </span>
      )}
    </button>
  );
}
