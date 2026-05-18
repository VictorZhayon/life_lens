/**
 * Haptic feedback utilities using the Vibration API.
 * No-ops silently on unsupported browsers.
 */

function vibrate(pattern) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch {}
}

/** Quick light tap — for sliders, toggles */
export function lightTap() { vibrate(10); }

/** Medium tap — for button clicks */
export function mediumTap() { vibrate(25); }

/** Success pattern — for completions */
export function successVibrate() { vibrate([30, 50, 30]); }

/** Error pattern */
export function errorVibrate() { vibrate([50, 30, 50, 30, 50]); }

/** Long press feedback */
export function longPress() { vibrate(50); }
