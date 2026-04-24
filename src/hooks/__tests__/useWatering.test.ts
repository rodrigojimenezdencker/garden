import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWatering } from '../useWatering';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockUseAuthContext = vi.fn();
const mockUsePlants = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('../../hooks/usePlants', () => ({
  usePlants: () => mockUsePlants(),
}));

vi.mock('../../services/firestore', () => ({
  subscribeToCollection: (...args: unknown[]) =>
    mockSubscribeToCollection(...args),
  addDocument: (...args: unknown[]) => mockAddDocument(...args),
}));

const plants = [
  {
    id: 'plant-overdue',
    name: 'Lavanda',
    species: 'Lavandula',
    photoUrl: null,
    photoPath: null,
    zoneId: 'sun',
    notes: '',
    wateringFrequencyDays: 2,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: 'plant-today',
    name: 'Menta',
    species: 'Mentha',
    photoUrl: null,
    photoPath: null,
    zoneId: 'shade',
    notes: '',
    wateringFrequencyDays: 3,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: 'plant-upcoming',
    name: 'Romero',
    species: 'Rosmarinus',
    photoUrl: null,
    photoPath: null,
    zoneId: 'sun',
    notes: '',
    wateringFrequencyDays: 5,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: 'plant-never',
    name: 'Calathea',
    species: 'Calathea',
    photoUrl: null,
    photoPath: null,
    zoneId: 'indoor',
    notes: '',
    wateringFrequencyDays: 4,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

const logs = [
  {
    id: 'log-recent-overdue',
    plantId: 'plant-overdue',
    wateredAt: new Date('2024-04-20T10:00:00.000Z'),
    notes: 'Riego profundo',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-20T10:00:00.000Z'),
  },
  {
    id: 'log-old-overdue',
    plantId: 'plant-overdue',
    wateredAt: new Date('2024-04-10T10:00:00.000Z'),
    notes: '',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-10T10:00:00.000Z'),
  },
  {
    id: 'log-today',
    plantId: 'plant-today',
    wateredAt: new Date('2024-04-21T08:00:00.000Z'),
    notes: '',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-21T08:00:00.000Z'),
  },
  {
    id: 'log-upcoming',
    plantId: 'plant-upcoming',
    wateredAt: new Date('2024-04-23T09:00:00.000Z'),
    notes: '',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-23T09:00:00.000Z'),
  },
];

describe('useWatering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-24T10:00:00.000Z'));
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockUsePlants.mockReturnValue({
      plants,
      loading: false,
      getPlant: vi.fn(),
    });
    mockSubscribeToCollection.mockImplementation(
      (
        _collection,
        _constraints,
        callback: (nextLogs: typeof logs) => void,
      ) => {
        callback(logs);
        return vi.fn();
      },
    );
    mockAddDocument.mockResolvedValue('watering-log-id');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('subscribes to watering logs and computes plant schedules', async () => {
    const { result } = renderHook(() => useWatering());

    expect(result.current.loading).toBe(false);

    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'wateringLogs',
      [],
      expect.any(Function),
    );
    expect(result.current.logs.map((log) => log.id)).toEqual([
      'log-upcoming',
      'log-today',
      'log-recent-overdue',
      'log-old-overdue',
    ]);

    expect(result.current.schedules).toEqual([
      {
        plantId: 'plant-overdue',
        plantName: 'Lavanda',
        frequencyDays: 2,
        lastWateredAt: new Date('2024-04-20T10:00:00.000Z'),
        nextWateringDate: new Date('2024-04-22T10:00:00.000Z'),
        isOverdue: true,
        daysUntilNext: -2,
      },
      {
        plantId: 'plant-today',
        plantName: 'Menta',
        frequencyDays: 3,
        lastWateredAt: new Date('2024-04-21T08:00:00.000Z'),
        nextWateringDate: new Date('2024-04-24T08:00:00.000Z'),
        isOverdue: false,
        daysUntilNext: 0,
      },
      {
        plantId: 'plant-upcoming',
        plantName: 'Romero',
        frequencyDays: 5,
        lastWateredAt: new Date('2024-04-23T09:00:00.000Z'),
        nextWateringDate: new Date('2024-04-28T09:00:00.000Z'),
        isOverdue: false,
        daysUntilNext: 4,
      },
      {
        plantId: 'plant-never',
        plantName: 'Calathea',
        frequencyDays: 4,
        lastWateredAt: null,
        nextWateringDate: null,
        isOverdue: false,
        daysUntilNext: null,
      },
    ]);
    expect(result.current.dueToday.map((schedule) => schedule.plantId)).toEqual(
      ['plant-overdue', 'plant-today', 'plant-never'],
    );
    expect(
      result.current.dueThisWeek.map((schedule) => schedule.plantId),
    ).toEqual(['plant-upcoming']);
  });

  it('logs a watering event for the authenticated user', async () => {
    const { result } = renderHook(() => useWatering());

    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.logWatering('plant-overdue', '  Revisar drenaje  ');
    });

    expect(mockAddDocument).toHaveBeenCalledWith('wateringLogs', {
      plantId: 'plant-overdue',
      wateredAt: new Date('2024-04-24T10:00:00.000Z'),
      notes: 'Revisar drenaje',
      loggedBy: 'user-1',
    });
  });
});
