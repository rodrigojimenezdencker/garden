import { useNavigate } from 'react-router-dom';
import type { Plant } from '../../types';
import { Card } from '../ui/Card';

interface PlantCardProps {
  plant: Plant;
  view?: 'grid' | 'list';
}

const zoneLabels: Record<string, string> = {
  sun: 'Sol',
  shade: 'Sombra',
  terrace: 'Terraza',
  indoor: 'Interior',
  other: 'Otra',
};

export function PlantCard({ plant, view = 'grid' }: PlantCardProps) {
  const navigate = useNavigate();
  const zoneLabel = plant.zoneId
    ? (zoneLabels[plant.zoneId] ?? plant.zoneId)
    : 'Sin zona';
  const isList = view === 'list';

  return (
    <Card
      className={[
        'overflow-hidden border border-garden-100 bg-white/90 backdrop-blur-sm',
        isList ? 'flex gap-4 p-3' : 'p-3',
      ].join(' ')}
      hoverable
      onClick={() => navigate(`/plants/${plant.id}`)}
    >
      <div
        className={[
          'overflow-hidden rounded-2xl bg-linear-to-br from-garden-500 via-garden-400 to-garden-300',
          isList ? 'h-24 w-24 shrink-0' : 'mb-3 aspect-[4/3] w-full',
        ].join(' ')}
      >
        {plant.photoUrl ? (
          <img
            alt={plant.name}
            className="h-full w-full object-cover"
            src={plant.photoUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-white">
            <span aria-hidden="true">🌿</span>
          </div>
        )}
      </div>

      <div
        className={[
          isList ? 'flex min-w-0 flex-1 items-center' : '',
          'space-y-2',
        ].join(' ')}
      >
        <div>
          <h3 className="font-semibold text-garden-900">{plant.name}</h3>
          <p className="text-sm text-gray-500">
            {plant.species || 'Especie sin definir'}
          </p>
        </div>

        <span className="inline-flex rounded-full bg-garden-100 px-2.5 py-1 text-xs font-medium text-garden-700">
          {zoneLabel}
        </span>

        <p className="text-xs text-garden-700/80">
          Riego cada {plant.wateringFrequencyDays} día
          {plant.wateringFrequencyDays === 1 ? '' : 's'}
        </p>
      </div>
    </Card>
  );
}
