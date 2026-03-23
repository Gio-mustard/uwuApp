/**
 * @fileoverview WeeklyTaskItem — Single row for a weekly task.
 *
 * Shows a checkbox (filled when requiredCount is met), the task title,
 * optional description, completion count badge (e.g. "x 2 / 3"),
 * and increment/decrement controls.
 */

import { useEffect, useState } from 'react';
import { isWeeklyTaskComplete, getWeeklyTaskCount } from '../../services/TaskService';
import './TaskItem.css';
import { TrashIcon } from '../common/Icons';

/**
 * @param {{
 *   task: import('../../domain/models/WeeklyTask').WeeklyTask,
 *   weekId: string,
 *   onToggle: (taskId: string, increment: boolean) => void,
 *   onDelete: (taskId: string) => void
 * }} props
 */
export function WeeklyTaskItem({ task, weekId, onToggle,onDelete }) {
  const done = isWeeklyTaskComplete(task, weekId);
  const count = getWeeklyTaskCount(task, weekId);
  
  const [internalCount,setInternalCount] = useState(count);
  const [canDecrement,setCanDecrement] = useState(internalCount>0);
  const [canIncrement,setCanIncrement] = useState(internalCount < task.requiredCount);
  const [isDeleting,setIsDeleting] = useState(false);  

  useEffect(()=>{
    if (count != internalCount){
      setInternalCount(count);
    }
  },[count])

  useEffect(()=>{
      setCanDecrement(internalCount>0);
      setCanIncrement(internalCount < task.requiredCount);
  },[internalCount])

  const handleDelete = (taskId,onDelete) =>{
    setIsDeleting(true);
    return onDelete(taskId);
  }

  useEffect(()=>{
    if (!(isDeleting)) return;
    setCanDecrement(false);
    setCanIncrement(false);

  },[isDeleting])

  return (
    <div className={`task-item${done ? ' task-item--done' : ''}`}>
      {/* Checkbox — purely a visual done indicator; counter buttons handle incrementing */}
      <div
        id={`weekly-task-check-${task.id}`}
        className="task-item__check"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `${task.title} completado` : `${task.title} pendiente`}
      >
        {done ? <CheckIcon /> : null}
      </div>

      <div className="task-item__body">
        <span className="task-item__title">{task.title}</span>
        {task.description && (
          <span className="task-item__desc">{task.description}</span>
        )}
      </div>

      <div className="task-item__weekly-controls">
        
        {task.suggestedTime && (
          <span className="task-item__time">{task.suggestedTime}</span>
        )}
        <div className="weekly-counter">
          <button style={{border:'none',cursor:'pointer'}} onClick={()=>handleDelete(task.id,onDelete)}>
            <TrashIcon></TrashIcon>
          </button>
          <br />
          <button
            id={`weekly-task-dec-${task.id}`}
            className="weekly-counter__btn"
            aria-label={`Restar completado de ${task.title}`}
            disabled={!canDecrement}
            onClick={() => {
              setInternalCount(internalCount-1);
              onToggle(task.id, false)
            }}
          >
            −
          </button>
          <span className="weekly-counter__label">
            {internalCount}<span className="weekly-counter__req">/{task.requiredCount}</span>
          </span>
          <button
            id={`weekly-task-inc-${task.id}`}
            className="weekly-counter__btn"
            aria-label={`Sumar completado de ${task.title}`}
            disabled = {!canIncrement}
            onClick={() => {
              setInternalCount(internalCount+1)
              onToggle(task.id, true)
            }}
          >
            +
          </button>
        </div>
      </div>
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
