import { useCallback, useMemo, useState } from 'react';
import { getActiveReminders } from '../services/reminders';
import type { WateringSchedule } from '../types';
import { useWatering } from './useWatering';

interface UseRemindersReturn {
  reminders: WateringSchedule[];
  reminderCount: number;
  dismiss: (plantId: string) => void;
  hasUnacknowledged: boolean;
}

export function useReminders(): UseRemindersReturn {
  const { schedules } = useWatering();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const reminders = useMemo(() => getActiveReminders(schedules), [schedules]);

  const reminderCount = reminders.length;

  const dismiss = useCallback((plantId: string) => {
    setDismissedIds((prev) => new Set([...prev, plantId]));
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
