import { type SyntheticEvent, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ZoneCard } from '../components/zones/ZoneCard';
import { ZonePlantList } from '../components/zones/ZonePlantList';
import { usePlants } from '../hooks/usePlants';
import { getProtectedDeleteMessage, useZones } from '../hooks/useZones';
import { type GardenZone, ZoneType, type ZoneTypeValue } from '../types';

interface ZoneFormState {
  name: string;
  type: ZoneTypeValue;
}

const zoneTypeOptions: Array<{ value: ZoneTypeValue; label: string }> = [
  { value: ZoneType.Sun, label: 'Sol' },
  { value: ZoneType.Shade, label: 'Sombra' },
  { value: ZoneType.Terrace, label: 'Terraza' },
  { value: ZoneType.Indoor, label: 'Interior' },
  { value: ZoneType.Other, label: 'Otra' },
];

const createInitialFormState = (): ZoneFormState => ({
  name: '',
  type: ZoneType.Sun,
});

export function Zones() {
  const { plants } = usePlants();
  const { zones, loading, addZone, updateZone, deleteZone } = useZones();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [addForm, setAddForm] = useState<ZoneFormState>(createInitialFormState);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ZoneFormState>(
    createInitialFormState,
  );
  const [expandedZoneId, setExpandedZoneId] = useState<string | null>(null);
  const [deleteConfirmZoneId, setDeleteConfirmZoneId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const plantsByZone = useMemo(() => {
    return zones.reduce<Record<string, typeof plants>>((accumulator, zone) => {
      accumulator[zone.id] = plants.filter((plant) => plant.zoneId === zone.id);
      return accumulator;
    }, {});
  }, [plants, zones]);

  const openEditForm = (zone: GardenZone) => {
    setEditingZoneId(zone.id);
    setEditForm({ name: zone.name, type: zone.type });
    setDeleteConfirmZoneId(null);
    setErrorMessage(null);
  };

  const handleAddZone = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await addZone(addForm.name, addForm.type);
      setAddForm(createInitialFormState());
      setIsAddFormOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo añadir la zona',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateZone = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingZoneId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await updateZone(editingZoneId, editForm);
      setEditingZoneId(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la zona',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await deleteZone(zoneId);
      setDeleteConfirmZoneId(null);
      setExpandedZoneId((currentZoneId) =>
        currentZoneId === zoneId ? null : currentZoneId,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo eliminar la zona',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(244,196,48,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(116,198,157,0.18),_transparent_38%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-garden-500">
              Sectores vivos
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-garden-950">
                Zonas del Jardín
              </h1>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-garden-700 shadow-sm ring-1 ring-garden-100">
                {zones.length}
              </span>
            </div>
          </div>

          <Button
            onClick={() => {
              setIsAddFormOpen((currentValue) => !currentValue);
              setErrorMessage(null);
            }}
          >
            Añadir zona
          </Button>
        </div>

        {isAddFormOpen ? (
          <section className="rounded-[2rem] border border-garden-100 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <form
              className="grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-end"
              onSubmit={handleAddZone}
            >
              <Input
                id="zone-name"
                label="Nombre"
                onChange={(event) =>
                  setAddForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ej. Bancal aromático"
                value={addForm.name}
              />

              <div className="flex flex-col gap-1">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="zone-type"
                >
                  Tipo
                </label>
                <select
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                  id="zone-type"
                  onChange={(event) =>
                    setAddForm((current) => ({
                      ...current,
                      type: event.target.value as ZoneTypeValue,
                    }))
                  }
                  value={addForm.type}
                >
                  {zoneTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 md:justify-end">
                <Button
                  onClick={() => {
                    setIsAddFormOpen(false);
                    setAddForm(createInitialFormState());
                    setErrorMessage(null);
                  }}
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button loading={isSubmitting} type="submit">
                  Guardar
                </Button>
              </div>
            </form>

            {errorMessage ? (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </section>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-garden-100 bg-white/80 p-8 text-center text-garden-700 shadow-sm backdrop-blur-sm">
            Cargando zonas...
          </div>
        ) : zones.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-garden-200 bg-white/80 p-10 text-center shadow-sm backdrop-blur-sm">
            <p className="text-lg font-medium text-garden-900">
              No hay zonas creadas todavía.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {zones.map((zone) => {
              const zonePlants = plantsByZone[zone.id] ?? [];
              const isExpanded = expandedZoneId === zone.id;
              const isEditing = editingZoneId === zone.id;
              const isDeleteConfirmOpen = deleteConfirmZoneId === zone.id;
              const protectionMessage = getProtectedDeleteMessage(
                zonePlants.length,
              );

              return (
                <section className="space-y-3" key={zone.id}>
                  <ZoneCard
                    onClick={() => {
                      setExpandedZoneId((currentZoneId) =>
                        currentZoneId === zone.id ? null : zone.id,
                      );
                      setErrorMessage(null);
                    }}
                    onDelete={() => {
                      setDeleteConfirmZoneId(zone.id);
                      setEditingZoneId(null);
                      setErrorMessage(null);
                    }}
                    onEdit={() => openEditForm(zone)}
                    plantCount={zonePlants.length}
                    zone={zone}
                  />

                  {isEditing ? (
                    <div className="rounded-[1.75rem] border border-garden-100 bg-white/90 p-5 shadow-sm">
                      <form
                        className="grid gap-4 md:grid-cols-[1fr_14rem_auto] md:items-end"
                        onSubmit={handleUpdateZone}
                      >
                        <Input
                          id={`edit-zone-name-${zone.id}`}
                          label="Nombre"
                          onChange={(event) =>
                            setEditForm((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          value={editForm.name}
                        />

                        <div className="flex flex-col gap-1">
                          <label
                            className="text-sm font-medium text-gray-700"
                            htmlFor={`edit-zone-type-${zone.id}`}
                          >
                            Tipo
                          </label>
                          <select
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
                            id={`edit-zone-type-${zone.id}`}
                            onChange={(event) =>
                              setEditForm((current) => ({
                                ...current,
                                type: event.target.value as ZoneTypeValue,
                              }))
                            }
                            value={editForm.type}
                          >
                            {zoneTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-3 md:justify-end">
                          <Button
                            onClick={() => {
                              setEditingZoneId(null);
                              setErrorMessage(null);
                            }}
                            type="button"
                            variant="ghost"
                          >
                            Cancelar
                          </Button>
                          <Button loading={isSubmitting} type="submit">
                            Guardar
                          </Button>
                        </div>
                      </form>

                      {errorMessage ? (
                        <p className="mt-3 text-sm text-red-600">
                          {errorMessage}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {isDeleteConfirmOpen ? (
                    <div className="rounded-[1.75rem] border border-garden-100 bg-white/90 p-5 shadow-sm">
                      <h3 className="text-base font-semibold text-garden-950">
                        ¿Eliminar {zone.name}?
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {zonePlants.length > 0
                          ? protectionMessage
                          : 'Esta zona dejará de estar disponible en tu jardín.'}
                      </p>

                      {errorMessage ? (
                        <p className="mt-3 text-sm text-red-600">
                          {errorMessage}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap justify-end gap-3">
                        <Button
                          onClick={() => {
                            setDeleteConfirmZoneId(null);
                            setErrorMessage(null);
                          }}
                          variant="ghost"
                        >
                          Cancelar
                        </Button>
                        {zonePlants.length === 0 ? (
                          <Button
                            loading={isSubmitting}
                            onClick={() => handleDeleteZone(zone.id)}
                            variant="danger"
                          >
                            Eliminar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {isExpanded ? <ZonePlantList plants={zonePlants} /> : null}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Zones;
