/**
 * Browser Push Notification service using the native Notification API.
 * No server required — works entirely client-side for PWA.
 */

const PERMISSION_KEY = 'lifelens_push_enabled';
const LAST_PUSH_KEY = 'lifelens_last_push';

/**
 * Check if browser supports notifications.
 */
export function isNotificationSupported() {
  return 'Notification' in window;
}

/**
 * Get current notification permission status.
 * @returns {'granted'|'denied'|'default'|'unsupported'}
 */
export function getPermissionStatus() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from the user.
 * @returns {Promise<boolean>} true if granted
 */
export async function requestPermission() {
  if (!isNotificationSupported()) return false;

  const result = await Notification.requestPermission();
  if (result === 'granted') {
    localStorage.setItem(PERMISSION_KEY, 'true');
    return true;
  }
  localStorage.removeItem(PERMISSION_KEY);
  return false;
}

/**
 * Check if user has opted in to push notifications.
 */
export function isPushEnabled() {
  return localStorage.getItem(PERMISSION_KEY) === 'true' && getPermissionStatus() === 'granted';
}

/**
 * Disable push notifications.
 */
export function disablePush() {
  localStorage.removeItem(PERMISSION_KEY);
}

/**
 * Send a local push notification.
 */
export function sendLocalNotification(title, body, tag = 'lifelens') {
  if (!isPushEnabled()) return;

  try {
    const notification = new Notification(title, {
      body,
      tag,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200]
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
}

/**
 * Check if a review reminder should be sent today and send it.
 * Call this on app mount.
 */
export function checkAndSendReviewReminder(triggerTypes) {
  if (!isPushEnabled() || triggerTypes.length === 0) return;

  const today = new Date().toISOString().slice(0, 10);
  const lastPush = localStorage.getItem(LAST_PUSH_KEY);
  if (lastPush === today) return; // Already sent today

  const typeLabels = {
    weekly: { title: '📅 Weekly Review Due!', body: "It's Saturday — time for your weekly pulse check across 9 life areas." },
    monthly: { title: '📆 Monthly Review Due!', body: "End of the month — reflect on your patterns and progress!" },
    quarterly: { title: '📊 Quarterly Review Due!', body: "Quarter's end — time for a deep strategic life review!" }
  };

  const primary = triggerTypes[0];
  const info = typeLabels[primary] || typeLabels.weekly;

  sendLocalNotification(info.title, info.body, `lifelens-${primary}`);
  localStorage.setItem(LAST_PUSH_KEY, today);
}
