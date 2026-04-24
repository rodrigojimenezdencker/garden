import { orderBy, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS, STORAGE_PATHS } from '../lib/constants';
import {
  addDocument,
  deleteDocument,
  subscribeToCollection,
} from '../services/firestore';
import {
  deletePhoto as deleteStoragePhoto,
  uploadPhoto,
} from '../services/storage';
import type { PlantPhoto } from '../types';

const MAX_PHOTOS = 20;

interface UsePhotosReturn {
  photos: PlantPhoto[];
  loading: boolean;
  addPhoto: (
    photoPlantId: string,
    file: File,
    caption?: string,
  ) => Promise<void>;
  deletePhoto: (photoId: string) => Promise<void>;
}

export function usePhotos(plantId: string): UsePhotosReturn {
  const { user } = useAuthContext();
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCollection<PlantPhoto>(
      COLLECTIONS.PHOTOS,
      [where('plantId', '==', plantId), orderBy('takenAt', 'desc')],
      (nextPhotos) => {
        setPhotos(nextPhotos);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user, plantId]);

  const addPhoto = useCallback(
    async (photoPlantId: string, file: File, caption?: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (photos.length >= MAX_PHOTOS) {
        throw new Error('Máximo 20 fotos por planta');
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}_${safeName}`;
      const storagePath = `${STORAGE_PATHS.PLANT_PHOTOS}/${photoPlantId}/${fileName}`;

      const url = await uploadPhoto(file, storagePath);

      await addDocument<PlantPhoto>(COLLECTIONS.PHOTOS, {
        plantId: photoPlantId,
        url,
        storagePath,
        caption: caption?.trim() || null,
        takenAt: new Date(),
        uploadedBy: user.uid,
      });
    },
    [user, photos.length],
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      const photo = photos.find((p) => p.id === photoId);

      if (photo) {
        await deleteStoragePhoto(photo.storagePath);
      }

      await deleteDocument(COLLECTIONS.PHOTOS, photoId);
    },
    [photos],
  );

  return useMemo(
    () => ({
      photos,
      loading,
      addPhoto,
      deletePhoto,
    }),
    [photos, loading, addPhoto, deletePhoto],
  );
}
