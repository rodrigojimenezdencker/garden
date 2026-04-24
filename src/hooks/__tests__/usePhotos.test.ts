import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlantPhoto } from '../../types';
import { usePhotos } from '../usePhotos';

const mockSubscribeToCollection = vi.fn();
const mockAddDocument = vi.fn();
const mockDeleteDocument = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockUseAuthContext = vi.fn();
const mockUploadPhoto = vi.fn();
const mockDeleteStoragePhoto = vi.fn();

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
  deleteDocument: (...args: unknown[]) => mockDeleteDocument(...args),
}));

vi.mock('../../services/storage', () => ({
  uploadPhoto: (...args: unknown[]) => mockUploadPhoto(...args),
  deletePhoto: (...args: unknown[]) => mockDeleteStoragePhoto(...args),
}));

const newerPhoto: PlantPhoto = {
  id: 'photo-2',
  plantId: 'plant-1',
  url: 'https://example.com/photo2.jpg',
  storagePath: 'plant-photos/plant-1/photo2.jpg',
  caption: 'Floreciendo',
  takenAt: new Date('2026-04-20T10:00:00.000Z'),
  uploadedBy: 'user-1',
  createdAt: new Date('2026-04-20T10:00:00.000Z'),
};

const olderPhoto: PlantPhoto = {
  id: 'photo-1',
  plantId: 'plant-1',
  url: 'https://example.com/photo1.jpg',
  storagePath: 'plant-photos/plant-1/photo1.jpg',
  caption: null,
  takenAt: new Date('2026-04-10T10:00:00.000Z'),
  uploadedBy: 'user-1',
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
};

describe('usePhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ user: { uid: 'user-1' } });
    mockWhere.mockReturnValue('where-plant-id');
    mockOrderBy.mockReturnValue('order-by-taken-at');
    mockSubscribeToCollection.mockImplementation(
      (_collection, _constraints, callback: (photos: PlantPhoto[]) => void) => {
        callback([newerPhoto, olderPhoto]);
        return vi.fn();
      },
    );
    mockAddDocument.mockResolvedValue('new-photo-id');
    mockUploadPhoto.mockResolvedValue('https://example.com/uploaded.jpg');
    mockDeleteDocument.mockResolvedValue(undefined);
    mockDeleteStoragePhoto.mockResolvedValue(undefined);
  });

  it('subscribes to photos filtered by plantId sorted by takenAt desc', async () => {
    const { result } = renderHook(() => usePhotos('plant-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockWhere).toHaveBeenCalledWith('plantId', '==', 'plant-1');
    expect(mockOrderBy).toHaveBeenCalledWith('takenAt', 'desc');
    expect(mockSubscribeToCollection).toHaveBeenCalledWith(
      'photos',
      ['where-plant-id', 'order-by-taken-at'],
      expect.any(Function),
    );
    expect(result.current.photos).toEqual([newerPhoto, olderPhoto]);
  });

  it('uploads file and adds document on addPhoto', async () => {
    const { result } = renderHook(() => usePhotos('plant-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(['img'], 'rose.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.addPhoto('plant-1', file, ' Primera foto ');
    });

    expect(mockUploadPhoto).toHaveBeenCalledWith(
      file,
      expect.stringContaining('plant-photos/plant-1/'),
    );
    expect(mockAddDocument).toHaveBeenCalledWith(
      'photos',
      expect.objectContaining({
        plantId: 'plant-1',
        url: 'https://example.com/uploaded.jpg',
        caption: 'Primera foto',
        uploadedBy: 'user-1',
      }),
    );
  });

  it('rejects addPhoto when 20 photos already exist', async () => {
    const twentyPhotos: PlantPhoto[] = Array.from({ length: 20 }, (_, i) => ({
      id: `photo-${i}`,
      plantId: 'plant-1',
      url: `https://example.com/${i}.jpg`,
      storagePath: `plant-photos/plant-1/${i}.jpg`,
      caption: null,
      takenAt: new Date(),
      uploadedBy: 'user-1',
      createdAt: new Date(),
    }));

    mockSubscribeToCollection.mockImplementation(
      (_c, _q, callback: (photos: PlantPhoto[]) => void) => {
        callback(twentyPhotos);
        return vi.fn();
      },
    );

    const { result } = renderHook(() => usePhotos('plant-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    const file = new File(['img'], 'extra.jpg', { type: 'image/jpeg' });

    await expect(
      act(async () => {
        await result.current.addPhoto('plant-1', file);
      }),
    ).rejects.toThrow('Máximo 20 fotos por planta');

    expect(mockUploadPhoto).not.toHaveBeenCalled();
  });

  it('deletes from storage and firestore on deletePhoto', async () => {
    const { result } = renderHook(() => usePhotos('plant-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deletePhoto('photo-1');
    });

    expect(mockDeleteStoragePhoto).toHaveBeenCalledWith(
      'plant-photos/plant-1/photo1.jpg',
    );
    expect(mockDeleteDocument).toHaveBeenCalledWith('photos', 'photo-1');
  });
});
