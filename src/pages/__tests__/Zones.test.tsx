import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoneType } from '../../types';
import { Zones } from '../Zones';

const mockUseZones = vi.fn();
const mockUsePlants = vi.fn();
const mockAddZone = vi.fn();

vi.mock('../../hooks/useZones', () => ({
  useZones: () => mockUseZones(),
  getProtectedDeleteMessage: (count: number) =>
    `Reasigna ${count} planta(s) antes de eliminar esta zona`,
}));

vi.mock('../../hooks/usePlants', () => ({
  usePlants: () => mockUsePlants(),
}));

const zones = [
  {
    id: 'zone-1',
    name: 'Sol directo',
    type: ZoneType.Sun,
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
  },
  {
    id: 'zone-2',
    name: 'Terraza',
    type: ZoneType.Terrace,
    createdAt: new Date('2026-04-02T00:00:00.000Z'),
  },
];

const plants = [
  {
    id: 'plant-1',
    name: 'Lavanda',
    species: 'Lavandula angustifolia',
    photoUrl: null,
    photoPath: null,
    zoneId: 'zone-1',
    notes: '',
    wateringFrequencyDays: 7,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  },
  {
    id: 'plant-2',
    name: 'Romero',
    species: 'Rosmarinus officinalis',
    photoUrl: null,
    photoPath: null,
    zoneId: 'zone-2',
    notes: '',
    wateringFrequencyDays: 5,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  },
];

describe('Zones page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddZone.mockResolvedValue('zone-new');
    mockUseZones.mockReturnValue({
      zones,
      loading: false,
      addZone: mockAddZone,
      updateZone: vi.fn(),
      deleteZone: vi.fn(),
    });
    mockUsePlants.mockReturnValue({ plants });
  });

  it('renders zones and their plants', async () => {
    const user = userEvent.setup();
    render(<Zones />);

    expect(screen.getByText('Zonas del Jardín')).toBeInTheDocument();
    expect(screen.getByText('Sol directo')).toBeInTheDocument();
    expect(screen.getAllByText('Terraza').length).toBeGreaterThan(0);

    await user.click(
      screen.getByRole('button', { name: 'Ver zona Sol directo' }),
    );

    expect(screen.getByText('Lavanda')).toBeInTheDocument();
  });

  it('adds a zone from the inline form', async () => {
    const user = userEvent.setup();
    render(<Zones />);

    await user.click(screen.getByRole('button', { name: 'Añadir zona' }));
    await user.type(screen.getByLabelText('Nombre'), 'Huerto lateral');
    await user.selectOptions(screen.getByLabelText('Tipo'), ZoneType.Shade);
    await user.click(screen.getAllByRole('button', { name: 'Guardar' })[0]);

    expect(mockAddZone).toHaveBeenCalledWith('Huerto lateral', ZoneType.Shade);
  });

  it('shows delete protection when the zone has assigned plants', async () => {
    const user = userEvent.setup();
    render(<Zones />);

    await user.click(
      screen.getByRole('button', { name: 'Eliminar zona Sol directo' }),
    );

    expect(
      screen.getByText('Reasigna 1 planta(s) antes de eliminar esta zona'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Eliminar' }),
    ).not.toBeInTheDocument();
  });
});
