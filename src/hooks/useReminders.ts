import { useCallback, useMemo, useState } from 'react';
import { getActiveReminders } from '../services/reminders';
import type { WateringSchedule } from '../types';
import { useWatering } from './useWatering';

const DISMISSED_REMINDERS_STORAGE_KEY = 'garden-app:dismissed-reminders';

const getStoredDismissedIds = () => {
  try {
    const storedDismissedIds = window.sessionStorage.getItem(
      DISMISSED_REMINDERS_STORAGE_KEY,
    );

    if (!storedDismissedIds) {
      return new Set<string>();
    }

    const parsedDismissedIds: unknown = JSON.parse(storedDismissedIds);

    if (!Array.isArray(parsedDismissedIds)) {
      return new Set<string>();
    }

    return new Set(
      parsedDismissedIds.filter(
        (dismissedId): dismissedId is string => typeof dismissedId === 'string',
      ),
    );
  } catch {
    return new Set<string>();
  }
};

const persistDismissedIds = (dismissedIds: Set<string>) => {
  window.sessionStorage.setItem(
    DISMISSED_REMINDERS_STORAGE_KEY,
    JSON.stringify([...dismissedIds]),
  );
};

interface UseRemindersReturn {
  reminders: WateringSchedule[];
  reminderCount: number;
  dismiss: (plantId: string) => void;
  hasUnacknowledged: boolean;
}

export function useReminders(): UseRemindersReturn {
  const { schedules } = useWatering();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(
    getStoredDismissedIds,
  );

  const reminders = useMemo(() => getActiveReminders(schedules), [schedules]);

  const reminderCount = reminders.length;

  const dismiss = useCallback((plantId: string) => {
    setDismissedIds((prev) => {
      const nextDismissedIds = new Set([...prev, plantId]);

      persistDismissedIds(nextDismissedIds);

      return nextDismissedIds;
    });
  }, []);

  const hasUnacknowledged = useMemo(
    () => reminders.some((r) => !dismissedIds.has(r.plantId)),
    [reminders, dismissedIds],
  );

  return useMemo(
    () => ({ reminders, reminderCount, dismiss, hasUnacknowledged }),
    [reminders, reminderCount, dismiss, hasUnacknowledged],
  );
}
