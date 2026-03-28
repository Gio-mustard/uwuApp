/**
 * @fileoverview routes.js — Centralized route path definitions.
 *
 * All navigation paths are defined here. Import this file instead of
 * hardcoding path strings so renaming a route only requires changing
 * one place.
 *
 * @example
 * import { ROUTES } from '../constants/routes';
 * navigate(ROUTES.HISTORY);
 */

export const ROUTES = {
  /** Main task dashboard */
  HOME: '/',
  /** Weekly history view */
  HISTORY: '/historial',
  /** Configuration page */
  SETTINGS: '/configuracion',
  /* Baul page*/
  Baul: '/Baul'
};
