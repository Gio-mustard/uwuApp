/**
 * @fileoverview DailyTaskItem — Single row for a daily task.
 *
 * Renders a checkbox, title, optional time, and a detail arrow.
 * The checkbox is disabled when the task cannot be completed on the
 * currently selected day (must be both assigned to that day AND it must be today).
 */

import { isDailyTaskDoneOnDay, isDailyTaskInteractable } from '../../services/TaskService';
import { TrashIcon } from '../common/Icons';
import { formatTime12h } from '../../utils/timeUtils';
import './TaskItem.css';
import { useCallback, useEffect, useState } from 'react';

/**
 * @param {{
 *   task: import('../../domain/models/DailyTask').DailyTask,
 *   weekId: string,
 *   selectedDay: number,
 *   todayDay: number,
 *   onToggle: (taskId: string, day: number) => Promise<void>,
 *   onEdit : (task:import('../../domain/models/DailyTask').DailyTask)=>Promise<void>,
 *   onDelete: (task:import('../../domain/models/DailyTask').DailyTask)=>Promise<void>
 * }} props
 */
export function DailyTaskItem({ task, weekId, selectedDay, todayDay, onToggle, onEdit, onDelete }) {
  const [done, setIsDone] = useState(isDailyTaskDoneOnDay(task, weekId, selectedDay));
  const [interactable, setInteractable] = useState(isDailyTaskInteractable(task, selectedDay, todayDay));
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsDone(isDailyTaskDoneOnDay(task, weekId, selectedDay));
    setInteractable(isDailyTaskInteractable(task, selectedDay, todayDay));
  }, [task, weekId, selectedDay, todayDay]);

  const handleToggle = useCallback(async (e) => {
    e.stopPropagation();
    if (!interactable || isToggling) return;

    setIsToggling(true);
    try {
      await onToggle(task.id, selectedDay);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    } finally {
      setIsToggling(false);
    }
  }, [interactable, isToggling, onToggle, task.id, selectedDay]);
  
  return (
    <div 
      className={`task-item${done ? ' task-item--done' : ''}${!interactable ? ' task-item--disabled' : ''}`}
      
      >
      <button
        id={`daily-task-check-${task.id}`}
        className={`task-item__check${isToggling ? ' task-item__check--loading' : ''}`}
        role="checkbox"
        aria-checked={done}
        aria-label={`Completar ${task.title}`}
        disabled={!interactable || isToggling}
        onClick={handleToggle}
      >
        {done ? <CheckIcon /> : <EmptyCheckIcon />}
      </button>

      <div className="task-item__body" onClick={()=>{
        onEdit(task);
      }}>
        <span className="task-item__title">{task.title}</span>
        {task.description && (
          <span className="task-item__desc">{task.description}</span>
        )}
      </div>
        
      {task.suggestedTime && (
        <span className="task-item__time">{formatTime12h(task.suggestedTime)}</span>
      )}
      <button  onClick={()=>onDelete(task)} style={{border:'none',padding:'4px',borderRadius:'4px',cursor:'pointer',background:'none'}}>
          <TrashIcon/>
      </button>
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
    <svg viewBox="0 0 18 18" fill="none" >
      <rect width="18" height="18" rx="5"  strokeWidth="1.5" />
    </svg>
  );
}
