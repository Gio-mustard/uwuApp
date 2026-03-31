import { useState } from 'react';
import TimePickerWheel from './TimePickerWheel';
import './TimePicker.css';

/**
 * TimePicker — Button that displays the selected time and opens a custom
 * scroll wheel (TimePickerWheel) compatible with iOS and Android.
 *
 * @param {{
 *   id?: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   placeholder?: string,
 * }} props
 */
export default function TimePicker({ id, value, onChange, placeholder = 'Sin hora' }) {
  const [open, setOpen] = useState(false);

  /** "HH:MM" → "H:MM AM/PM" */
  const formatDisplay = (val) => {
    if (!val) return null;
    const [hStr, mStr] = val.split(':');
    const h      = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12    = h % 12 || 12;
    return `${h12}:${mStr} ${period}`;
  };

  const display = formatDisplay(value);

  const handleConfirm = (newValue) => {
    onChange(newValue);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <>
      <button
        id={id}
        type="button"
        className={`time-picker-btn${display ? ' time-picker-btn--has-value' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Select time"
      >
        {/* Clock icon */}
        <span className="time-picker-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </span>

        <span className="time-picker-value">
          {display ?? <span className="time-picker-placeholder">{placeholder}</span>}
        </span>

        {display && (
          <span className="time-picker-clear" onClick={handleClear} aria-label="Clear time">
            ✕
          </span>
        )}
      </button>

      {open && (
        <TimePickerWheel
          initialValue={value}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
