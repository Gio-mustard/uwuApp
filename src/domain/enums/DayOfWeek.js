/**
 * @fileoverview DayOfWeek enum and related utilities.
 * Represents the 7 days of the week with ISO numbering (1 = Monday, 7 = Sunday).
 */

/** @enum {number} */
export const DayOfWeek = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

/** Short labels for each day in Spanish */
export const DAY_LABELS = {
  [DayOfWeek.MONDAY]: 'LU',
  [DayOfWeek.TUESDAY]: 'MA',
  [DayOfWeek.WEDNESDAY]: 'MI',
  [DayOfWeek.THURSDAY]: 'JU',
  [DayOfWeek.FRIDAY]: 'VI',
  [DayOfWeek.SATURDAY]: 'SA',
  [DayOfWeek.SUNDAY]: 'DO',
};

/** Full names in Spanish */
export const DAY_FULL_LABELS = {
  [DayOfWeek.MONDAY]: 'Lunes',
  [DayOfWeek.TUESDAY]: 'Martes',
  [DayOfWeek.WEDNESDAY]: 'Miércoles',
  [DayOfWeek.THURSDAY]: 'Jueves',
  [DayOfWeek.FRIDAY]: 'Viernes',
  [DayOfWeek.SATURDAY]: 'Sábado',
  [DayOfWeek.SUNDAY]: 'Domingo',
};

/** Ordered list of all days from Monday to Sunday */
export const ALL_DAYS = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

/**
 * Returns the ISO day of week for a given Date (1=Monday, 7=Sunday).
 * @param {Date} date
 * @returns {number}
 */
export function getIsoDay(date) {
  const day = date.getDay(); // 0=Sunday, 1=Mon, ...
  return day === 0 ? 7 : day;
}
