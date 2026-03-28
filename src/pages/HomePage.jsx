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

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { AppShell } from '../components/layout/AppShell';
import { DaySelector } from '../components/days/DaySelector';
import { DailyTaskItem } from '../components/tasks/DailyTaskItem';
import { WeeklyTaskItem } from '../components/tasks/WeeklyTaskItem';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { ProfileModal } from '../components/modals/ProfileModal';
import { Avatar } from '../components/common/Avatar';
import { getDailyTasksForDay, getNextEvent, isWeeklyTaskComplete, isDailyTaskDoneOnDay } from '../services/TaskService';
import { getDynamicGreeting } from '../constants/texts/greetings.texts';
import { HOME_TEXTS } from '../constants/texts/home.texts';
import './HomePage.css';
import { Modal } from '../components/modals/Modal';
import { is } from 'date-fns/locale';

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
    deleteTask
  } = useTasks();

  const [selectedDay, setSelectedDay] = useState(todayDay);
  // --- Add task modal
  const [showModal, setShowModal] = useState(false);
  const [typeModal,setTypeModal] = useState('daily');

  const [showProfile, setShowProfile] = useState(false);
  const [modalTaskDeleteConfirmation,setModalTaskDeleteConfirmation] = useState({show:false,task:undefined});
  const [isDeleting,setIsDeleting] = useState(false);
  const dailyForDay = getDailyTasksForDay(dailyTasks, selectedDay);
  const now = new Date();
  const nextEvent = getNextEvent([...dailyTasks, ...weeklyTasks], now, todayDay, currentWeekId);

  const [editMode,setEditMode] = useState({isEditing:false,payload:undefined});
  const handleActivateEditMode = useCallback((task)=>{
    setShowModal(true);
    setEditMode({isEditing:true,payload:task});
  },[])
  useEffect(()=>{
    if (showModal) return;
    setEditMode({isEditing:false,payload:undefined});
  },[showModal])
  /** Weekly completion % for the dynamic greeting. */
  const weeklyCompletionPct = useMemo(() => {
    const dailyCompleted = dailyTasks.filter((t) =>
      t.assignedDays.includes(todayDay) && isDailyTaskDoneOnDay(t, currentWeekId, todayDay)
    ).length;
    const dailyTotal = dailyTasks.filter((t) => t.assignedDays.includes(todayDay)).length;
    const weeklyCompleted = weeklyTasks.filter((t) => isWeeklyTaskComplete(t, currentWeekId)).length;
    const total = dailyTotal + weeklyTasks.length;
    if (total === 0) return 0;
    return Math.round(((dailyCompleted + weeklyCompleted) / total) * 100);
  }, [dailyTasks, weeklyTasks, currentWeekId, todayDay]);

  const greeting = getDynamicGreeting(weeklyCompletionPct, user?.displayName ?? 'Usuario');

  async function handleAdd(type, data) {
    if (type === 'daily') await addDailyTask(data);
    else await addWeeklyTask(data);
  }

  const handleDelete = useCallback((task)=>{
    if (task === undefined) return 10;
    setModalTaskDeleteConfirmation({show:true,task:task,type: task.assignedDays ? 'daily' : 'weekly'})
    
  },[]);

  // Avatar shows first letter of the user's display name (independent of the greeting sentence).
  const avatarInitial = (user?.displayName ?? 'U')[0].toUpperCase();

  return (
    <AppShell>
      {modalTaskDeleteConfirmation.show && (

        <Modal
        overlayClass='profile-overlay task-delete-confirmation-overlay'
        sheetClass='profile-sheet task-delete-confirmation-sheet'
        onClose={
          ()=> setModalTaskDeleteConfirmation({show:false,task:undefined})
        }>
        
        <h3 className = 'confirmation-message'>Quieres <b>eliminar</b> esta <b>tarea ?</b></h3>
        
        <h2 className='confirmation-task-title'>{modalTaskDeleteConfirmation.task?.title}</h2>
        <p className='confirmation-task-description'>{modalTaskDeleteConfirmation.task?.description}</p>
        <footer>
          <button 
          disabled={isDeleting}
          onClick={async()=>{
            setIsDeleting(true);
            await deleteTask(modalTaskDeleteConfirmation.task.id);
            setModalTaskDeleteConfirmation({show:false,task:undefined})
            setIsDeleting(false);
          }} className='modal__type-btn btn-primary'>
              {isDeleting ? 'Eliminando...' : 'Eliminar'}

              {isDeleting && (
                        <div className='spinner' style={{
                      position: 'absolute', inset: 0, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      <div style={{
                        width: 14, height: 14, 
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                    </div>
              )}
            </button>
          <button onClick={()=>{
            setModalTaskDeleteConfirmation({show:false,task:undefined})
          }} className='modal__type-btn'>Cancelar</button>
        </footer>
      </Modal>
      )}

      <div className="home-page">
        {/* Header */}
        <header className="home-header">
          <div className="home-header__brand">
            <span className="home-header__app-name">{HOME_TEXTS.appName}</span>
            <button id="home-profile-btn" className="home-header__user" onClick={() => setShowProfile(true)} aria-label={HOME_TEXTS.ariaViewProfile}>
              <span className="home-header__username">{user?.username}</span>
              <div className="home-header__avatar" aria-hidden="true">
                <Avatar path={user?.avatarUrl} size={30} fallback={avatarInitial} />
              </div>
            </button>
          </div>
          <h1 className="home-header__greeting">{greeting}</h1>
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
                  <div className="next-event-card__badge">{HOME_TEXTS.nextEventBadge}</div>
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
                          {nextEvent.description || (nextEvent.type === 'daily' ? HOME_TEXTS.nextEventDailyMeta : HOME_TEXTS.nextEventWeeklyMeta)}
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
                  <h2 className="section-card__title">{HOME_TEXTS.dailyTasksTitle}</h2>
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
                  <p className="section-card__empty">{HOME_TEXTS.noDailyTasksForDay}</p>
                ) : (
                  dailyForDay.map((task) => (
                    <DailyTaskItem
                      key={`${task.id}-${selectedDay}`}
                      task={task}
                      weekId={currentWeekId}
                      selectedDay={selectedDay}
                      todayDay={todayDay}
                      onToggle={toggleDailyTask}
                      onDelete={handleDelete}
                      onEdit = {handleActivateEditMode}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Weekly tasks */}
            <section className="home-section" aria-label="Pendientes semanales">
              <div className="section-card">
                <div className="section-card__header">
                  <h2 className="section-card__title">{HOME_TEXTS.weeklyTasksTitle}</h2>
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
                  <p className="section-card__empty">{HOME_TEXTS.noWeeklyTasks}</p>
                ) : (
                  weeklyTasks.map((task) => (
                    <WeeklyTaskItem
                      key={task.id}
                      task={task}
                      weekId={currentWeekId}
                      onToggle={toggleWeeklyTask}
                      onDelete={handleDelete}
                      onEdit = {handleActivateEditMode}

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
        <AddTaskModal onAdd={handleAdd} onClose={() => setShowModal(false)} initialType={typeModal} editMode={editMode.isEditing} payloadTask={editMode.payload} onDelete={handleDelete} />
      )}

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </AppShell>
  );
}
