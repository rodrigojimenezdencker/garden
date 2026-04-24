import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function SyncStatus() {
  const { isOnline } = useOnlineStatus();

  return (
    <output
      aria-label={isOnline ? 'En línea' : 'Sin conexión'}
      className="inline-flex items-center gap-2"
    >
      <span
        aria-hidden="true"
        className={[
          'block h-2 w-2 rounded-full transition-colors duration-300',
          isOnline
            ? 'bg-garden-300 shadow-[0_0_0_4px_rgba(134,239,172,0.18)] motion-safe:animate-pulse'
            : 'bg-gray-300 shadow-[0_0_0_4px_rgba(209,213,219,0.18)]',
        ].join(' ')}
      />
      <span className="hidden text-xs font-medium tracking-[0.08em] text-white/80 sm:inline">
        {isOnline ? 'En línea' : 'Sin conexión'}
      </span>
    </output>
  );
}
