/**
 * @fileoverview DaySelector — Horizontal row of day-of-week pill buttons.
 *
 * Highlights today in the primary color. The selected day (which may differ
 * from today when viewing a past day's tasks) is shown with a ring/bold style.
 */

import { ALL_DAYS, DAY_LABELS } from '../../domain/enums/DayOfWeek';
import './DaySelector.css';

/**
 * @param {{
 *   selectedDay: number,
 *   todayDay: number,
 *   onSelect: (day: number) => void
 * }} props
 */
export function DaySelector({ selectedDay, todayDay, onSelect }) {
  return (
    <div className="day-selector" role="group" aria-label="Selector de día">
      {ALL_DAYS.map((day) => {
        const isToday = day === todayDay;
        const isSelected = day === selectedDay;
        return (
          <button
            key={day}
            id={`day-btn-${day}`}
            className={[
              'day-selector__pill',
              isToday ? 'day-selector__pill--today' : '',
              isSelected && !isToday ? 'day-selector__pill--selected' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onSelect(day)}
            aria-pressed={isSelected}
            aria-label={DAY_LABELS[day]}
          >
            {DAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
