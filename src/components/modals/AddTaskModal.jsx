/**
 * @fileoverview AddTaskModal — Modal form for creating daily or weekly tasks.
 *
 * The user selects the task type (daily/weekly), fills in title, optional
 * description and time, then for daily tasks picks assigned days (≥1),
 * or for weekly tasks sets a required count (≥1).
 */

import { useState } from 'react';
import { ALL_DAYS, DAY_LABELS } from '../../domain/enums/DayOfWeek';
import { Modal } from './Modal';
import './AddTaskModal.css';

/**
 * @param {{
 *   onAdd: (type: 'daily'|'weekly', data: object) => void,
 *   onClose: () => void,
 *   initialType : string 
 * }} props
 */
export function AddTaskModal({ onAdd, onClose,initialType = 'daily' }) {
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [assignedDays, setAssignedDays] = useState([]);
  const [requiredCount, setRequiredCount] = useState(1);
  const [error, setError] = useState('');
  const [isRecurring,setIsRecurring] = useState(false)

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
      title: title.trim(),
      description: description.trim(),
      suggestedTime: time || null,
      ...(type === 'daily'
        ? { assignedDays }
        : { requiredCount: Number(requiredCount) }),
      isRecurring:isRecurring
    };
    onAdd(type, data);
    onClose();
  }

  return (
    <Modal onClose={onClose} overlayClass="modal-overlay" sheetClass="modal">
        <div className="modal__header">
          <h2 className="modal__title">Nuevo pendiente</h2>
          <button id="modal-close" className="modal__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        {/* Type toggle */}
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

        <form className="modal__form" onSubmit={handleSubmit} noValidate>
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
            <input
              id="task-time"
              className="form-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
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
                Veces por semana (mín. 1)
              </label>
              <input
                id="task-count"
                className="form-input"
                type="number"
                min="1"
                max="99"
                value={requiredCount}
                onChange={(e) => setRequiredCount(e.target.value)}
              />
            </div>
          )}
          <div className="form-field">
            <label className="form-label" htmlFor="task-recurring">Es recurrente</label>
            <input
              id="task-recurring"
              className="form-input"
              type="checkbox"
              value={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button id="modal-submit" className="btn-primary modal__submit" type="submit">
            Agregar pendiente
          </button>
        </form>
    </Modal>
  );
}
