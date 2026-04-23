import { useState } from 'react';
import type { Plant } from '../../types';
import { Button } from '../ui/Button';

interface PlantDetailProps {
  plant: Plant;
  onEdit: () => void;
  onDelete: () => Promise<void> | void;
  onBack: () => void;
}

type DetailTab = 'info' | 'watering' | 'history' | 'photos';

const zoneLabels: Record<string, string> = {
  sun: 'Sol',
  shade: 'Sombra',
  terrace: 'Terraza',
  indoor: 'Interior',
  other: 'Otra',
};

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: 'info', label: 'Info' },
  { id: 'watering', label: 'Riego' },
  { id: 'history', label: 'Historial' },
  { id: 'photos', label: 'Fotos' },
];

export function PlantDetail({
  plant,
  onEdit,
  onDelete,
  onBack,
}: PlantDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <Button onClick={onBack} variant="ghost">
        <span aria-hidden="true">←</span>
        Volver
      </Button>

      <div className="overflow-hidden rounded-[2rem] border border-garden-100 bg-white shadow-sm">
        <div className="h-64 bg-linear-to-br from-garden-600 via-garden-400 to-garden-200 md:h-96">
          {plant.photoUrl ? (
            <img
              alt={plant.name}
              className="h-full w-full object-cover"
              src={plant.photoUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl text-white/90">
              <span aria-hidden="true">🌱</span>
            </div>
          )}
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-garden-500">
                {plant.zoneId
                  ? (zoneLabels[plant.zoneId] ?? plant.zoneId)
                  : 'Sin zona'}
              </p>
              <h1 className="text-3xl font-bold text-garden-900">
                {plant.name}
              </h1>
              <p className="text-lg text-gray-500">
                {plant.species || 'Especie sin definir'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={onEdit} variant="secondary">
                Editar
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="danger"
              >
                Eliminar
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl bg-garden-50 p-2">
            {tabs.map((tab) => (
              <button
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-garden-600 text-white'
                    : 'text-garden-700 hover:bg-white',
                ].join(' ')}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'info' ? (
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4">
                <h2 className="mb-2 font-semibold text-garden-900">Zona</h2>
                <p className="text-gray-700">
                  {plant.zoneId
                    ? (zoneLabels[plant.zoneId] ?? plant.zoneId)
                    : 'Sin asignar'}
                </p>
              </div>
              <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4">
                <h2 className="mb-2 font-semibold text-garden-900">
                  Frecuencia de riego
                </h2>
                <p className="text-gray-700">
                  Cada {plant.wateringFrequencyDays} día
                  {plant.wateringFrequencyDays === 1 ? '' : 's'}
                </p>
              </div>
              <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4 md:col-span-3">
                <h2 className="mb-2 font-semibold text-garden-900">Notas</h2>
                <p className="whitespace-pre-wrap text-gray-700">
                  {plant.notes || 'Sin notas todavía'}
                </p>
              </div>
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-garden-200 bg-garden-50/70 p-4 text-gray-700">
              Próximamente...
            </div>
          )}
        </div>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[1.75rem] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-garden-900">
              ¿Eliminar {plant.name}?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Esta acción quitará la planta de tu catálogo.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="ghost"
              >
                Cancelar
              </Button>
              <Button
                loading={isDeleting}
                onClick={handleDelete}
                variant="danger"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
