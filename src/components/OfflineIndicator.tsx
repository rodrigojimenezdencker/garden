import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const SYNCED_BANNER_DURATION_MS = 3000;

export function OfflineIndicator() {
  const { syncStatus } = useOnlineStatus();
  const [showSyncedMessage, setShowSyncedMessage] = useState(false);
  const previousStatusRef = useRef(syncStatus);

  useEffect(() => {
    if (syncStatus === 'synced' && previousStatusRef.current === 'syncing') {
      setShowSyncedMessage(true);
      const timeoutId = window.setTimeout(() => {
        setShowSyncedMessage(false);
      }, SYNCED_BANNER_DURATION_MS);

      previousStatusRef.current = syncStatus;

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (syncStatus !== 'synced') {
      setShowSyncedMessage(false);
    }

    previousStatusRef.current = syncStatus;
  }, [syncStatus]);

  if (syncStatus === 'synced' && !showSyncedMessage) {
    return null;
  }

  const bannerState =
    syncStatus === 'offline'
      ? 'offline'
      : syncStatus === 'syncing'
        ? 'syncing'
        : 'synced';

  return (
    <output
      aria-live="polite"
      className={[
        'mx-4 mt-4 overflow-hidden rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 ease-out motion-safe:animate-[fade-in_300ms_ease-out]',
        bannerState === 'offline'
          ? 'border-amber-300 bg-amber-100 text-amber-950'
          : 'border-garden-300 bg-garden-100 text-garden-900',
      ].join(' ')}
    >
      <p className="text-sm font-medium tracking-tight">
        {bannerState === 'offline'
          ? 'Sin conexión — los cambios se guardarán cuando vuelvas a conectar'
          : bannerState === 'syncing'
            ? 'Sincronizando...'
            : 'Todo actualizado ✓'}
      </p>
      <div
        aria-hidden="true"
        className={[
          'mt-2 h-1 w-full overflow-hidden rounded-full bg-white/50',
          bannerState === 'offline' ? 'opacity-70' : 'opacity-100',
        ].join(' ')}
      >
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            bannerState === 'offline'
              ? 'w-1/3 bg-amber-500'
              : bannerState === 'syncing'
                ? 'w-full bg-garden-500 motion-safe:animate-pulse'
                : 'w-full bg-garden-500 motion-safe:animate-[reconnect-sheen_900ms_ease-out]',
          ].join(' ')}
        />
      </div>
    </output>
  );
}
