import type { WateringSchedule } from '../types';

export function getActiveReminders(
  schedules: WateringSchedule[],
): WateringSchedule[] {
  return schedules.filter((schedule) => {
    if (schedule.lastWateredAt === null) return true;
    if (schedule.isOverdue) return true;
    if (schedule.daysUntilNext === 0) return true;
    return false;
  });
}

export function getReminderCount(schedules: WateringSchedule[]): number {
  return getActiveReminders(schedules).length;
}
