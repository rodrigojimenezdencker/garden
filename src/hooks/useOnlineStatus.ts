import { useEffect, useMemo, useState } from 'react';

const SYNCING_DURATION_MS = 2000;

export type SyncStatus = 'synced' | 'syncing' | 'offline';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  syncStatus: SyncStatus;
}

function getInitialOnlineStatus(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() =>
    getInitialOnlineStatus() ? 'synced' : 'offline',
  );

  useEffect(() => {
    let syncTimeoutId: number | null = null;

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');

      syncTimeoutId = window.setTimeout(() => {
        setSyncStatus('synced');
      }, SYNCING_DURATION_MS);
    };

    const handleOffline = () => {
      if (syncTimeoutId !== null) {
        window.clearTimeout(syncTimeoutId);
        syncTimeoutId = null;
      }

      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (syncTimeoutId !== null) {
        window.clearTimeout(syncTimeoutId);
      }

      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useMemo(
    () => ({
      isOnline,
      syncStatus,
    }),
    [isOnline, syncStatus],
  );
}
