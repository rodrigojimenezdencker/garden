import { useLocation, useNavigate } from 'react-router-dom';
import { useReminders } from '../hooks/useReminders';

export function ReminderBanner() {
  const { reminders, hasUnacknowledged, dismiss } = useReminders();
  const location = useLocation();
  const navigate = useNavigate();

  if (!hasUnacknowledged || location.pathname === '/watering') return null;

  const hasOverdue = reminders.some((r) => r.isOverdue);
  const count = reminders.length;

  const handleDismiss = () => {
    for (const r of reminders) {
      dismiss(r.plantId);
    }
  };

  const handleNavigate = () => {
    navigate('/watering');
  };

  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-2 text-sm font-medium text-white',
        hasOverdue ? 'bg-red-500' : 'bg-amber-500',
      ].join(' ')}
      role="alert"
    >
      <button
        className="flex-1 text-left"
        onClick={handleNavigate}
        type="button"
      >
        🌱 {count} planta{count !== 1 ? 's' : ''} necesita
        {count !== 1 ? 'n' : ''} agua hoy
      </button>
      <button
        aria-label="Cerrar aviso"
        className="ml-2 flex-shrink-0 p-1 hover:opacity-80"
        onClick={handleDismiss}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
