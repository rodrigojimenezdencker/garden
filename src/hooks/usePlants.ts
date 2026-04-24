import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS, STORAGE_PATHS } from '../lib/constants';
import {
  addDocument,
  deleteDocument,
  subscribeToCollection,
  updateDocument,
} from '../services/firestore';
import { deletePhoto, uploadPhoto } from '../services/storage';
import type { Plant } from '../types';

type PlantMutationData = Pick<
  Plant,
  | 'name'
  | 'species'
  | 'zoneId'
  | 'notes'
  | 'wateringFrequencyDays'
  | 'customCareData'
>;

type PlantUpdateData = Partial<PlantMutationData>;

interface UsePlantsReturn {
  plants: Plant[];
  loading: boolean;
  addPlant: (data: PlantMutationData, photoFile?: File) => Promise<string>;
  updatePlant: (
    id: string,
    data: PlantUpdateData,
    photoFile?: File,
  ) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  getPlant: (id: string) => Plant | undefined;
}

const buildPhotoPath = (file: File) => {
  return `${STORAGE_PATHS.PLANT_PHOTOS}/${Date.now()}-${file.name}`;
};

const getPhotoStoragePath = (plant: Pick<Plant, 'photoPath' | 'photoUrl'>) => {
  if (plant.photoPath) {
    return plant.photoPath;
  }

  if (!plant.photoUrl) {
    return null;
  }

  try {
    const url = new URL(plant.photoUrl);
    const encodedPath = url.pathname.split('/o/')[1];

    if (!encodedPath) {
      return plant.photoUrl;
    }

    return decodeURIComponent(encodedPath);
  } catch {
    return plant.photoUrl;
  }
};

export function usePlants(): UsePlantsReturn {
  const { user } = useAuthContext();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPlants([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCollection<Plant>(
      COLLECTIONS.PLANTS,
      [],
      (nextPlants) => {
        setPlants(
          [...nextPlants].sort((left, right) =>
            left.name.localeCompare(right.name),
          ),
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addPlant = useCallback(
    async (data: PlantMutationData, photoFile?: File) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      let photoUrl: string | null = null;
      let photoPath: string | null = null;

      if (photoFile) {
        photoPath = buildPhotoPath(photoFile);
        photoUrl = await uploadPhoto(photoFile, photoPath);
      }

      return addDocument<Plant>(COLLECTIONS.PLANTS, {
        ...data,
        photoUrl,
        photoPath,
        createdBy: user.uid,
      });
    },
    [user],
  );

  const updatePlantById = useCallback(
    async (id: string, data: PlantUpdateData, photoFile?: File) => {
      const existingPlant = plants.find((plant) => plant.id === id);
      if (!existingPlant) {
        throw new Error('Planta no encontrada');
      }

      const nextData: Partial<Plant> = { ...data };
      const previousPhotoPath = getPhotoStoragePath(existingPlant);

      if (photoFile) {
        const photoPath = buildPhotoPath(photoFile);
        const photoUrl = await uploadPhoto(photoFile, photoPath);

        nextData.photoUrl = photoUrl;
        nextData.photoPath = photoPath;
      }

      await updateDocument<Plant>(COLLECTIONS.PLANTS, id, nextData);

      if (photoFile && previousPhotoPath) {
        await deletePhoto(previousPhotoPath);
      }
    },
    [plants],
  );

  const deletePlantById = useCallback(
    async (id: string) => {
      const existingPlant = plants.find((plant) => plant.id === id);
      if (!existingPlant) {
        throw new Error('Planta no encontrada');
      }

      const photoPath = getPhotoStoragePath(existingPlant);

      if (photoPath) {
        await deletePhoto(photoPath);
      }

      await deleteDocument(COLLECTIONS.PLANTS, id);
    },
    [plants],
  );

  const getPlant = useCallback(
    (id: string) => {
      return plants.find((plant) => plant.id === id);
    },
    [plants],
  );

  return useMemo(
    () => ({
      plants,
      loading,
      addPlant,
      updatePlant: updatePlantById,
      deletePlant: deletePlantById,
      getPlant,
    }),
    [plants, loading, addPlant, updatePlantById, deletePlantById, getPlant],
  );
}

export type { PlantMutationData, PlantUpdateData };
