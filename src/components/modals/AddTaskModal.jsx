/**
 * @fileoverview AddTaskModal — Modal form for creating daily or weekly tasks.
 *
 * The user selects the task type (daily/weekly), fills in title, optional
 * description and time, then for daily tasks picks assigned days (≥1),
 * or for weekly tasks sets a required count (≥1).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ALL_DAYS, DAY_LABELS } from '../../domain/enums/DayOfWeek';
import { Modal } from './Modal';
import './AddTaskModal.css';
import { CheckIcon, EmptyCheckIcon } from '../common/Icons';
import NumberInput from '../common/NumberInput';
import TimePicker from '../common/TimePicker';

/**
 * @param {{
 *   onAdd: (type: 'daily'|'weekly', data: object) => void,
 *   onClose: () => void,
 *   open?: boolean,
 *   task_type?: 'daily' | 'weekly',
 *   editMode?: boolean,
 *   payloadTask?: import('../../domain/models/WeeklyTask').WeeklyTask | import('../../domain/models/DailyTask').DailyTask,
 *   onDelete?: (task: import('../../domain/models/WeeklyTask').WeeklyTask | import('../../domain/models/DailyTask').DailyTask) => void
 * }} props
 */
export function AddTaskModal({ onAdd, onClose, open = true, task_type = 'daily', editMode = false, payloadTask = undefined, onDelete = (task) => { } }) {
  const [type, setType] = useState(task_type);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [assignedDays, setAssignedDays] = useState([]);
  const [requiredCount, setRequiredCount] = useState(1);
  const [error, setError] = useState('');

  const [isRecurring, setIsRecurring] = useState(false);
  const [isEditMode, setIsEditMode] = useState(editMode);
  const container = useRef(null);

  const injectPayload = useCallback((payload) => {
    if (payload === undefined) {
      setTitle('');
      setDescription('');
      setTime('');
      setType(task_type);
      setAssignedDays([]);
      setRequiredCount(1);
      setIsRecurring(false);
      setError('');
      return
    }

    setTitle(payload.title);
    setDescription(payload.description);
    setTime(payload.suggestedTime);
    setType(payload.type);
    if (payload.type === 'daily') {
      setAssignedDays(payload.assignedDays);
    }
    if (payload.type === 'weekly') {
      setRequiredCount(payload.requiredCount);
    }
    setIsRecurring(payload.isRecurring);


  }, [])
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (container.current) {
          container.current.scrollTo({ top: 0, behavior: 'instant' });
        }
      }, 10);
    }

    if (!open || payloadTask !== undefined) return;
    injectPayload(undefined);
  }, [open, payloadTask, injectPayload]);

  useEffect(() => {
    setType(task_type);
  }, [task_type])

  useEffect(() => {
    if (payloadTask) {
      injectPayload(payloadTask);
    }
  }, [payloadTask])


  useEffect(() => {
    setIsEditMode(editMode);
  }, [editMode]);

  useEffect(() => {
    injectPayload(payloadTask);
  }, [isEditMode]);





  function toggleDay(day) {
    setAssignedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (type === 'daily' && assignedDays.length === 0) {
      setError('Selecciona al menos 1 día de la semana.');
      return;
    }
    if (type === 'weekly' && requiredCount < 1) {
      setError('La cantidad mínima es 1.');
      return;
    }
    const data = {
      id: payloadTask === undefined ? null : payloadTask.id,
      title: title.trim(),
      description: description.trim(),
      suggestedTime: time || null,
      ...(type === 'daily'
        ? { assignedDays }
        : { requiredCount: Number(requiredCount) }),
      isRecurring: isRecurring,
      completions: payloadTask === undefined ? null : payloadTask.completions
    };
    onAdd(type, data);
    onClose();
  }


  return (
    <Modal
      useDrawer
      open={open}
      onClose={onClose}
      drawerContentClass="modal-vaul-content"
      handleClass="modal-vaul-handle"
      overlayClass="modal-vaul-overlay"
      shouldScaleBackground
    >
      <div className="modal-vaul-body" ref={container}>
        <div className="modal__header">
          <h2 className="modal__title">{isEditMode ? 'Editar pendiente' : 'Nuevo pendiente'}</h2>
          <button id="modal-close" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Type toggle */}
        {
          !isEditMode && (
            <div className="modal__type-toggle">
              <button
                id="modal-type-daily"
                className={`modal__type-btn${type === 'daily' ? ' modal__type-btn--active' : ''}`}
                onClick={() => setType('daily')}
              >
                Diario
              </button>
              <button
                id="modal-type-weekly"
                className={`modal__type-btn${type === 'weekly' ? ' modal__type-btn--active' : ''}`}
                onClick={() => setType('weekly')}
              >
                Semanal
              </button>
            </div>
          )
        }

        <form className="modal__form" onSubmit={handleSubmit} noValidate autoComplete='off'>
          <div className="form-field">
            <label className="form-label" htmlFor="task-title">Título *</label>
            <input
              id="task-title"
              className="form-input"
              type="text"
              placeholder="Ej: Tomar vitaminas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="task-desc">Descripción</label>
            <input
              id="task-desc"
              className="form-input"
              type="text"
              placeholder="Opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={160}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="task-time">Hora sugerida</label>
            <TimePicker
              id="task-time"
              value={time}
              onChange={(val) => setTime(val)}
            />
          </div>

          {type === 'daily' ? (
            <div className="form-field">
              <label className="form-label">Días asignados *</label>
              <div className="modal__days">
                {ALL_DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    id={`modal-day-${day}`}
                    className={`modal__day-pill${assignedDays.includes(day) ? ' modal__day-pill--active' : ''}`}
                    onClick={() => toggleDay(day)}
                    aria-pressed={assignedDays.includes(day)}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="form-field">
              <label className="form-label" htmlFor="task-count">
                Veces por semana (mín. 1 max. 99)
              </label>

              <NumberInput id='task-count' min={1} max={99} initialValue={requiredCount} onChange={(value) => setRequiredCount(value)} />
            </div>
          )}
          <div className="form-field task-recurring form-input" onClick={(e) => { setIsRecurring(!isRecurring) }} style={{ cursor: "pointer" }}>


            <button
              type="button"
              id='task-recurring'
              className="task-item__check"

              aria-checked={isRecurring}
            >
              {isRecurring ? <CheckIcon /> : <EmptyCheckIcon />}
            </button>
            <label className="form-label" >Quieres que se repita cada semana?</label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <footer>


            <button id="modal-submit" className="btn-primary modal__submit" type="submit" autoFocus>
              {isEditMode ? "Actualizar" : 'Agregar'}
            </button>

            {isEditMode && (

              <button type="button" onClick={() => {
                onClose();

                onDelete(payloadTask);
              }} id="modal-delete" className="btn-danger btn-secondary ">
                Eliminar
              </button>
            )}
          </footer>
        </form>
      </div>
    </Modal>
  );
}
