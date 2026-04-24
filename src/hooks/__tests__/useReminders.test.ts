import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WateringSchedule } from '../../types';
import { useReminders } from '../useReminders';

const mockUseWatering = vi.fn();

vi.mock('../useWatering', () => ({
  useWatering: () => mockUseWatering(),
}));

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

describe('useReminders', () => {
  it('returns active reminders from schedules', () => {
    mockUseWatering.mockReturnValue({
      schedules: [
        makeSchedule({
          plantId: 'overdue',
          isOverdue: true,
          daysUntilNext: -1,
        }),
        makeSchedule({ plantId: 'ok', daysUntilNext: 3 }),
      ],
    });

    const { result } = renderHook(() => useReminders());

    expect(result.current.reminders).toHaveLength(1);
    expect(result.current.reminderCount).toBe(1);
    expect(result.current.hasUnacknowledged).toBe(true);
  });

  it('returns hasUnacknowledged false when no reminders', () => {
    mockUseWatering.mockReturnValue({
      schedules: [makeSchedule({ daysUntilNext: 3 })],
    });

    const { result } = renderHook(() => useReminders());

    expect(result.current.reminders).toHaveLength(0);
    expect(result.current.reminderCount).toBe(0);
    expect(result.current.hasUnacknowledged).toBe(false);
  });

  it('dismiss removes plant from unacknowledged', () => {
    mockUseWatering.mockReturnValue({
      schedules: [
        makeSchedule({ plantId: 'a', isOverdue: true, daysUntilNext: -1 }),
        makeSchedule({ plantId: 'b', daysUntilNext: 0 }),
      ],
    });

    const { result } = renderHook(() => useReminders());

    expect(result.current.hasUnacknowledged).toBe(true);

    act(() => {
      result.current.dismiss('a');
    });

    expect(result.current.hasUnacknowledged).toBe(true);
    expect(result.current.reminderCount).toBe(2);

    act(() => {
      result.current.dismiss('b');
    });

    expect(result.current.hasUnacknowledged).toBe(false);
    expect(result.current.reminderCount).toBe(2);
  });

  it('dismiss does not affect reminderCount', () => {
    mockUseWatering.mockReturnValue({
      schedules: [
        makeSchedule({ plantId: 'x', isOverdue: true, daysUntilNext: -1 }),
      ],
    });

    const { result } = renderHook(() => useReminders());

    act(() => {
      result.current.dismiss('x');
    });

    expect(result.current.reminderCount).toBe(1);
    expect(result.current.hasUnacknowledged).toBe(false);
  });
});
