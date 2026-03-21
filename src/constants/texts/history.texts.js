/**
 * @fileoverview history.texts.js — Text strings for the History page.
 */

export const HISTORY_TEXTS = {
  // Page header
  pageTitle: 'Historial',

  // Card labels
  cardLabelCurrentWeek: 'Semana actual',
  cardLabelPastWeek: 'Semana pasada',

  /** @param {number} completed @param {number} total */
  completedSummary: (completed, total) => `${completed} de ${total} completados`,

  // Empty state
  noHistory: 'Aún no hay historial de semanas pasadas.',
};
