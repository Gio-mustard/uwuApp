/**
 * @fileoverview DailyTaskItem — Single row for a daily task.
 *
 * Renders a checkbox, title, optional time, and a detail arrow.
 * The checkbox is disabled when the task cannot be completed on the
 * currently selected day (must be both assigned to that day AND it must be today).
 */

import { isDailyTaskDoneOnDay, isDailyTaskInteractable } from '../../services/TaskService';
import { TrashIcon } from '../common/Icons';
import './TaskItem.css';

/**
 * @param {{
 *   task: import('../../domain/models/DailyTask').DailyTask,
 *   weekId: string,
 *   selectedDay: number,
 *   todayDay: number,
 *   onToggle: (taskId: string, day: number) => void,
 *   onDelete: (taskId: string) => void,
 * }} props
 */
export function DailyTaskItem({ task, weekId, selectedDay, todayDay, onToggle,onDelete }) {
  const done = isDailyTaskDoneOnDay(task, weekId, selectedDay);
  const interactable = isDailyTaskInteractable(task, selectedDay, todayDay);
  const handleDelete = ()=>{
    return onDelete(task.id)
  }
  return (
    <div className={`task-item${done ? ' task-item--done' : ''}${!interactable ? ' task-item--disabled' : ''}`}>
      <button
        id={`daily-task-check-${task.id}`}
        className="task-item__check"
        role="checkbox"
        aria-checked={done}
        aria-label={`Completar ${task.title}`}
        disabled={!interactable}
        onClick={() => interactable && onToggle(task.id, selectedDay)}
      >
        {done ? <CheckIcon /> : <EmptyCheckIcon />}
      </button>

      <div className="task-item__body">
        <span className="task-item__title">{task.title}</span>
        {task.description && (
          <span className="task-item__desc">{task.description}</span>
        )}
      </div>
        <button  disabled={!interactable} onClick={handleDelete} style={{border:'none',padding:'4px',borderRadius:'4px',cursor:'pointer'}}>
          <TrashIcon/>
        </button>
      {task.suggestedTime && (
        <span className="task-item__time">{task.suggestedTime}</span>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" fill="var(--color-primary)" />
      <polyline points="4,9 7.5,12.5 14,6" stroke="#fff" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyCheckIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none">
      <rect width="18" height="18" rx="5" stroke="var(--color-border-strong)" strokeWidth="1.5" />
    </svg>
  );
}
