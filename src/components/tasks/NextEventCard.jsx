/**
 * @fileoverview NextEventCard — Card that displays the next upcoming (or most
 * recently overdue) task with its suggested time.
 *
 * When `is_overdue` is true the card adopts a warm amber style and shows a
 * pulsing "ATRASADA" badge to alert the user.
 */

import { formatTime12h } from '../../utils/timeUtils';
import { HOME_TEXTS } from '../../constants/texts/home.texts';
import './NextEventCard.css';

/**
 * @param {{
 *   task: import('../../domain/models/DailyTask').DailyTask | import('../../domain/models/WeeklyTask').WeeklyTask,
 *   is_overdue?: boolean
 * }} props
 */
export function NextEventCard({ task, is_overdue = false }) {
  if (!task) return null;

  return (
    <section className="home-section next-event-section" aria-label={is_overdue ? 'Tarea atrasada' : 'Siguiente evento'}>
      <div className={`next-event-card${is_overdue ? ' overdue' : ''}`}>

        {/* Badge row */}
        <div className={`next-event-card__badge${is_overdue ? ' overdue' : ''}`}>
          {is_overdue ? HOME_TEXTS.nextEventBadge : HOME_TEXTS.nextEventBadge}
          {is_overdue && (
            <span className="next-event-card__overdue-label" aria-label="Tarea atrasada">
              <span className="next-event-card__overdue-dot" aria-hidden="true" />
              ATRASADA
            </span>
          )}
        </div>

        {/* Body */}
        <div className="next-event-card__body">
          <div className="next-event-card__left">

            {/* Clock icon + time pill */}
            <div className={`next-event-card__icon${is_overdue ? ' overdue' : ''}`} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
              <div className="next-event-card__time-pill">
                {formatTime12h(task.suggestedTime) ?? '—'}
              </div>
            </div>

            {/* Title + meta */}
            <div className="next-event-card__info">
              <span className="next-event-card__name">{task.title}</span>
              <span className="next-event-card__meta">
                {task.description || (task.type === 'daily'
                  ? HOME_TEXTS.nextEventDailyMeta
                  : HOME_TEXTS.nextEventWeeklyMeta)}
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
