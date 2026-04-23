import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CareType } from '../../types/care';
import { History } from '../History';

const mockUsePlants = vi.fn();
const mockUseCareHistory = vi.fn();
const mockAddCareEvent = vi.fn();

vi.mock('../../hooks/usePlants', () => ({
  usePlants: () => mockUsePlants(),
}));

vi.mock('../../hooks/useCareHistory', () => ({
  useCareHistory: () => mockUseCareHistory(),
}));

const plants = [
  {
    id: 'plant-1',
    name: 'Lavanda',
    species: 'Lavandula angustifolia',
    photoUrl: null,
    photoPath: null,
    zoneId: 'sun',
    notes: '',
    wateringFrequencyDays: 7,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  },
  {
    id: 'plant-2',
    name: 'Menta',
    species: 'Mentha spicata',
    photoUrl: null,
    photoPath: null,
    zoneId: 'shade',
    notes: '',
    wateringFrequencyDays: 2,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-04-01T00:00:00.000Z'),
    updatedAt: new Date('2026-04-01T00:00:00.000Z'),
  },
];

const events = [
  {
    id: 'event-1',
    plantId: 'plant-1',
    type: CareType.Water,
    date: new Date('2026-04-24T12:00:00.000Z'),
    notes: 'Riego profundo',
    loggedBy: 'user-1',
    createdAt: new Date('2026-04-24T12:00:00.000Z'),
  },
  {
    id: 'event-2',
    plantId: 'plant-2',
    type: CareType.Prune,
    date: new Date('2026-04-20T12:00:00.000Z'),
    notes: 'Podé los tallos largos',
    loggedBy: 'user-1',
    createdAt: new Date('2026-04-20T12:00:00.000Z'),
  },
];

describe('History page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddCareEvent.mockResolvedValue('new-event-id');
    mockUsePlants.mockReturnValue({
      plants,
      loading: false,
      getPlant: vi.fn(),
    });
    mockUseCareHistory.mockReturnValue({
      events,
      loading: false,
      addCareEvent: mockAddCareEvent,
      getEventsForPlant: vi.fn(),
    });
  });

  it('renders care timeline entries', () => {
    render(<History />);

    expect(screen.getByText('Historial de Cuidados')).toBeInTheDocument();
    expect(screen.getByText('Riego profundo')).toBeInTheDocument();
    expect(screen.getByText('Podé los tallos largos')).toBeInTheDocument();
    expect(screen.getAllByText('Lavanda').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menta').length).toBeGreaterThan(0);
  });

  it('filters timeline by care type', async () => {
    const user = userEvent.setup();
    render(<History />);

    await user.click(screen.getByRole('button', { name: 'Poda' }));

    expect(screen.queryByText('Riego profundo')).not.toBeInTheDocument();
    expect(screen.getByText('Podé los tallos largos')).toBeInTheDocument();
  });

  it('opens form and adds a new care event', async () => {
    const user = userEvent.setup();
    render(<History />);

    await user.click(screen.getByRole('button', { name: 'Añadir evento' }));
    await user.selectOptions(screen.getByLabelText('Planta'), 'plant-2');
    await user.selectOptions(
      screen.getByLabelText('Tipo de cuidado'),
      CareType.Transplant,
    );
    await user.clear(screen.getByLabelText('Fecha'));
    await user.type(screen.getByLabelText('Fecha'), '2026-04-18');
    await user.type(screen.getByLabelText('Notas'), 'Cambio a maceta grande');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(mockAddCareEvent).toHaveBeenCalledWith({
        plantId: 'plant-2',
        type: CareType.Transplant,
        date: new Date('2026-04-18T12:00:00'),
        notes: 'Cambio a maceta grande',
      });
    });
  });

  it('shows empty state when there are no care events', () => {
    mockUseCareHistory.mockReturnValue({
      events: [],
      loading: false,
      addCareEvent: mockAddCareEvent,
      getEventsForPlant: vi.fn(),
    });

    render(<History />);

    expect(
      screen.getByText('No hay registros de cuidados todavía.'),
    ).toBeInTheDocument();
  });
});
