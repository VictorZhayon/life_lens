import { useState, useEffect, useCallback } from 'react';
import { getTriggerReviewTypes } from '../utils/dateHelpers';
import { sendReminder } from '../services/emailjs';

const NOTIFIED_KEY = 'lifelens_last_notified';
const EMAILJS_CONFIG_KEY = 'lifelens_emailjs_config';

export function useNotifications() {
  const [triggerTypes, setTriggerTypes] = useState([]);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    const types = getTriggerReviewTypes();
    setTriggerTypes(types);

    if (types.length > 0) {
      tryAutoSendEmail(types);
    }
  }, []);

  const tryAutoSendEmail = async (types) => {
    const today = new Date().toISOString().slice(0, 10);
    const lastNotified = localStorage.getItem(NOTIFIED_KEY);

    if (lastNotified === today) return; // already notified today

    const config = getEmailJSConfig();
    if (!config?.serviceId || !config?.templateId || !config?.publicKey || !config?.email) return;

    try {
      await sendReminder(types[0], config.email, config.serviceId, config.templateId, config.publicKey);
      localStorage.setItem(NOTIFIED_KEY, today);
    } catch (err) {
      console.error('Failed to send email notification:', err);
    }
  };

  const getEmailJSConfig = useCallback(() => {
    try {
      const data = localStorage.getItem(EMAILJS_CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const saveEmailJSConfig = useCallback((config) => {
    localStorage.setItem(EMAILJS_CONFIG_KEY, JSON.stringify(config));
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  const showBanner = triggerTypes.length > 0 && !bannerDismissed;

  return {
    triggerTypes,
    showBanner,
    dismissBanner,
    getEmailJSConfig,
    saveEmailJSConfig
  };
}

export default useNotifications;
