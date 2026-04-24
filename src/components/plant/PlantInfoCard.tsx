import { findPlantDefaults } from '../../data/plant-care-defaults';
import type { Plant, PlantCareData } from '../../types';
import { Card } from '../ui/Card';

interface PlantInfoCardProps {
  plant: Plant;
}

const SUNLIGHT_LABELS: Record<PlantCareData['sunlight'], string> = {
  'full-sun': 'Pleno sol',
  partial: 'Parcial',
  shade: 'Sombra',
};

const NO_DATA = 'Sin datos';

function resolveField<T>(
  custom: T | null | undefined,
  fallback: T | null | undefined,
): T | null {
  return custom ?? fallback ?? null;
}

function useCareFields(plant: Plant) {
  const defaults = findPlantDefaults(plant.species);
  const defaultCare = defaults[0] ?? null;
  const custom = plant.customCareData;

  const sunlight = resolveField(custom?.sunlight, defaultCare?.sunlight);
  const soilType = resolveField(custom?.soilType, defaultCare?.soilType);
  const pruningSeason = resolveField(
    custom?.pruningSeason,
    defaultCare?.pruningSeason,
  );
  const fertilizingFrequencyDays = resolveField(
    custom?.fertilizingFrequencyDays,
    defaultCare?.fertilizingFrequencyDays,
  );
  const hardinessZoneMin = resolveField(
    custom?.hardinessZoneMin,
    defaultCare?.hardinessZoneMin,
  );
  const hardinessZoneMax = resolveField(
    custom?.hardinessZoneMax,
    defaultCare?.hardinessZoneMax,
  );
  const careTips = resolveField(custom?.careTips, defaultCare?.careTips);
  const wateringFrequencyDays =
    plant.wateringFrequencyDays ?? defaultCare?.wateringFrequencyDays ?? null;

  return {
    sunlight,
    soilType,
    pruningSeason,
    fertilizingFrequencyDays,
    hardinessZoneMin,
    hardinessZoneMax,
    careTips,
    wateringFrequencyDays,
  };
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-2 py-2">
      <span className="text-lg leading-6" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function PlantInfoCard({ plant }: PlantInfoCardProps) {
  const fields = useCareFields(plant);

  const sunlightDisplay = fields.sunlight
    ? SUNLIGHT_LABELS[fields.sunlight]
    : NO_DATA;

  const wateringDisplay = fields.wateringFrequencyDays
    ? `Cada ${fields.wateringFrequencyDays} días`
    : NO_DATA;

  const hardinessDisplay =
    fields.hardinessZoneMin != null && fields.hardinessZoneMax != null
      ? `Zona ${fields.hardinessZoneMin} – ${fields.hardinessZoneMax}`
      : NO_DATA;

  const fertilizingDisplay = fields.fertilizingFrequencyDays
    ? `Cada ${fields.fertilizingFrequencyDays} días`
    : NO_DATA;

  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold text-gray-900 text-base">
        Cuidados de {plant.name}
      </h3>
      <div className="divide-y divide-gray-100">
        <InfoRow icon="☀️" label="Luz" value={sunlightDisplay} />
        <InfoRow icon="💧" label="Riego" value={wateringDisplay} />
        <InfoRow icon="🌱" label="Suelo" value={fields.soilType ?? NO_DATA} />
        <InfoRow
          icon="✂️"
          label="Poda"
          value={fields.pruningSeason ?? NO_DATA}
        />
        <InfoRow icon="🧪" label="Abono" value={fertilizingDisplay} />
        <InfoRow
          icon="🌡️"
          label="Zona de resistencia"
          value={hardinessDisplay}
        />
        <InfoRow
          icon="💡"
          label="Consejos"
          value={fields.careTips ?? NO_DATA}
        />
      </div>
    </Card>
  );
}
