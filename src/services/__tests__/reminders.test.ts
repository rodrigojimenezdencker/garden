import { describe, expect, it } from 'vitest';
import type { WateringSchedule } from '../../types';
import { getActiveReminders, getReminderCount } from '../reminders';

const makeSchedule = (
  overrides: Partial<WateringSchedule> = {},
): WateringSchedule => ({
  plantId: 'plant-1',
  plantName: 'Lavanda',
  frequencyDays: 3,
  lastWateredAt: new Date('2024-06-01'),
  nextWateringDate: new Date('2024-06-04'),
  isOverdue: false,
  daysUntilNext: 5,
  ...overrides,
});

describe('getActiveReminders', () => {
  it('returns overdue schedules', () => {
    const schedules = [
      makeSchedule({ plantId: 'overdue', isOverdue: true, daysUntilNext: -2 }),
      makeSchedule({ plantId: 'ok', isOverdue: false, daysUntilNext: 3 }),
    ];

    const result = getActiveReminders(schedules);

    expect(result).toHaveLength(1);
    expect(result[0].plantId).toBe('overdue');
  });

  it('returns schedules due today', () => {
    const schedules = [
      makeSchedule({ plantId: 'today', daysUntilNext: 0 }),
      makeSchedule({ plantId: 'tomorrow', daysUntilNext: 1 }),
    ];

    const result = getActiveReminders(schedules);

    expect(result).toHaveLength(1);
    expect(result[0].plantId).toBe('today');
  });

  it('returns schedules never watered', () => {
    const schedules = [
      makeSchedule({
        plantId: 'never',
        lastWateredAt: null,
        nextWateringDate: null,
        daysUntilNext: null,
      }),
      makeSchedule({ plantId: 'watered', daysUntilNext: 2 }),
    ];

    const result = getActiveReminders(schedules);

    expect(result).toHaveLength(1);
    expect(result[0].plantId).toBe('never');
  });

  it('returns empty array when no reminders needed', () => {
    const schedules = [
      makeSchedule({ plantId: 'ok-1', daysUntilNext: 3 }),
      makeSchedule({ plantId: 'ok-2', daysUntilNext: 1 }),
    ];

    expect(getActiveReminders(schedules)).toHaveLength(0);
  });

  it('returns multiple active reminders', () => {
    const schedules = [
      makeSchedule({ plantId: 'overdue', isOverdue: true, daysUntilNext: -1 }),
      makeSchedule({ plantId: 'today', daysUntilNext: 0 }),
      makeSchedule({
        plantId: 'never',
        lastWateredAt: null,
        nextWateringDate: null,
        daysUntilNext: null,
      }),
      makeSchedule({ plantId: 'ok', daysUntilNext: 5 }),
    ];

    expect(getActiveReminders(schedules)).toHaveLength(3);
  });

  it('handles empty schedules', () => {
    expect(getActiveReminders([])).toHaveLength(0);
  });
});

describe('getReminderCount', () => {
  it('returns the count of active reminders', () => {
    const schedules = [
      makeSchedule({ plantId: 'overdue', isOverdue: true, daysUntilNext: -1 }),
      makeSchedule({ plantId: 'today', daysUntilNext: 0 }),
      makeSchedule({ plantId: 'ok', daysUntilNext: 5 }),
    ];

    expect(getReminderCount(schedules)).toBe(2);
  });

  it('returns 0 for empty schedules', () => {
    expect(getReminderCount([])).toBe(0);
  });
});
