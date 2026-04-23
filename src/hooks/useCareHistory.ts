import { orderBy, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS } from '../lib/constants';
import { addDocument, subscribeToCollection } from '../services/firestore';
import type { CareEvent, CareType } from '../types/care';

interface AddCareEventData {
  plantId: string;
  type: CareType;
  date: Date;
  notes?: string;
}

interface UseCareHistoryReturn {
  events: CareEvent[];
  loading: boolean;
  addCareEvent: (data: AddCareEventData) => Promise<string>;
  getEventsForPlant: (plantId: string) => CareEvent[];
}

export function useCareHistory(): UseCareHistoryReturn {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = subscribeToCollection<CareEvent>(
      COLLECTIONS.CARE_EVENTS,
      [where('loggedBy', '==', user.uid), orderBy('date', 'desc')],
      (nextEvents) => {
        setEvents(
          [...nextEvents].sort(
            (left, right) => right.date.getTime() - left.date.getTime(),
          ),
        );
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addCareEvent = useCallback(
    async ({ plantId, type, date, notes }: AddCareEventData) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      return addDocument<CareEvent>(COLLECTIONS.CARE_EVENTS, {
        plantId,
        type,
        date,
        notes: notes?.trim() ?? '',
        loggedBy: user.uid,
      });
    },
    [user],
  );

  const getEventsForPlant = useCallback(
    (plantId: string) => {
      return events.filter((event) => event.plantId === plantId);
    },
    [events],
  );

  return useMemo(
    () => ({
      events,
      loading,
      addCareEvent,
      getEventsForPlant,
    }),
    [events, loading, addCareEvent, getEventsForPlant],
  );
}
