import { where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS } from '../lib/constants';
import {
  addDocument,
  deleteDocument,
  subscribeToCollection,
  updateDocument,
} from '../services/firestore';
import type { GardenZone, Plant, ZoneType as ZoneTypeValue } from '../types';
import { usePlants } from './usePlants';

type ZoneDocument = GardenZone & {
  createdBy: string;
  updatedAt?: Date;
};

type ZoneUpdateData = Partial<Pick<GardenZone, 'name' | 'type'>>;

interface UseZonesReturn {
  zones: GardenZone[];
  loading: boolean;
  addZone: (name: string, type: ZoneTypeValue) => Promise<string>;
  updateZone: (id: string, data: ZoneUpdateData) => Promise<void>;
  deleteZone: (id: string) => Promise<void>;
}

const getProtectedDeleteMessage = (count: number) => {
  return `Reasigna ${count} planta(s) antes de eliminar esta zona`;
};

export function useZones(): UseZonesReturn {
  const { user } = useAuthContext();
  const { plants } = usePlants();
  const [zones, setZones] = useState<GardenZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setZones([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCollection<ZoneDocument>(
      COLLECTIONS.ZONES,
      [where('createdBy', '==', user.uid)],
      (nextZones) => {
        setZones(
          [...nextZones].sort((left, right) =>
            left.name.localeCompare(right.name),
          ),
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addZone = useCallback(
    async (name: string, type: ZoneTypeValue) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error('Introduce un nombre para la zona');
      }

      return addDocument<ZoneDocument>(COLLECTIONS.ZONES, {
        name: trimmedName,
        type,
        createdBy: user.uid,
      });
    },
    [user],
  );

  const updateZoneById = useCallback(
    async (id: string, data: ZoneUpdateData) => {
      const existingZone = zones.find((zone) => zone.id === id);

      if (!existingZone) {
        throw new Error('Zona no encontrada');
      }

      const nextData: ZoneUpdateData = { ...data };

      if (typeof nextData.name === 'string') {
        nextData.name = nextData.name.trim();

        if (!nextData.name) {
          throw new Error('Introduce un nombre para la zona');
        }
      }

      await updateDocument<ZoneDocument>(COLLECTIONS.ZONES, id, nextData);
    },
    [zones],
  );

  const deleteZoneById = useCallback(
    async (id: string) => {
      const existingZone = zones.find((zone) => zone.id === id);

      if (!existingZone) {
        throw new Error('Zona no encontrada');
      }

      const assignedPlantCount = plants.filter(
        (plant: Plant) => plant.zoneId === id,
      ).length;

      if (assignedPlantCount > 0) {
        throw new Error(getProtectedDeleteMessage(assignedPlantCount));
      }

      await deleteDocument(COLLECTIONS.ZONES, id);
    },
    [plants, zones],
  );

  return useMemo(
    () => ({
      zones,
      loading,
      addZone,
      updateZone: updateZoneById,
      deleteZone: deleteZoneById,
    }),
    [zones, loading, addZone, updateZoneById, deleteZoneById],
  );
}

export { getProtectedDeleteMessage };
export type { ZoneUpdateData };
