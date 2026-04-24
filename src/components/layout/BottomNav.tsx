import { useReminders } from '../../hooks/useReminders';
import { ReminderBadge } from '../ReminderBadge';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🌿' },
  { id: 'plantas', label: 'Plantas', icon: '🌱' },
  { id: 'riego', label: 'Riego', icon: '💧' },
  { id: 'historial', label: 'Historial', icon: '📋' },
  { id: 'zonas', label: 'Zonas', icon: '📍' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
] as const;

interface BottomNavProps {
  activeItem?: string;
}

export function BottomNav({ activeItem = 'dashboard' }: BottomNavProps) {
  const { reminderCount } = useReminders();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-stretch border-t border-gray-200 bg-white md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = item.id === activeItem;
        return (
          <button
            key={item.id}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors',
              isActive
                ? 'text-garden-500'
                : 'text-gray-500 hover:text-garden-500',
            ].join(' ')}
            type="button"
          >
            <span className="relative">
              <span aria-hidden="true" className="text-xl leading-none">
                {item.icon}
              </span>
              {item.id === 'riego' && <ReminderBadge count={reminderCount} />}
            </span>
            <span className={isActive ? 'font-semibold' : ''}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
