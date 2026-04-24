import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CareEvent } from '../../types/care';
import { CareType } from '../../types/care';
import { useCareHistory } from '../useCareHistory';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockGetPaginatedDocuments = vi.fn();
const mockDeleteDocument = vi.fn();
const mockUseAuthContext = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('firebase/firestore', () => ({
  orderBy: (...args: unknown[]) => mockOrderBy(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
}));

vi.mock('../../services/firestore', () => ({
  subscribeToCollection: (...args: unknown[]) =>
    mockSubscribeToCollection(...args),
  addDocument: (...args: unknown[]) => mockAddDocument(...args),
  getPaginatedDocuments: (...args: unknown[]) =>
    mockGetPaginatedDocuments(...args),
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
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

const olderPageEvent: CareEvent = {
  id: 'event-3',
  plantId: 'plant-1',
  type: CareType.Fertilize,
  date: new Date('2026-04-20T12:00:00.000Z'),
  notes: 'Abono',
  loggedBy: 'user-2',
  createdAt: new Date('2026-04-20T12:00:00.000Z'),
};

const lastDocSnapshot = { id: 'snapshot-1' };

describe('useCareHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockOrderBy.mockReturnValue('order-by-date');
    mockLimit.mockReturnValue('limit-20');
    mockSubscribeToCollection.mockImplementation(
      (_collection, _constraints, callback: (events: CareEvent[]) => void) => {
        callback([olderEvent, newerEvent]);
        return vi.fn();
      },
    );
    mockGetPaginatedDocuments.mockResolvedValue({
      data: [newerEvent, olderEvent],
      lastDoc: lastDocSnapshot,
      hasMore: true,
    });
    mockAddDocument.mockResolvedValue('new-event-id');
    mockDeleteDocument.mockResolvedValue(undefined);
  });

  it('subscribes to shared care events ordered by date desc and limited to 20', async () => {
    const { result } = renderHook(() => useCareHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.hasMore).toBe(true));

    expect(mockOrderBy).toHaveBeenCalledWith('date', 'desc');
    expect(mockLimit).toHaveBeenCalledWith(20);
    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'careEvents',
      ['order-by-date', 'limit-20'],
      expect.any(Function),
    );
    expect(mockGetPaginatedDocuments).toHaveBeenCalledWith(
      'careEvents',
      20,
      null,
      'order-by-date',
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

  it('loads more care events with pagination', async () => {
    mockGetPaginatedDocuments
      .mockResolvedValueOnce({
        data: [newerEvent, olderEvent],
        lastDoc: lastDocSnapshot,
        hasMore: true,
      })
      .mockResolvedValueOnce({
        data: [olderPageEvent],
        lastDoc: null,
        hasMore: false,
      });

    const { result } = renderHook(() => useCareHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockGetPaginatedDocuments).toHaveBeenLastCalledWith(
      'careEvents',
      20,
      lastDocSnapshot,
      'order-by-date',
    );
    expect(result.current.events).toEqual([
      newerEvent,
      olderEvent,
      olderPageEvent,
    ]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingMore).toBe(false);
  });

  it('deletes a care event', async () => {
    const { result } = renderHook(() => useCareHistory());

    await act(async () => {
      await result.current.deleteCareEvent('event-1');
    });

    expect(mockDeleteDocument).toHaveBeenCalledWith('careEvents', 'event-1');
  });
});
