import { type DocumentSnapshot, limit, orderBy } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { COLLECTIONS } from '../lib/constants';
import {
  addDocument,
  deleteDocument,
  getPaginatedDocuments,
  subscribeToCollection,
} from '../services/firestore';
import type { CareEvent, CareType } from '../types/care';

const CARE_HISTORY_PAGE_SIZE = 20;

interface AddCareEventData {
  plantId: string;
  type: CareType;
  date: Date;
  notes?: string;
}

interface UseCareHistoryReturn {
  events: CareEvent[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  addCareEvent: (data: AddCareEventData) => Promise<string>;
  deleteCareEvent: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  getEventsForPlant: (plantId: string) => CareEvent[];
}

const sortEventsByDate = (items: CareEvent[]) => {
  return [...items].sort(
    (left, right) => right.date.getTime() - left.date.getTime(),
  );
};

const mergeEvents = (
  priorityEvents: CareEvent[],
  additionalEvents: CareEvent[],
) => {
  const mergedEvents = new Map<string, CareEvent>();

  for (const event of [...priorityEvents, ...additionalEvents]) {
    mergedEvents.set(event.id, event);
  }

  return sortEventsByDate([...mergedEvents.values()]);
};

export function useCareHistory(): UseCareHistoryReturn {
  const { user } = useAuthContext();
  const [events, setEvents] = useState<CareEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const realtimeEventsRef = useRef<CareEvent[]>([]);
  const paginatedEventsRef = useRef<CareEvent[]>([]);
  const lastDocRef = useRef<DocumentSnapshot | null>(null);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      setHasMore(true);
      setLoadingMore(false);
      realtimeEventsRef.current = [];
      paginatedEventsRef.current = [];
      lastDocRef.current = null;
      return;
    }

    setLoading(true);
    setHasMore(true);
    setLoadingMore(false);
    realtimeEventsRef.current = [];
    paginatedEventsRef.current = [];
    lastDocRef.current = null;

    let isDisposed = false;

    void getPaginatedDocuments<CareEvent>(
      COLLECTIONS.CARE_EVENTS,
      CARE_HISTORY_PAGE_SIZE,
      null,
      orderBy('date', 'desc'),
    ).then(({ lastDoc, hasMore: nextHasMore }) => {
      if (isDisposed) {
        return;
      }

      lastDocRef.current = lastDoc;
      setHasMore(nextHasMore);
    });

    const unsubscribe = subscribeToCollection<CareEvent>(
      COLLECTIONS.CARE_EVENTS,
      [orderBy('date', 'desc'), limit(CARE_HISTORY_PAGE_SIZE)],
      (nextEvents) => {
        const sortedEvents = sortEventsByDate(nextEvents);

        realtimeEventsRef.current = sortedEvents;
        setEvents(mergeEvents(sortedEvents, paginatedEventsRef.current));
        setLoading(false);
      },
    );

    return () => {
      isDisposed = true;
      unsubscribe();
    };
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

  const deleteCareEvent = useCallback(async (id: string) => {
    await deleteDocument(COLLECTIONS.CARE_EVENTS, id);
  }, []);

  const loadMore = useCallback(async () => {
    if (!user || loadingMore || !hasMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const {
        data,
        lastDoc,
        hasMore: nextHasMore,
      } = await getPaginatedDocuments<CareEvent>(
        COLLECTIONS.CARE_EVENTS,
        CARE_HISTORY_PAGE_SIZE,
        lastDocRef.current,
        orderBy('date', 'desc'),
      );

      lastDocRef.current = lastDoc;
      setHasMore(nextHasMore);
      paginatedEventsRef.current = mergeEvents(
        paginatedEventsRef.current,
        data,
      );
      setEvents(
        mergeEvents(realtimeEventsRef.current, paginatedEventsRef.current),
      );
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, user]);

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
      hasMore,
      loadingMore,
      addCareEvent,
      deleteCareEvent,
      loadMore,
      getEventsForPlant,
    }),
    [
      events,
      loading,
      hasMore,
      loadingMore,
      addCareEvent,
      deleteCareEvent,
      loadMore,
      getEventsForPlant,
    ],
  );
}
