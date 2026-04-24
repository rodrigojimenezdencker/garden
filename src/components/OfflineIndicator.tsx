import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

const RECONNECT_BANNER_DURATION_MS = 3000;

export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const [showReconnectMessage, setShowReconnectMessage] = useState(false);
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    if (!isOnline) {
      setShowReconnectMessage(false);
      wasOnlineRef.current = false;
      return;
    }

    if (!wasOnlineRef.current) {
      setShowReconnectMessage(true);
      wasOnlineRef.current = true;

      const timeoutId = window.setTimeout(() => {
        setShowReconnectMessage(false);
      }, RECONNECT_BANNER_DURATION_MS);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    wasOnlineRef.current = true;
  }, [isOnline]);

  if (isOnline && !showReconnectMessage) {
    return null;
  }

  const isReconnectState = isOnline && showReconnectMessage;

  return (
    <output
      aria-live="polite"
      className={[
        'mx-4 mt-4 overflow-hidden rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 ease-out motion-safe:animate-[fade-in_300ms_ease-out]',
        isReconnectState
          ? 'border-garden-300 bg-garden-100 text-garden-900'
          : 'border-amber-300 bg-amber-100 text-amber-950',
      ].join(' ')}
    >
      <p className="text-sm font-medium tracking-tight">
        {isReconnectState
          ? 'Conectado de nuevo ✓'
          : 'Sin conexión — los cambios se guardarán cuando vuelvas a conectar'}
      </p>
      <div
        aria-hidden="true"
        className={[
          'mt-2 h-1 w-full overflow-hidden rounded-full bg-white/50',
          isReconnectState ? 'opacity-100' : 'opacity-70',
        ].join(' ')}
      >
        <div
          className={[
            'h-full rounded-full transition-all duration-500',
            isReconnectState
              ? 'w-full bg-garden-500 motion-safe:animate-[reconnect-sheen_900ms_ease-out]'
              : 'w-1/3 bg-amber-500',
          ].join(' ')}
        />
      </div>
    </output>
  );
}
