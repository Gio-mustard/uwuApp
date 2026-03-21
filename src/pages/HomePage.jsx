/**
 * @fileoverview HomePage — Main application screen.
 *
 * Displays:
 * - App header with user info
 * - Day-of-week selector
 * - Daily tasks section (filtered by selected day)
 * - Weekly tasks section
 * - Next upcoming event card
 * - FAB for adding new tasks
 */

import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { AppShell } from '../components/layout/AppShell';
import { DaySelector } from '../components/days/DaySelector';
import { DailyTaskItem } from '../components/tasks/DailyTaskItem';
import { WeeklyTaskItem } from '../components/tasks/WeeklyTaskItem';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { getDailyTasksForDay, getNextEvent } from '../services/TaskService';
import './HomePage.css';

export function HomePage() {
  const { useAuth, useTasks } = useSession();
  const { user } = useAuth();
  const {
    dailyTasks,
    weeklyTasks,
    currentWeekId,
    todayDay,
    loading,
    addDailyTask,
    addWeeklyTask,
    toggleDailyTask,
    toggleWeeklyTask,
  } = useTasks();

  const [selectedDay, setSelectedDay] = useState(todayDay);
  // --- Add task modal
  const [showModal, setShowModal] = useState(false);
  const [typeModal,setTypeModal] = useState('daily');

  const [showProfile, setShowProfile] = useState(false);

  const dailyForDay = getDailyTasksForDay(dailyTasks, selectedDay);
  const now = new Date();
  const nextEvent = getNextEvent([...dailyTasks, ...weeklyTasks], now, todayDay, currentWeekId);

  async function handleAdd(type, data) {
    if (type === 'daily') await addDailyTask(data);
    else await addWeeklyTask(data);
  }

  const greeting = user?.displayName?.split(' ')[0] ?? 'Usuario';

  return (
    <AppShell>
      <div className="home-page">
        {/* Header */}
        <header className="home-header">
          <div className="home-header__brand">
            <span className="home-header__app-name">UWU App</span>
            <button id="home-profile-btn" className="home-header__user" onClick={() => setShowProfile(true)} aria-label="Ver perfil">
              <span className="home-header__username">{user?.username}</span>
              <div className="home-header__avatar" aria-hidden="true">
                {greeting[0]?.toUpperCase()}
              </div>
            </button>
          </div>
          <h1 className="home-header__greeting">Hola, {greeting}</h1>
        </header>

        {/* Day selector */}
        <section className="home-section" aria-label="Selector de día">
          <DaySelector
            selectedDay={selectedDay}
            todayDay={todayDay}
            onSelect={setSelectedDay}
          />
        </section>

        {loading ? (
          <div className="home-loading">
            <div className="home-loading__spinner" />
          </div>
        ) : (
          <>
          {/* Next event */}
            {nextEvent && (
              <section className="home-section" aria-label="Siguiente evento">
                <div className="next-event-card">
                  <div className="next-event-card__badge">Siguiente evento</div>
                  <div className="next-event-card__body">
                    <div className="next-event-card__left">
                      <div className="next-event-card__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="9" />
                          <polyline points="12 7 12 12 15 15" />
                        </svg>
                      </div>
                      <div className="next-event-card__info">
                        <span className="next-event-card__name">{nextEvent.title}</span>
                        <span className="next-event-card__meta">
                          {nextEvent.description || (nextEvent.type === 'daily' ? 'Pendiente diario' : 'Pendiente semanal')}
                        </span>
                      </div>
                    </div>
                    <div className="next-event-card__time-pill">
                      {nextEvent.suggestedTime ?? '—'}
                    </div>
                  </div>
                </div>
              </section>
            )}
            {/* Daily tasks */}
            <section className="home-section" aria-label="Pendientes diarios">
              <div className="section-card">
                <div className="section-card__header">
                  <h2 className="section-card__title">Pendientes diarios</h2>
                  <button
                    id="add-daily-btn"
                    className="section-card__add"
                    onClick={() => {setShowModal(true) ; setTypeModal('daily')}}
                    aria-label="Agregar pendiente diario"
                  >
                    +
                  </button>
                </div>
                {dailyForDay.length === 0 ? (
                  <p className="section-card__empty">No hay pendientes para este día.</p>
                ) : (
                  dailyForDay.map((task) => (
                    <DailyTaskItem
                      key={task.id}
                      task={task}
                      weekId={currentWeekId}
                      selectedDay={selectedDay}
                      todayDay={todayDay}
                      onToggle={toggleDailyTask}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Weekly tasks */}
            <section className="home-section" aria-label="Pendientes semanales">
              <div className="section-card">
                <div className="section-card__header">
                  <h2 className="section-card__title">Pendientes semanales</h2>
                  <button
                    id="add-weekly-btn"
                    className="section-card__add"
                    onClick={() => {setShowModal(true) ; setTypeModal('weekly')}}
                    aria-label="Agregar pendiente semanal"
                  >
                    +
                  </button>
                </div>
                {weeklyTasks.length === 0 ? (
                  <p className="section-card__empty">No tienes pendientes semanales.</p>
                ) : (
                  weeklyTasks.map((task) => (
                    <WeeklyTaskItem
                      key={task.id}
                      task={task}
                      weekId={currentWeekId}
                      onToggle={toggleWeeklyTask}
                    />
                  ))
                )}
              </div>
            </section>

            
          </>
        )}
      </div>

      {/* FAB */}
      <button
        id="fab-add"
        className="fab"
        onClick={() => setShowModal(true)}
        aria-label="Agregar nuevo pendiente"
      >
        +
      </button>

      {showModal && (
        <AddTaskModal onAdd={handleAdd} onClose={() => setShowModal(false)} initialType={typeModal} />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </AppShell>
  );
}
