/**
 * @fileoverview HistoryWeekCard — Expandable card showing one week's history.
 *
 * Features:
 * - Header background color interpolated from red (0%) → amber (50%) → green (100%)
 * - SVG circular progress ring with percentage in the center
 * - Full task snapshot list (completed ✓ and missed ✗) shown when expanded
 * - All cards independently expandable / collapsible
 */

import { useEffect, useState } from 'react';
import { formatWeekRange } from '../../services/WeekService';
import { CircularProgress } from './CircularProgress';
import './HistoryWeekCard.css';

/**
 * Interpolates between red → amber → green over [0, 100].
 * @param {number} pct  0–100
 * @returns {string}    HSL color string
 */
function pctToHSL(pct) {
  // Hue: 0 = red (0°), 50% = orange/amber (35°), 100% = green (130°)
  const hue = Math.round((pct / 100) * 130);
  return `hsl(${hue}, 72%, 42%)`;
}

/**
 * @param {{
 *   history: import('../../domain/models/WeekHistory').WeekHistory,
 *   label?: string,
 *   defaultExpanded?: boolean,
 * }} props
 */
export function HistoryWeekCard({ history, label, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { startDate, endDate, totalTasks, completedTasks, taskSnapshots } = history;
  const [preparedSnapshots,setPreparedSnapshots] = useState([]);
  const range = formatWeekRange(startDate, endDate);
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const headerColor = pctToHSL(pct);
  useEffect(()=>{
    if (taskSnapshots.tasks == undefined){
      setPreparedSnapshots(taskSnapshots)
    }
    else{
      setPreparedSnapshots(taskSnapshots.tasks)
    }
  },[taskSnapshots])

  return (
    <div className="history-card">
      {/* Colored header — click to expand/collapse */}
      <button
        id={`history-card-${history.weekId}`}
        className="history-card__header"
        style={{ background: headerColor }}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {/* Left: labels */}
        <div className="history-card__header-left">
          <span className="history-card__label">{label ?? range}</span>
          <span className="history-card__range">{label ? range : ''}</span>
          <span className="history-card__subtitle">
            {completedTasks} de {totalTasks} completados
          </span>
        </div>

        {/* Right: circular progress + chevron */}
        <div className="history-card__header-right">
          <CircularProgress pct={pct} />
          <svg
            className={`history-card__chevron${expanded ? ' history-card__chevron--open' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Task snapshot list — animates open/closed via CSS grid-template-rows */}
      <div className={`history-card__body${expanded ? ' history-card__body--open' : ''}`}>
        <ul className="history-card__list" role="list">
          {preparedSnapshots.map((snap) => (
            <li key={snap.taskId} className="history-card__snap-item">
              <span
                className={`history-card__snap-icon${snap.completed ? '' : ' history-card__snap-icon--fail'}`}
              >
                {snap.completed ? '✓' : '✗'}
              </span>
              <span className="history-card__snap-title">
                {snap.title}
                <span className="history-card__snap-count">
                  {' '}×{snap.completedCount}
                  {!snap.completed && (
                    <span className="history-card__snap-req">/{snap.requiredCount}</span>
                  )}
                </span>
              </span>
              {snap.completed && (
                <span className="history-card__snap-check">✓</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
