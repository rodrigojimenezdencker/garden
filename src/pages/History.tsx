import { type FormEvent, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { useCareHistory } from '../hooks/useCareHistory';
import { usePlants } from '../hooks/usePlants';
import {
  type CareEvent,
  CareType,
  type CareType as CareTypeValue,
} from '../types/care';

type CareTypeFilter = 'all' | CareTypeValue;

interface HistoryFormState {
  plantId: string;
  type: CareTypeValue;
  date: string;
  notes: string;
}

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

const typeFilters: Array<{ value: CareTypeFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: CareType.Water, label: 'Riego' },
  { value: CareType.Prune, label: 'Poda' },
  { value: CareType.Fertilize, label: 'Fertilización' },
  { value: CareType.Transplant, label: 'Trasplante' },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getPlantName(
  plantId: string,
  plants: Array<{ id: string; name: string }>,
) {
  return (
    plants.find((plant) => plant.id === plantId)?.name ?? 'Planta eliminada'
  );
}

function TimelineItem({
  event,
  plantName,
}: {
  event: CareEvent;
  plantName: string;
}) {
  const meta = careTypeMeta[event.type];

  return (
    <li className="relative grid gap-3 rounded-[1.75rem] border border-garden-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm md:grid-cols-[8rem_1fr]">
      <div className="text-sm font-medium text-garden-600">
        {formatDate(event.date)}
      </div>

      <div className="space-y-3 border-l border-garden-100 pl-5">
        <div className="absolute left-[7.35rem] top-7 hidden h-3.5 w-3.5 rounded-full border-4 border-white bg-garden-500 shadow-sm md:block" />
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={[
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ring-1',
              meta.tone,
            ].join(' ')}
          >
            <span aria-hidden="true">{meta.icon}</span>
            {meta.label}
          </span>
          <span className="text-sm text-gray-500">{plantName}</span>
        </div>

        {event.notes ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {event.notes}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function History() {
  const { plants, loading: loadingPlants } = usePlants();
  const { events, loading, addCareEvent } = useCareHistory();
  const [typeFilter, setTypeFilter] = useState<CareTypeFilter>('all');
  const [plantFilter, setPlantFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<HistoryFormState>({
    plantId: '',
    type: CareType.Water,
    date: toInputDate(new Date()),
    notes: '',
  });

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = typeFilter === 'all' || event.type === typeFilter;
      const matchesPlant =
        plantFilter === 'all' || event.plantId === plantFilter;

      return matchesType && matchesPlant;
    });
  }, [events, typeFilter, plantFilter]);

  const resetForm = () => {
    setForm({
      plantId: plants[0]?.id ?? '',
      type: CareType.Water,
      date: toInputDate(new Date()),
      notes: '',
    });
    setSubmitError(null);
  };

  const openForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.plantId) {
      setSubmitError('Selecciona una planta');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addCareEvent({
        plantId: form.plantId,
        type: form.type,
        date: new Date(`${form.date}T12:00:00`),
        notes: form.notes,
      });
      closeForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo guardar el evento',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full bg-[radial-gradient(circle_at_top,_rgba(116,198,157,0.18),_transparent_42%)] p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-garden-500">
              Bitácora verde
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-garden-950">
              Historial de Cuidados
            </h1>
          </div>

          <Button onClick={openForm}>Añadir evento</Button>
        </div>

        <section className="rounded-[2rem] border border-garden-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {typeFilters.map((filter) => (
                <button
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    typeFilter === filter.value
                      ? 'bg-garden-600 text-white'
                      : 'bg-garden-50 text-garden-700 hover:bg-garden-100',
                  ].join(' ')}
                  key={filter.value}
                  onClick={() => setTypeFilter(filter.value)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 md:min-w-64">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="history-plant-filter"
              >
                Filtrar por planta
              </label>
              <select
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                id="history-plant-filter"
                onChange={(event) => setPlantFilter(event.target.value)}
                value={plantFilter}
              >
                <option value="all">Todas las plantas</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading || loadingPlants ? (
          <div className="rounded-[2rem] border border-garden-100 bg-white/80 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
            Cargando historial...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
            <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-garden-100 text-4xl">
              🪴
            </div>
            <p className="mt-5 text-lg font-medium text-garden-900">
              No hay registros de cuidados todavía.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {filteredEvents.map((event) => (
              <TimelineItem
                event={event}
                key={event.id}
                plantName={getPlantName(event.plantId, plants)}
              />
            ))}
          </ol>
        )}
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-garden-500">
                  Nuevo registro
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-garden-950">
                  Añadir evento
                </h2>
              </div>

              <button
                aria-label="Cerrar formulario"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-garden-50 hover:text-garden-700"
                onClick={closeForm}
                type="button"
              >
                ✕
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="history-plant"
                >
                  Planta
                </label>
                <select
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                  id="history-plant"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      plantId: event.target.value,
                    }))
                  }
                  value={form.plantId}
                >
                  <option value="">Selecciona una planta</option>
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-sm font-medium text-gray-700"
                    htmlFor="history-type"
                  >
                    Tipo de cuidado
                  </label>
                  <select
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                    id="history-type"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as CareTypeValue,
                      }))
                    }
                    value={form.type}
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
                    htmlFor="history-date"
                  >
                    Fecha
                  </label>
                  <input
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                    id="history-date"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    type="date"
                    value={form.date}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="history-notes"
                >
                  Notas
                </label>
                <textarea
                  className="min-h-28 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                  id="history-notes"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Detalles opcionales del cuidado realizado"
                  value={form.notes}
                />
              </div>

              {submitError ? (
                <p className="text-sm text-red-600">{submitError}</p>
              ) : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button onClick={closeForm} type="button" variant="ghost">
                  Cancelar
                </Button>
                <Button
                  disabled={plants.length === 0}
                  loading={isSubmitting}
                  type="submit"
                >
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default History;
