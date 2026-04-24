import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plant } from '../../../types';
import { PlantInfoCard } from '../PlantInfoCard';

vi.mock('../../../data/plant-care-defaults', () => ({
  findPlantDefaults: vi.fn(),
}));

import { findPlantDefaults } from '../../../data/plant-care-defaults';

const mockFindDefaults = vi.mocked(findPlantDefaults);

function makePlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: 'plant-1',
    name: 'Mi Lavanda',
    species: 'Lavandula angustifolia',
    photoUrl: null,
    photoPath: null,
    zoneId: null,
    notes: '',
    wateringFrequencyDays: 7,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const DEFAULT_CARE = {
  commonNameEs: 'Lavanda',
  commonNameEn: 'Lavender',
  species: 'Lavandula angustifolia',
  wateringFrequencyDays: 7,
  sunlight: 'full-sun' as const,
  soilType: 'bien drenado / arenoso',
  hardinessZoneMin: 5,
  hardinessZoneMax: 9,
  pruningSeason: 'Primavera temprana',
  fertilizingFrequencyDays: 365,
  careTips: 'Riega solo cuando el sustrato se haya secado.',
};

describe('PlantInfoCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plant care data from defaults when no custom data', () => {
    mockFindDefaults.mockReturnValue([DEFAULT_CARE]);
    const plant = makePlant();

    render(<PlantInfoCard plant={plant} />);

    expect(screen.getByText('Cuidados de Mi Lavanda')).toBeInTheDocument();
    expect(screen.getByText('Pleno sol')).toBeInTheDocument();
    expect(screen.getByText('Cada 7 días')).toBeInTheDocument();
    expect(screen.getByText('bien drenado / arenoso')).toBeInTheDocument();
    expect(screen.getByText('Primavera temprana')).toBeInTheDocument();
    expect(screen.getByText('Cada 365 días')).toBeInTheDocument();
    expect(screen.getByText('Zona 5 – 9')).toBeInTheDocument();
    expect(
      screen.getByText('Riega solo cuando el sustrato se haya secado.'),
    ).toBeInTheDocument();
  });

  it('shows custom care data overriding defaults', () => {
    mockFindDefaults.mockReturnValue([DEFAULT_CARE]);
    const plant = makePlant({
      customCareData: {
        sunlight: 'partial',
        soilType: 'arcilloso',
        hardinessZoneMin: 3,
        hardinessZoneMax: 7,
        pruningSeason: 'Otoño',
        fertilizingFrequencyDays: 30,
        careTips: 'Consejo personalizado',
      },
    });

    render(<PlantInfoCard plant={plant} />);

    expect(screen.getByText('Parcial')).toBeInTheDocument();
    expect(screen.getByText('arcilloso')).toBeInTheDocument();
    expect(screen.getByText('Otoño')).toBeInTheDocument();
    expect(screen.getByText('Cada 30 días')).toBeInTheDocument();
    expect(screen.getByText('Zona 3 – 7')).toBeInTheDocument();
    expect(screen.getByText('Consejo personalizado')).toBeInTheDocument();

    expect(screen.queryByText('Pleno sol')).not.toBeInTheDocument();
    expect(screen.queryByText('Primavera temprana')).not.toBeInTheDocument();
  });

  it('shows "Sin datos" when no defaults and no custom data', () => {
    mockFindDefaults.mockReturnValue([]);
    const plant = makePlant({ customCareData: null });

    render(<PlantInfoCard plant={plant} />);

    const sinDatosElements = screen.getAllByText('Sin datos');
    expect(sinDatosElements.length).toBeGreaterThanOrEqual(4);
  });

  it('renders all section labels', () => {
    mockFindDefaults.mockReturnValue([DEFAULT_CARE]);
    const plant = makePlant();

    render(<PlantInfoCard plant={plant} />);

    expect(screen.getByText('Luz')).toBeInTheDocument();
    expect(screen.getByText('Riego')).toBeInTheDocument();
    expect(screen.getByText('Suelo')).toBeInTheDocument();
    expect(screen.getByText('Poda')).toBeInTheDocument();
    expect(screen.getByText('Abono')).toBeInTheDocument();
    expect(screen.getByText('Zona de resistencia')).toBeInTheDocument();
    expect(screen.getByText('Consejos')).toBeInTheDocument();
  });
});
