import type { Plant } from '../../types';
import { Card } from '../ui/Card';

interface ZonePlantListProps {
  plants: Plant[];
}

export function ZonePlantList({ plants }: ZonePlantListProps) {
  if (plants.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-garden-200 bg-garden-50/70 p-6 text-center text-sm text-garden-700">
        No hay plantas en esta zona
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {plants.map((plant) => (
        <Card
          className="rounded-[1.5rem] border border-garden-100 bg-white/90 p-4 shadow-none"
          key={plant.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-garden-950">
                {plant.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {plant.species || 'Especie sin definir'}
              </p>
            </div>
            <span aria-hidden="true" className="text-2xl">
              🌱
            </span>
          </div>

          <p className="mt-4 text-xs text-garden-700/80">
            Riego cada {plant.wateringFrequencyDays} día
            {plant.wateringFrequencyDays === 1 ? '' : 's'}
          </p>
        </Card>
      ))}
    </div>
  );
}
