import { useEffect, useRef } from 'react';
import { getReminders } from '../api/reminders';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const NOTIFIED_KEY = 'farmco_notified_reminders';

function readNotified() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'));
  } catch (e) {
    return new Set();
  }
}

function writeNotified(set) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set].slice(-200)));
  } catch (e) {
    /* ignore */
  }
}

async function maybeAskNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      /* ignore */
    }
  }
}

/**
 * Polls reminders every 30s and surfaces due/overdue ones as toasts
 * + browser notifications so users actually "get" reminders in-app
 * even when SMS fails.
 */
export function ReminderWatcher({ children }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return undefined;

    maybeAskNotificationPermission();

    const check = async () => {
      try {
        const reminders = await getReminders(user._id);
        if (!Array.isArray(reminders)) return;

        const now = Date.now();
        const notified = readNotified();
        let changed = false;

        for (const r of reminders) {
          if (!r || !r._id || !r.date) continue;
          const dueAt = new Date(r.date).getTime();
          if (Number.isNaN(dueAt)) continue;

          // Fire when due (within past 24h window so we don't spam ancient ones)
          const overdueMs = now - dueAt;
          if (overdueMs < 0 || overdueMs > 24 * 60 * 60 * 1000) continue;
          if (notified.has(r._id)) continue;

          // Alert for pending reminders, OR ones just marked sent by cron
          // (so SMS success doesn't hide the in-app toast)
          notified.add(r._id);
          changed = true;

          const when = new Date(r.date).toLocaleString();
          const msg = `Reminder: ${r.message}`;
          toastRef.current.info(`${msg} (${when})`, 10000);

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              // eslint-disable-next-line no-new
              new Notification('Farm.co Reminder', {
                body: `${r.message}\n${when}`,
                tag: `reminder-${r._id}`,
              });
            } catch (e) {
              /* ignore */
            }
          }
        }

        if (changed) writeNotified(notified);
      } catch (err) {
        /* silent — offline / auth */
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated, user?._id]);

  return children || null;
}
