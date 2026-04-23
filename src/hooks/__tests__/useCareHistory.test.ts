import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CareEvent } from '../../types/care';
import { CareType } from '../../types/care';
import { useCareHistory } from '../useCareHistory';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockUseAuthContext = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('firebase/firestore', () => ({
  where: (...args: unknown[]) => mockWhere(...args),
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
}));

vi.mock('../../services/firestore', () => ({
  subscribeToCollection: (...args: unknown[]) =>
    mockSubscribeToCollection(...args),
  addDocument: (...args: unknown[]) => mockAddDocument(...args),
}));

const newerEvent: CareEvent = {
  id: 'event-2',
  plantId: 'plant-2',
  type: CareType.Prune,
  date: new Date('2026-04-24T12:00:00.000Z'),
  notes: 'Ramas secas fuera',
  loggedBy: 'user-1',
  createdAt: new Date('2026-04-24T12:00:00.000Z'),
};

const olderEvent: CareEvent = {
  id: 'event-1',
  plantId: 'plant-1',
  type: CareType.Water,
  date: new Date('2026-04-22T12:00:00.000Z'),
  notes: 'Riego profundo',
  loggedBy: 'user-1',
  createdAt: new Date('2026-04-22T12:00:00.000Z'),
};

describe('useCareHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockWhere.mockReturnValue('where-logged-by');
    mockOrderBy.mockReturnValue('order-by-date');
    mockSubscribeToCollection.mockImplementation(
      (_collection, _constraints, callback: (events: CareEvent[]) => void) => {
        callback([olderEvent, newerEvent]);
        return vi.fn();
      },
    );
    mockAddDocument.mockResolvedValue('new-event-id');
  });

  it('subscribes to the user care events ordered by date desc', async () => {
    const { result } = renderHook(() => useCareHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockWhere).toHaveBeenCalledWith('loggedBy', '==', 'user-1');
    expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc');
    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'careEvents',
      ['where-logged-by', 'order-by-date'],
      expect.any(Function),
    );
    expect(result.current.events).toEqual([newerEvent, olderEvent]);
  });

  it('adds a care event for the authenticated user', async () => {
    const { result } = renderHook(() => useCareHistory());

    await act(async () => {
      await result.current.addCareEvent({
        plantId: 'plant-1',
        type: CareType.Fertilize,
        date: new Date('2026-04-21T12:00:00.000Z'),
        notes: ' abono líquido ',
      });
    });

    expect(mockAddDocument).toHaveBeenCalledWith('careEvents', {
      plantId: 'plant-1',
      type: CareType.Fertilize,
      date: new Date('2026-04-21T12:00:00.000Z'),
      notes: 'abono líquido',
      loggedBy: 'user-1',
    });
  });

  it('returns events filtered by plant from local state', async () => {
    const { result } = renderHook(() => useCareHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.getEventsForPlant('plant-1')).toEqual([olderEvent]);
    expect(result.current.getEventsForPlant('missing')).toEqual([]);
  });
});
