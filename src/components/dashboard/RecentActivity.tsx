import { CareType } from '../../types/care';
import type { CareEvent, CareType as CareTypeValue } from '../../types/care';
import type { Plant } from '../../types/plant';

interface RecentActivityProps {
  events: CareEvent[];
  plants: Plant[];
}

const CARE_TYPE_META: Record<
  CareTypeValue,
  { icon: string; label: string; tone: string }
> = {
  [CareType.Water]: {
    icon: '💧',
    label: 'Riego',
    tone: 'bg-sky-100 text-sky-700 ring-sky-200',
  },
  [CareType.Prune]: {
    icon: '✂️',
    label: 'Poda',
    tone: 'bg-amber-100 text-amber-700 ring-amber-200',
  },
  [CareType.Fertilize]: {
    icon: '🌿',
    label: 'Fertilización',
    tone: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  },
  [CareType.Transplant]: {
    icon: '🪴',
    label: 'Trasplante',
    tone: 'bg-stone-100 text-stone-700 ring-stone-200',
  },
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getRelativeDate(date: Date): string {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const diffDays = Math.round((todayStart - dateStart) / MS_PER_DAY);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function getPlantName(plantId: string, plants: Plant[]): string {
  return plants.find((p) => p.id === plantId)?.name ?? 'Planta eliminada';
}

export function RecentActivity({ events, plants }: RecentActivityProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-garden-100 text-3xl">
          🌱
        </div>
        <p className="mt-4 text-sm text-garden-700">
          Aún no hay cuidados registrados.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => {
        const meta = CARE_TYPE_META[event.type];
        const plantName = getPlantName(event.plantId, plants);

        return (
          <li
            className="flex items-start gap-4 rounded-[1.5rem] border border-garden-100 bg-white/90 p-4 shadow-sm backdrop-blur-sm"
            key={event.id}
          >
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-garden-100 text-base"
            >
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${meta.tone}`}
                >
                  {meta.label}
                </span>
                <span className="truncate text-sm font-medium text-garden-900">
                  {plantName}
                </span>
              </div>
              {event.notes ? (
                <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                  {event.notes}
                </p>
              ) : null}
            </div>
            <time
              className="shrink-0 text-xs text-gray-400"
              dateTime={event.date.toISOString()}
            >
              {getRelativeDate(event.date)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
