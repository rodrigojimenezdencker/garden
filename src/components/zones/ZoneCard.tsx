import type { GardenZone } from '../../types';
import { Card } from '../ui/Card';

interface ZoneCardProps {
  zone: GardenZone;
  plantCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

const zoneMeta: Record<GardenZone['type'], { icon: string; label: string }> = {
  sun: { icon: '☀️', label: 'Sol' },
  shade: { icon: '🌿', label: 'Sombra' },
  terrace: { icon: '🏡', label: 'Terraza' },
  indoor: { icon: '🏠', label: 'Interior' },
  other: { icon: '📍', label: 'Otra' },
};

export function ZoneCard({
  zone,
  plantCount,
  onEdit,
  onDelete,
  onClick,
}: ZoneCardProps) {
  const meta = zoneMeta[zone.type];

  return (
    <Card
      className="rounded-[2rem] border border-garden-100 bg-white/90 p-5 backdrop-blur-sm"
      hoverable
    >
      <div className="flex items-start justify-between gap-3">
        <button
          aria-label={`Ver zona ${zone.name}`}
          className="group flex flex-1 flex-col items-start space-y-3 text-left"
          onClick={onClick}
          type="button"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-garden-100 text-2xl"
            >
              {meta.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-garden-600">
                {meta.label}
              </p>
              <h2 className="text-xl font-semibold text-garden-950">
                {zone.name}
              </h2>
            </div>
          </div>

          <span className="inline-flex rounded-full bg-garden-50 px-3 py-1 text-xs font-semibold text-garden-700 ring-1 ring-garden-100">
            {plantCount} planta{plantCount === 1 ? '' : 's'}
          </span>

          <div className="flex w-full items-center justify-between text-sm text-gray-600">
            <span>Ver plantas asignadas</span>
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            aria-label={`Editar zona ${zone.name}`}
            className="rounded-full p-2 text-garden-600 transition-colors hover:bg-garden-50 hover:text-garden-800"
            onClick={onEdit}
            type="button"
          >
            ✏️
          </button>
          <button
            aria-label={`Eliminar zona ${zone.name}`}
            className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            onClick={onDelete}
            type="button"
          >
            🗑️
          </button>
        </div>
      </div>
    </Card>
  );
}
