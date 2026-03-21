/**
 * @fileoverview HistoryPage — Weekly history screen.
 *
 * Shows the current week's progress (first, expanded by default) followed
 * by past weeks in descending order. All cards can be independently
 * expanded or collapsed to view the full task snapshot list.
 */

import { useSession } from '../context/SessionContext';
import { AppShell } from '../components/layout/AppShell';
import { HistoryWeekCard } from '../components/history/HistoryWeekCard';
import { buildWeekHistorySnapshot } from '../services/WeekService';
import { HISTORY_TEXTS } from '../constants/texts/history.texts';
import './HistoryPage.css';

export function HistoryPage() {
  const { useTasks } = useSession();
  const { dailyTasks, weeklyTasks, history, currentWeekId, loading } = useTasks();

  // Build live current-week snapshot from in-memory state (not yet archived).
  const currentSnapshot = buildWeekHistorySnapshot(dailyTasks, weeklyTasks, currentWeekId);

  return (
    <AppShell>
      <div className="history-page">
        <header className="history-header">
          <h1 className="history-header__title">{HISTORY_TEXTS.pageTitle}</h1>
        </header>

        {loading ? (
          <div className="history-loading">
            <div className="history-loading__spinner" />
          </div>
        ) : (
          <div className="history-list">
            {/* Current week */}
            <HistoryWeekCard
              history={currentSnapshot}
              label={HISTORY_TEXTS.cardLabelCurrentWeek}
              defaultExpanded={true}
            />

            {/* Past weeks */}
            {history.map((week) => (
              <HistoryWeekCard
                key={week.weekId}
                history={week}
                label={HISTORY_TEXTS.cardLabelPastWeek}
                defaultExpanded={false}
              />
            ))}

            {history.length === 0 && (
              <p className="history-empty">{HISTORY_TEXTS.noHistory}</p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
