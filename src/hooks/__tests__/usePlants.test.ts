import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePlants } from '../usePlants';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockUpdateDocument = vi.fn();
const mockDeleteDocument = vi.fn();
const mockUploadPhoto = vi.fn();
const mockDeletePhoto = vi.fn();
const mockUseAuthContext = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('../../services/firestore', () => ({
  subscribeToCollection: (...args: unknown[]) =>
    mockSubscribeToCollection(...args),
  addDocument: (...args: unknown[]) => mockAddDocument(...args),
  updateDocument: (...args: unknown[]) => mockUpdateDocument(...args),
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
}));

vi.mock('../../services/storage', () => ({
  uploadPhoto: (...args: unknown[]) => mockUploadPhoto(...args),
  deletePhoto: (...args: unknown[]) => mockDeletePhoto(...args),
}));

const now = new Date('2024-04-24T10:00:00.000Z');

const plant = {
  id: 'plant-1',
  name: 'Lavanda',
  species: 'Lavandula angustifolia',
  photoUrl: 'https://example.com/lavanda.jpg',
  photoPath: 'plant-photos/old.jpg',
  zoneId: 'sun',
  notes: 'Exterior',
  wateringFrequencyDays: 7,
  customCareData: null,
  createdBy: 'user-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
};

describe('usePlants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockSubscribeToCollection.mockImplementation(
      (
        _collection,
        _constraints,
        callback: (plants: (typeof plant)[]) => void,
      ) => {
        callback([plant]);
        return vi.fn();
      },
    );
    mockAddDocument.mockResolvedValue('new-plant-id');
    mockUpdateDocument.mockResolvedValue(undefined);
    mockDeleteDocument.mockResolvedValue(undefined);
    mockUploadPhoto.mockResolvedValue('https://example.com/new-photo.jpg');
    mockDeletePhoto.mockResolvedValue(undefined);
    vi.spyOn(Date, 'now').mockReturnValue(now.getTime());
  });

  it('subscribes to the shared plants collection', async () => {
    const { result } = renderHook(() => usePlants());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'plants',
      [],
      expect.any(Function),
    );
    expect(result.current.plants).toEqual([plant]);
  });

  it('adds a plant with uploaded photo', async () => {
    const file = new File(['image'], 'lavanda.jpg', { type: 'image/jpeg' });
    const { result } = renderHook(() => usePlants());

    await act(async () => {
      await result.current.addPlant(
        {
          name: 'Lavanda',
          species: 'Lavandula angustifolia',
          zoneId: 'sun',
          notes: 'Terraza',
          wateringFrequencyDays: 7,
          customCareData: null,
        },
        file,
      );
    });

    expect(mockUploadPhoto).toHaveBeenCalledWith(
      file,
      'plant-photos/1713952800000-lavanda.jpg',
    );
    expect(mockAddDocument).toHaveBeenCalledWith('plants', {
      name: 'Lavanda',
      species: 'Lavandula angustifolia',
      zoneId: 'sun',
      notes: 'Terraza',
      wateringFrequencyDays: 7,
      customCareData: null,
      photoUrl: 'https://example.com/new-photo.jpg',
      photoPath: 'plant-photos/1713952800000-lavanda.jpg',
      createdBy: 'user-1',
    });
  });

  it('updates a plant and replaces old photo', async () => {
    const file = new File(['image'], 'nueva.jpg', { type: 'image/jpeg' });
    const { result } = renderHook(() => usePlants());

    await act(async () => {
      await result.current.updatePlant(
        'plant-1',
        {
          notes: 'Podada',
        },
        file,
      );
    });

    expect(mockUploadPhoto).toHaveBeenCalledWith(
      file,
      'plant-photos/1713952800000-nueva.jpg',
    );
    expect(mockDeletePhoto).toHaveBeenCalledWith('plant-photos/old.jpg');
    expect(mockUpdateDocument).toHaveBeenCalledWith('plants', 'plant-1', {
      notes: 'Podada',
      photoUrl: 'https://example.com/new-photo.jpg',
      photoPath: 'plant-photos/1713952800000-nueva.jpg',
    });
  });

  it('deletes a plant and its photo', async () => {
    const { result } = renderHook(() => usePlants());

    await act(async () => {
      await result.current.deletePlant('plant-1');
    });

    expect(mockDeletePhoto).toHaveBeenCalledWith('plant-photos/old.jpg');
    expect(mockDeleteDocument).toHaveBeenCalledWith('plants', 'plant-1');
  });

  it('gets a plant from local state', () => {
    const { result } = renderHook(() => usePlants());

    expect(result.current.getPlant('plant-1')).toEqual(plant);
    expect(result.current.getPlant('missing')).toBeUndefined();
  });
});
