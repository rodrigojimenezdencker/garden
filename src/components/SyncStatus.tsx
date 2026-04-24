import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function SyncStatus() {
  const { syncStatus } = useOnlineStatus();

  const label =
    syncStatus === 'offline'
      ? 'Sin conexión'
      : syncStatus === 'syncing'
        ? 'Sincronizando'
        : 'Todo actualizado';

  return (
    <output aria-label={label} className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={[
          'block h-2 w-2 rounded-full transition-colors duration-300',
          syncStatus === 'offline'
            ? 'bg-gray-300 shadow-[0_0_0_4px_rgba(209,213,219,0.18)]'
            : syncStatus === 'syncing'
              ? 'bg-garden-400 shadow-[0_0_0_4px_rgba(116,198,157,0.18)] motion-safe:animate-pulse'
              : 'bg-garden-300 shadow-[0_0_0_4px_rgba(134,239,172,0.18)]',
        ].join(' ')}
      />
      <span className="hidden text-xs font-medium tracking-[0.08em] text-white/80 sm:inline">
        {label}
      </span>
    </output>
  );
}
