import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoneType } from '../../types';
import { getProtectedDeleteMessage, useZones } from '../useZones';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockDeleteDocument = vi.fn();
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
  updateDocument: (...args: unknown[]) => mockUpdateDocument(...args),
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
}));

const zones = [
  {
    id: 'zone-2',
    name: 'Terraza frontal',
    type: ZoneType.Terrace,
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    createdBy: 'user-1',
  },
  {
    id: 'zone-1',
    name: 'Sol directo',
    type: ZoneType.Sun,
    createdAt: new Date('2026-04-02T00:00:00.000Z'),
    createdBy: 'user-1',
  },
];

describe('useZones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockUsePlants.mockReturnValue({
      plants: [
        {
          id: 'plant-1',
          name: 'Lavanda',
          species: 'Lavandula',
          photoUrl: null,
          photoPath: null,
          zoneId: 'zone-1',
          notes: '',
          wateringFrequencyDays: 7,
          customCareData: null,
          createdBy: 'user-1',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z'),
        },
      ],
    });
    mockSubscribeToCollection.mockImplementation(
      (
        _collection,
        _constraints,
        callback: (nextZones: typeof zones) => void,
      ) => {
        callback(zones);
        return vi.fn();
      },
    );
    mockAddDocument.mockResolvedValue('zone-new');
    mockUpdateDocument.mockResolvedValue(undefined);
    mockDeleteDocument.mockResolvedValue(undefined);
  });

  it('subscribes to the shared zones collection', async () => {
    const { result } = renderHook(() => useZones());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'zones',
      [],
      expect.any(Function),
    );
    expect(result.current.zones.map((zone) => zone.id)).toEqual([
      'zone-1',
      'zone-2',
    ]);
  });

  it('adds a zone for the authenticated user', async () => {
    const { result } = renderHook(() => useZones());

    await act(async () => {
      await result.current.addZone('  Patio interior  ', ZoneType.Indoor);
    });

    expect(mockAddDocument).toHaveBeenCalledWith('zones', {
      name: 'Patio interior',
      type: 'indoor',
      createdBy: 'user-1',
    });
  });

  it('updates a zone', async () => {
    const { result } = renderHook(() => useZones());

    await act(async () => {
      await result.current.updateZone('zone-2', {
        name: '  Terraza principal  ',
        type: ZoneType.Sun,
      });
    });

    expect(mockUpdateDocument).toHaveBeenCalledWith('zones', 'zone-2', {
      name: 'Terraza principal',
      type: 'sun',
    });
  });

  it('prevents deleting zones with assigned plants', async () => {
    const { result } = renderHook(() => useZones());

    await expect(result.current.deleteZone('zone-1')).rejects.toThrow(
      getProtectedDeleteMessage(1),
    );
    expect(mockDeleteDocument).not.toHaveBeenCalled();
  });

  it('deletes zones without assigned plants', async () => {
    const { result } = renderHook(() => useZones());

    await act(async () => {
      await result.current.deleteZone('zone-2');
    });

    expect(mockDeleteDocument).toHaveBeenCalledWith('zones', 'zone-2');
  });

  it('creates default zones on first empty load', async () => {
    mockSubscribeToCollection.mockImplementationOnce(
      (
        _collection,
        _constraints,
        callback: (nextZones: typeof zones) => void,
      ) => {
        callback([]);
        callback([]);
        return vi.fn();
      },
    );

    renderHook(() => useZones());

    await waitFor(() => {
      expect(mockAddDocument).toHaveBeenCalledTimes(5);
    });

    expect(mockAddDocument).toHaveBeenNthCalledWith(1, 'zones', {
      name: 'Sol',
      type: ZoneType.Sun,
      createdBy: 'user-1',
    });
    expect(mockAddDocument).toHaveBeenNthCalledWith(2, 'zones', {
      name: 'Sombra',
      type: ZoneType.Shade,
      createdBy: 'user-1',
    });
    expect(mockAddDocument).toHaveBeenNthCalledWith(3, 'zones', {
      name: 'Terraza',
      type: ZoneType.Terrace,
      createdBy: 'user-1',
    });
    expect(mockAddDocument).toHaveBeenNthCalledWith(4, 'zones', {
      name: 'Interior',
      type: ZoneType.Indoor,
      createdBy: 'user-1',
    });
    expect(mockAddDocument).toHaveBeenNthCalledWith(5, 'zones', {
      name: 'Otra',
      type: ZoneType.Other,
      createdBy: 'user-1',
    });
  });
});
