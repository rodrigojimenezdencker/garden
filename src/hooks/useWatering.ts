import { where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS } from '../lib/constants';
import { addDocument, subscribeToCollection } from '../services/firestore';
import type { WateringLog, WateringSchedule } from '../types';
import { usePlants } from './usePlants';

interface UseWateringReturn {
  logs: WateringLog[];
  schedules: WateringSchedule[];
  loading: boolean;
  logWatering: (plantId: string, notes?: string) => Promise<string>;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getStartOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getDaysUntilDate = (from: Date, to: Date) => {
  const difference =
    getStartOfDay(to).getTime() - getStartOfDay(from).getTime();
  return Math.round(difference / MS_PER_DAY);
};

export function useWatering(): UseWateringReturn {
  const { user } = useAuthContext();
  const { plants, loading: plantsLoading } = usePlants();
  const [logs, setLogs] = useState<WateringLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      setLogsLoading(false);
      return;
    }

    setLogsLoading(true);

    const unsubscribe = subscribeToCollection<WateringLog>(
      COLLECTIONS.WATERING_LOGS,
      [where('loggedBy', '==', user.uid)],
      (nextLogs) => {
        setLogs(
          [...nextLogs].sort(
            (left, right) =>
              right.wateredAt.getTime() - left.wateredAt.getTime(),
          ),
        );
        setLogsLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const schedules = useMemo(() => {
    const today = new Date();
    const todayStart = getStartOfDay(today);

    return plants.map<WateringSchedule>((plant) => {
      const lastLog = logs.find((log) => log.plantId === plant.id) ?? null;
      const lastWateredAt = lastLog?.wateredAt ?? null;
      const nextWateringDate = lastWateredAt
        ? addDays(lastWateredAt, plant.wateringFrequencyDays)
        : null;
      const isOverdue = nextWateringDate
        ? getStartOfDay(nextWateringDate).getTime() < todayStart.getTime()
        : false;

      return {
        plantId: plant.id,
        plantName: plant.name,
        frequencyDays: plant.wateringFrequencyDays,
        lastWateredAt,
        nextWateringDate,
        isOverdue,
        daysUntilNext: nextWateringDate
          ? getDaysUntilDate(today, nextWateringDate)
          : null,
      };
    });
  }, [logs, plants]);

  const logWatering = useCallback(
    async (plantId: string, notes?: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      return addDocument<WateringLog>(COLLECTIONS.WATERING_LOGS, {
        plantId,
        wateredAt: new Date(),
        notes: notes?.trim() ?? '',
        loggedBy: user.uid,
      });
    },
    [user],
  );

  return useMemo(
    () => ({
      logs,
      schedules,
      loading: plantsLoading || logsLoading,
      logWatering,
    }),
    [logs, schedules, plantsLoading, logsLoading, logWatering],
  );
}
