/**
 * Formats a 24-hour time string ("HH:MM") to a 12-hour format ("H:MM AM/PM").
 * 
 * @param {string|null|undefined} val - Time in 24-hour format (e.g., "14:30")
 * @returns {string|null} - Time in 12-hour format (e.g., "2:30 PM") or null if invalid
 */
export const formatTime12h = (val) => {
  if (!val) return null;
  
  const parts = val.split(':');
  if (parts.length < 2) return val; // Try to handle invalid format gracefully

  const h = parseInt(parts[0], 10);
  const mStr = parts[1];
  
  if (isNaN(h)) return val;

  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  
  return `${h12}:${mStr} ${period}`;
};
