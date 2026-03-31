import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ITEM_HEIGHT = 52;
const VISIBLE = 5;
const PADDING_BOTTOM_TOP = ITEM_HEIGHT * Math.floor(VISIBLE / 2);
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function WheelColumn({ items, value, onChange }) {
  const ref = useRef(null);
  const debounce = useRef(null);
  const didMount = useRef(false);


  useLayoutEffect(() => {
    if (!ref.current) return;
    const idx = items.indexOf(value);
    ref.current.scrollTop = (idx < 0 ? 0 : idx) * ITEM_HEIGHT;
    didMount.current = true;
  }, []);


  useEffect(() => {
    if (!didMount.current || !ref.current) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    ref.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' });
  }, [value, items]);

  const handleScroll = () => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      ref.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      onChange(items[clamped]);
    }, 80);
  };

  return (
    <div className="tpw-col-wrap">
      {/* Gradients*/}
      <div className="tpw-fade tpw-fade--top" />
      <div className="tpw-fade tpw-fade--bottom" />
      
      <div className="tpw-highlight" />
      
      <div
        ref={ref}
        className="tpw-column"
        onScroll={handleScroll}
      >
        <div style={{ height: PADDING_BOTTOM_TOP, flexShrink: 0 }} />
        {items.map((item) => (
          <div
            key={item}
            className={`tpw-item${item === value ? ' tpw-item--active' : ''}`}
          >
            {item}
          </div>
        ))}
        <div style={{ height: PADDING_BOTTOM_TOP, flexShrink: 0 }} />
      </div>
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────────────── */
/**
 * @param {{
 *  initialValue: string,   // "HH:MM" formato 24h
 *  onConfirm: (val: string) => void,
 *  onCancel: () => void,
 * }} props
 */
export default function TimePickerWheel({ initialValue, onConfirm, onCancel }) {
  /** Parse "HH:MM" → { h, m, p } to 12h format */
  const parse = (val) => {
    if (!val) return { h: '12', m: '00', p: 'AM' };
    const [hStr, mStr] = val.split(':');
    const h24 = parseInt(hStr, 10);
    const p = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return { h: String(h12).padStart(2, '0'), m: mStr ?? '00', p };
  };

  const init = parse(initialValue);
  const [hour, setHour] = useState(init.h);
  const [minute, setMinute] = useState(init.m);
  const [period, setPeriod] = useState(init.p);

  const handleConfirm = () => {
    let h = parseInt(hour, 10);
    if (period === 'AM' && h === 12) h = 0;
    if (period === 'PM' && h !== 12) h += 12;
    onConfirm(`${String(h).padStart(2, '0')}:${minute}`);
  };

  return createPortal(
    <div className="tpw-backdrop" onClick={onCancel}>
      <div className="tpw-sheet" onClick={(e) => e.stopPropagation()}>

        <header className="tpw-header">
          <span className="tpw-title">Hora sugerida</span>
        </header>

        {/* wheels */}
        <div className="tpw-wheels">
          <WheelColumn items={HOURS} value={hour} onChange={setHour} />
          <span className="tpw-colon">:</span>
          <WheelColumn items={MINUTES} value={minute} onChange={setMinute} />

          {/* AM / PM */}
          <div className="tpw-period">
            {['AM', 'PM'].map((p) => (
              <button
                key={p}
                type="button"
                className={`tpw-period-btn${period === p ? ' tpw-period-btn--active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <footer className="tpw-actions">
          <button type="button" className="tpw-btn tpw-btn--cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="tpw-btn tpw-btn--confirm" onClick={handleConfirm}>
            Listo
          </button>
        </footer>

      </div>
    </div>,
    document.body
  );
}
