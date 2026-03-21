/**
 * @fileoverview greetings.texts.js — Dynamic greeting messages based on weekly completion %.
 *
 * Each greeting is a function that receives the user's first name and returns a string.
 * Buckets are checked from highest to lowest — first matching bucket wins.
 *
 * Usage:
 * ```js
 * import { getDynamicGreeting } from '../constants/texts/greetings.texts';
 * const greeting = getDynamicGreeting(75, 'Sergio'); // → "Ya casi, Sergio 🔥"
 * ```
 */

/**
 * Greeting definitions ordered from highest % to lowest.
 * Each entry: { minPct, message(name) }
 * @type {Array<{ minPct: number, message: (name: string) => string }>}
 */
const GREETING_BUCKETS = [
  { minPct: 100, message: (name) => `¡Ayayay, ${name}! estas bien bueno` },
  { minPct: 85,  message: (name) => `Hola ${name}, qué guapo estás` },
  { minPct: 65,  message: (name) => `Ya merito, ${name}` },
  { minPct: 40,  message: (name) => `Vas de pelos, ${name}` },
  { minPct: 15,  message: (name) => `Mmm, ponte pilas ${name}` },
  { minPct: 0,   message: (name) => `Ponte a jalar birote` },
];

/**
 * Returns a dynamic greeting string based on the current weekly completion percentage.
 *
 * @param {number} completionPct   - 0–100, weekly tasks completed / total
 * @param {string} displayName     - User's full display name; first word is used
 * @returns {string}               - Greeting message
 */
export function getDynamicGreeting(completionPct, displayName) {
  const firstName = displayName?.split(' ')[0] ?? 'Usuario';
  const pct = Math.max(0, Math.min(100, completionPct));
  const bucket = GREETING_BUCKETS.find((b) => pct >= b.minPct);
  return bucket ? bucket.message(firstName) : `Hola, ${firstName}`;
}
