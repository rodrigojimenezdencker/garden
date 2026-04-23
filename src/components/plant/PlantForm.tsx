import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { findPlantDefaults } from '../../data/plant-care-defaults';
import { usePlants } from '../../hooks/usePlants';
import type { Plant, PlantCareData } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface PlantFormProps {
  plant?: Plant;
  onSave: () => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
}

const zoneOptions = [
  { value: 'sun', label: 'Sol' },
  { value: 'shade', label: 'Sombra' },
  { value: 'terrace', label: 'Terraza' },
  { value: 'indoor', label: 'Interior' },
  { value: 'other', label: 'Otra' },
] as const;

export function PlantForm({ plant, onSave, onCancel }: PlantFormProps) {
  const { addPlant, updatePlant } = usePlants();
  const [name, setName] = useState(plant?.name ?? '');
  const [species, setSpecies] = useState(plant?.species ?? '');
  const [zoneId, setZoneId] = useState(plant?.zoneId ?? 'other');
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState(
    plant?.wateringFrequencyDays.toString() ?? '7',
  );
  const [notes, setNotes] = useState(plant?.notes ?? '');
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    plant?.photoUrl ?? null,
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customCareData, setCustomCareData] = useState<PlantCareData | null>(
    plant?.customCareData ?? null,
  );

  const speciesSuggestions = useMemo(() => {
    return findPlantDefaults(species).slice(0, 5);
  }, [species]);

  const showSuggestions =
    species.trim().length > 0 && speciesSuggestions.length > 0;

  useEffect(() => {
    setName(plant?.name ?? '');
    setSpecies(plant?.species ?? '');
    setZoneId(plant?.zoneId ?? 'other');
    setWateringFrequencyDays(plant?.wateringFrequencyDays.toString() ?? '7');
    setNotes(plant?.notes ?? '');
    setPreviewUrl(plant?.photoUrl ?? null);
    setCustomCareData(plant?.customCareData ?? null);
  }, [plant]);

  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(plant?.photoUrl ?? null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile, plant?.photoUrl]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Nombre requerido';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSpeciesSelect = (selectedSpecies: string) => {
    const selectedDefault = findPlantDefaults(selectedSpecies).find((entry) => {
      return entry.species === selectedSpecies;
    });

    setSpecies(selectedSpecies);

    if (selectedDefault) {
      setWateringFrequencyDays(
        selectedDefault.wateringFrequencyDays.toString(),
      );
      setCustomCareData({
        sunlight: selectedDefault.sunlight,
        soilType: selectedDefault.soilType,
        hardinessZoneMin: selectedDefault.hardinessZoneMin,
        hardinessZoneMax: selectedDefault.hardinessZoneMax,
        pruningSeason: selectedDefault.pruningSeason,
        fertilizingFrequencyDays: selectedDefault.fertilizingFrequencyDays,
        careTips: selectedDefault.careTips,
      });
    }
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoFile(file);
    setSubmitError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        name: name.trim(),
        species: species.trim(),
        zoneId,
        notes: notes.trim(),
        wateringFrequencyDays: Number(wateringFrequencyDays) || 0,
        customCareData,
      };

      if (plant) {
        await updatePlant(plant.id, payload, photoFile);
      } else {
        await addPlant(payload, photoFile);
      }

      onSave();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo guardar la planta',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-[2rem] border border-garden-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm md:p-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-garden-500">
          {plant ? 'Editar planta' : 'Nueva planta'}
        </p>
        <h1 className="text-3xl font-semibold text-garden-900">
          {plant ? 'Actualiza tu planta' : 'Añade una nueva compañera verde'}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Input
          error={errors.name}
          id="plant-name"
          label="Nombre"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />

        <div className="relative flex flex-col gap-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="plant-species"
          >
            Especie
          </label>
          <input
            autoComplete="off"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
            id="plant-species"
            onChange={(event) => {
              setSpecies(event.target.value);
              setCustomCareData(null);
            }}
            placeholder="Busca por nombre común o especie"
            value={species}
          />

          {showSuggestions && (
            <ul className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-garden-100 bg-white shadow-lg">
              {speciesSuggestions.map((suggestion) => (
                <li key={suggestion.species}>
                  <button
                    className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-garden-50"
                    onClick={() => handleSpeciesSelect(suggestion.species)}
                    type="button"
                  >
                    <span className="font-medium text-garden-900">
                      {suggestion.commonNameEs}
                    </span>
                    <span className="text-sm text-gray-500">
                      {suggestion.species}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="plant-photo"
          >
            Foto
          </label>
          <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-garden-200 bg-garden-50/70 p-4 md:flex-row md:items-center">
            <div className="h-28 w-full overflow-hidden rounded-2xl bg-linear-to-br from-garden-200 via-garden-100 to-white md:w-40">
              {previewUrl ? (
                <img
                  alt="Vista previa de la planta"
                  className="h-full w-full object-cover"
                  src={previewUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-garden-600">
                  🌱
                </div>
              )}
            </div>

            <input
              accept="image/*"
              id="plant-photo"
              onChange={handlePhotoChange}
              type="file"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="plant-zone"
          >
            Zona
          </label>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
            id="plant-zone"
            onChange={(event) => setZoneId(event.target.value)}
            value={zoneId}
          >
            {zoneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="plant-watering-frequency"
          label="Frecuencia de riego (días)"
          min="1"
          onChange={(event) => setWateringFrequencyDays(event.target.value)}
          type="number"
          value={wateringFrequencyDays}
        />

        <div className="flex flex-col gap-1 md:col-span-2">
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="plant-notes"
          >
            Notas
          </label>
          <textarea
            className="min-h-32 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20"
            id="plant-notes"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Añade observaciones, cuidados especiales o recordatorios"
            value={notes}
          />
        </div>
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} type="button" variant="ghost">
          Cancelar
        </Button>
        <Button loading={isSubmitting} type="submit">
          {plant ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
