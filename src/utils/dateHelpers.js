/**
 * Date helper utilities for review trigger detection.
 */

/**
 * Check if a date is a Saturday (weekly review trigger).
 */
export function isSaturday(date = new Date()) {
  return date.getDay() === 6;
}

/**
 * Check if a date is the last day of its month.
 */
export function isLastDayOfMonth(date = new Date()) {
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDate() === 1;
}

/**
 * Check if a date is the last day of a quarter (Q1=Mar, Q2=Jun, Q3=Sep, Q4=Dec).
 */
export function isLastDayOfQuarter(date = new Date()) {
  const quarterEndMonths = [2, 5, 8, 11]; // March, June, September, December
  return quarterEndMonths.includes(date.getMonth()) && isLastDayOfMonth(date);
}

/**
 * Get the review type(s) triggered today.
 * Returns array of triggered types; priority: quarterly > monthly > weekly
 */
export function getTriggerReviewTypes(date = new Date()) {
  const types = [];
  if (isLastDayOfQuarter(date)) types.push('quarterly');
  if (isLastDayOfMonth(date)) types.push('monthly');
  if (isSaturday(date)) types.push('weekly');
  return types;
}

/**
 * Get the primary (highest-priority) review type for today, or null.
 */
export function getPrimaryReviewType(date = new Date()) {
  const types = getTriggerReviewTypes(date);
  return types.length > 0 ? types[0] : null;
}

/**
 * Format a date as a readable string.
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get the review period label.
 */
export function getReviewPeriodLabel(reviewType, date = new Date()) {
  const d = new Date(date);
  switch (reviewType) {
    case 'weekly': {
      const start = new Date(d);
      start.setDate(start.getDate() - 6);
      return `${formatDate(start)} — ${formatDate(d)}`;
    }
    case 'monthly': {
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    case 'quarterly': {
      const quarter = Math.floor(d.getMonth() / 3) + 1;
      return `Q${quarter} ${d.getFullYear()}`;
    }
    default:
      return formatDate(d);
  }
}
