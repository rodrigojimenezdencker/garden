import { useMemo, useState } from 'react';
import { useCareHistory } from '../../hooks/useCareHistory';
import { useWatering } from '../../hooks/useWatering';
import type { Plant } from '../../types';
import { CareType, type CareType as CareTypeValue } from '../../types/care';
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

const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const careDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const careTypeMeta: Record<
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

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const getRelativeLabel = (date: Date | null) => {
  if (!date) {
    return 'Nunca regada';
  }

  const today = new Date();
  const diffDays = Math.round(
    (new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) {
    return 'Hoy';
  }

  if (diffDays === 1) {
    return 'Hace 1 día';
  }

  return `Hace ${diffDays} días`;
};

export function PlantDetail({
  plant,
  onEdit,
  onDelete,
  onBack,
}: PlantDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingWatering, setIsLoggingWatering] = useState(false);
  const [wateringFeedback, setWateringFeedback] = useState('');
  const [isHistoryFormOpen, setIsHistoryFormOpen] = useState(false);
  const [historyType, setHistoryType] = useState<CareTypeValue>(CareType.Water);
  const [historyDate, setHistoryDate] = useState(toInputDate(new Date()));
  const [historyNotes, setHistoryNotes] = useState('');
  const [isSavingHistory, setIsSavingHistory] = useState(false);
  const [historyFeedback, setHistoryFeedback] = useState('');
  const {
    loading: wateringLoading,
    logs,
    logWatering,
    schedules,
  } = useWatering();
  const {
    addCareEvent,
    getEventsForPlant,
    loading: historyLoading,
  } = useCareHistory();

  const schedule = useMemo(() => {
    return schedules.find((entry) => entry.plantId === plant.id) ?? null;
  }, [plant.id, schedules]);

  const recentLogs = useMemo(() => {
    return logs.filter((log) => log.plantId === plant.id).slice(0, 5);
  }, [logs, plant.id]);

  const recentCareEvents = useMemo(() => {
    return getEventsForPlant(plant.id).slice(0, 10);
  }, [getEventsForPlant, plant.id]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogWatering = async () => {
    setIsLoggingWatering(true);

    try {
      await logWatering(plant.id);
      setWateringFeedback('¡Riego registrado!');
      window.setTimeout(() => {
        setWateringFeedback((currentFeedback) =>
          currentFeedback === '¡Riego registrado!' ? '' : currentFeedback,
        );
      }, 1800);
    } finally {
      setIsLoggingWatering(false);
    }
  };

  const handleOpenHistoryForm = () => {
    setHistoryType(CareType.Water);
    setHistoryDate(toInputDate(new Date()));
    setHistoryNotes('');
    setHistoryFeedback('');
    setIsHistoryFormOpen(true);
  };

  const handleSaveHistory = async () => {
    setIsSavingHistory(true);
    setHistoryFeedback('');

    try {
      await addCareEvent({
        plantId: plant.id,
        type: historyType,
        date: new Date(`${historyDate}T12:00:00`),
        notes: historyNotes,
      });
      setIsHistoryFormOpen(false);
      setHistoryNotes('');
      setHistoryFeedback('Cuidado registrado');
    } catch (error) {
      setHistoryFeedback(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el cuidado',
      );
    } finally {
      setIsSavingHistory(false);
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
          ) : activeTab === 'watering' ? (
            wateringLoading ? (
              <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4 text-gray-700">
                Cargando riegos...
              </div>
            ) : (
              <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4">
                  <h2 className="mb-2 font-semibold text-garden-900">
                    Próximo riego
                  </h2>
                  <p className="text-gray-700">
                    {schedule?.nextWateringDate
                      ? fullDateFormatter.format(schedule.nextWateringDate)
                      : 'Nunca regada'}
                  </p>
                  <p className="mt-2 text-sm text-garden-700/80">
                    {schedule?.lastWateredAt
                      ? `Último riego ${getRelativeLabel(schedule.lastWateredAt)}`
                      : 'Todavía no registraste ningún riego'}
                  </p>
                </div>

                <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4">
                  <h2 className="mb-2 font-semibold text-garden-900">
                    Frecuencia
                  </h2>
                  <p className="text-gray-700">
                    Cada {plant.wateringFrequencyDays} día
                    {plant.wateringFrequencyDays === 1 ? '' : 's'}
                  </p>
                  <p className="mt-2 text-sm text-garden-700/80">
                    Mantén el ritmo para que {plant.name} siga sana.
                  </p>
                </div>

                <div className="rounded-2xl border border-garden-100 bg-garden-50/70 p-4">
                  <h2 className="mb-3 font-semibold text-garden-900">Acción</h2>
                  <Button
                    loading={isLoggingWatering}
                    onClick={handleLogWatering}
                  >
                    Regar ahora
                  </Button>
                  {wateringFeedback ? (
                    <p className="mt-3 text-sm font-medium text-garden-700">
                      {wateringFeedback}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-garden-100 bg-white p-4 md:col-span-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-garden-900">
                      Últimos riegos
                    </h2>
                    <span className="rounded-full bg-garden-100 px-3 py-1 text-xs font-semibold text-garden-700">
                      {recentLogs.length}
                    </span>
                  </div>

                  {recentLogs.length > 0 ? (
                    <ul className="mt-4 space-y-3">
                      {recentLogs.map((log) => (
                        <li
                          className="rounded-2xl border border-garden-100 bg-garden-50/60 p-4"
                          key={log.id}
                        >
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <p className="font-medium text-garden-900">
                              {dateTimeFormatter.format(log.wateredAt)}
                            </p>
                            <p className="text-sm text-garden-700">
                              {getRelativeLabel(log.wateredAt)}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-gray-700">
                            {log.notes || 'Sin notas'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-gray-600">
                      Todavía no hay riegos registrados para esta planta.
                    </p>
                  )}
                </div>
              </section>
            )
          ) : activeTab === 'history' ? (
            <section className="space-y-4">
              <div className="rounded-[1.75rem] border border-garden-100 bg-garden-50/70 p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-garden-900">
                      Historial reciente
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Últimos 10 eventos registrados para {plant.name}
                    </p>
                  </div>

                  <Button onClick={handleOpenHistoryForm} variant="secondary">
                    Registrar cuidado
                  </Button>
                </div>

                {historyFeedback ? (
                  <p className="mt-3 text-sm font-medium text-garden-700">
                    {historyFeedback}
                  </p>
                ) : null}

                {isHistoryFormOpen ? (
                  <div className="mt-4 grid gap-4 rounded-2xl border border-garden-100 bg-white p-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="plant-history-type"
                      >
                        Tipo de cuidado
                      </label>
                      <select
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                        id="plant-history-type"
                        onChange={(event) =>
                          setHistoryType(event.target.value as CareTypeValue)
                        }
                        value={historyType}
                      >
                        {Object.values(CareType).map((type) => (
                          <option key={type} value={type}>
                            {careTypeMeta[type].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="plant-history-date"
                      >
                        Fecha
                      </label>
                      <input
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                        id="plant-history-date"
                        onChange={(event) => setHistoryDate(event.target.value)}
                        type="date"
                        value={historyDate}
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label
                        className="text-sm font-medium text-gray-700"
                        htmlFor="plant-history-notes"
                      >
                        Notas
                      </label>
                      <textarea
                        className="min-h-24 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                        id="plant-history-notes"
                        onChange={(event) =>
                          setHistoryNotes(event.target.value)
                        }
                        placeholder="Añade un detalle opcional"
                        value={historyNotes}
                      />
                    </div>

                    <div className="flex flex-col-reverse gap-3 md:col-span-2 md:flex-row md:justify-end">
                      <Button
                        onClick={() => setIsHistoryFormOpen(false)}
                        type="button"
                        variant="ghost"
                      >
                        Cancelar
                      </Button>
                      <Button
                        loading={isSavingHistory}
                        onClick={handleSaveHistory}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {historyLoading ? (
                <div className="rounded-2xl border border-garden-100 bg-white/80 p-4 text-gray-700">
                  Cargando historial...
                </div>
              ) : recentCareEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentCareEvents.map((event) => {
                    const meta = careTypeMeta[event.type];

                    return (
                      <article
                        className="rounded-[1.5rem] border border-garden-100 bg-white/90 p-4 shadow-sm"
                        key={event.id}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span
                            className={[
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1',
                              meta.tone,
                            ].join(' ')}
                          >
                            <span aria-hidden="true">{meta.icon}</span>
                            {meta.label}
                          </span>

                          <time className="text-sm font-medium text-garden-600">
                            {careDateFormatter.format(event.date)}
                          </time>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                          {event.notes || 'Sin notas para este cuidado'}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-garden-200 bg-garden-50/70 p-4 text-gray-700">
                  Sin registros de cuidados para esta planta
                </div>
              )}
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
