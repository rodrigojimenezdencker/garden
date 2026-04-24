import { useState } from 'react';
import type { PlantPhoto } from '../../types';
import { Button } from '../ui/Button';

const photoDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

interface PhotoComparisonProps {
  photos: PlantPhoto[];
  onClose: () => void;
}

export function PhotoComparison({ photos, onClose }: PhotoComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<
    [string | null, string | null]
  >([null, null]);

  const [leftId, rightId] = selectedIds;
  const leftPhoto = photos.find((p) => p.id === leftId) ?? null;
  const rightPhoto = photos.find((p) => p.id === rightId) ?? null;
  const bothSelected = leftPhoto !== null && rightPhoto !== null;

  const handleToggle = (photoId: string) => {
    setSelectedIds(([prevLeft, prevRight]) => {
      if (prevLeft === photoId) {
        return [null, prevRight];
      }

      if (prevRight === photoId) {
        return [prevLeft, null];
      }

      if (prevLeft === null) {
        return [photoId, prevRight];
      }

      if (prevRight === null) {
        return [prevLeft, photoId];
      }

      return [photoId, prevRight];
    });
  };

  const handleCancel = () => {
    setSelectedIds([null, null]);
    onClose();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-garden-900">
            Comparar fotos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {bothSelected
              ? 'Comparando las dos fotos seleccionadas'
              : 'Seleccioná 2 fotos para comparar'}
          </p>
        </div>
        <Button onClick={handleCancel} variant="ghost">
          Cancelar comparación
        </Button>
      </div>

      {bothSelected ? (
        <div className="grid grid-cols-2 gap-4">
          {[leftPhoto, rightPhoto].map((photo) => (
            <div
              className="overflow-hidden rounded-2xl border border-garden-100 bg-white shadow-sm"
              key={photo.id}
            >
              <img
                alt={photo.caption ?? 'Foto de planta'}
                className="aspect-square w-full object-cover"
                src={photo.url}
              />
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-garden-900">
                  {photoDateFormatter.format(photo.takenAt)}
                </p>
                {photo.caption && (
                  <p className="text-xs text-gray-600">{photo.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => {
            const isLeft = leftId === photo.id;
            const isRight = rightId === photo.id;
            const isSelected = isLeft || isRight;
            const selectionLabel = isLeft ? '① ' : isRight ? '② ' : '';

            return (
              <button
                className={[
                  'group relative overflow-hidden rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-garden-500',
                  isSelected
                    ? 'border-garden-500 ring-2 ring-garden-400/40'
                    : 'border-garden-100 hover:border-garden-300',
                ].join(' ')}
                key={photo.id}
                onClick={() => handleToggle(photo.id)}
                type="button"
              >
                <img
                  alt={photo.caption ?? 'Foto de planta'}
                  className="aspect-square w-full object-cover"
                  src={photo.url}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 py-2">
                  <p className="text-xs text-white/90">
                    {selectionLabel}
                    {photoDateFormatter.format(photo.takenAt)}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-garden-600 text-xs font-bold text-white">
                    {isLeft ? '1' : '2'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {bothSelected && (
        <div className="flex justify-center">
          <Button
            onClick={() => setSelectedIds([null, null])}
            variant="secondary"
          >
            Elegir otras fotos
          </Button>
        </div>
      )}
    </section>
  );
}
