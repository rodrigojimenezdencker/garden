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

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem = 'dashboard' }: SidebarProps) {
  const { reminderCount } = useReminders();

  return (
    <aside className="fixed bottom-0 top-14 hidden w-60 flex-shrink-0 overflow-y-auto border-r border-garden-100 bg-garden-50 md:block">
      <nav aria-label="Navegación lateral" className="px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === activeItem;
            return (
              <li key={item.id}>
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-garden-100 text-garden-700'
                      : 'text-gray-600 hover:bg-garden-100 hover:text-garden-700',
                  ].join(' ')}
                  type="button"
                >
                  <span className="relative">
                    <span aria-hidden="true" className="text-lg leading-none">
                      {item.icon}
                    </span>
                    {item.id === 'riego' && (
                      <ReminderBadge count={reminderCount} />
                    )}
                  </span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
