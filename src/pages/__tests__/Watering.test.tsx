import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Watering } from '../Watering';

const mockUseWatering = vi.fn();

vi.mock('../../hooks/useWatering', () => ({
  useWatering: () => mockUseWatering(),
}));

const schedules = [
  {
    plantId: 'plant-overdue',
    plantName: 'Lavanda',
    frequencyDays: 2,
    lastWateredAt: new Date('2024-04-20T10:00:00.000Z'),
    nextWateringDate: new Date('2024-04-22T10:00:00.000Z'),
    isOverdue: true,
    daysUntilNext: -2,
  },
  {
    plantId: 'plant-today',
    plantName: 'Menta',
    frequencyDays: 3,
    lastWateredAt: new Date('2024-04-21T08:00:00.000Z'),
    nextWateringDate: new Date('2024-04-24T08:00:00.000Z'),
    isOverdue: false,
    daysUntilNext: 0,
  },
  {
    plantId: 'plant-never',
    plantName: 'Calathea',
    frequencyDays: 4,
    lastWateredAt: null,
    nextWateringDate: null,
    isOverdue: false,
    daysUntilNext: null,
  },
  {
    plantId: 'plant-upcoming',
    plantName: 'Romero',
    frequencyDays: 5,
    lastWateredAt: new Date('2024-04-23T09:00:00.000Z'),
    nextWateringDate: new Date('2024-04-28T09:00:00.000Z'),
    isOverdue: false,
    daysUntilNext: 4,
  },
];

const dueToday = [schedules[0], schedules[1], schedules[2]];
const dueThisWeek = [schedules[3]];

function renderWatering() {
  render(
    <MemoryRouter>
      <Watering />
    </MemoryRouter>,
  );
}

describe('Watering page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-24T10:00:00.000Z'));
    mockUseWatering.mockReturnValue({
      logs: [],
      schedules,
      dueToday,
      dueThisWeek,
      loading: false,
      logWatering: vi.fn().mockResolvedValue('new-log'),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the watering sections and summary cards', () => {
    renderWatering();

    expect(screen.getByText('Riego')).toBeInTheDocument();
    expect(screen.getByText('Pendientes hoy')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hoy' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Esta semana' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lavanda')).toBeInTheDocument();
    expect(screen.getByText('Menta')).toBeInTheDocument();
    expect(screen.getByText('Calathea')).toBeInTheDocument();
    expect(screen.getByText('Romero')).toBeInTheDocument();
    expect(screen.getByText('Atrasada')).toBeInTheDocument();
    expect(screen.getAllByText('Hoy').length).toBeGreaterThan(0);
    expect(screen.getByText('En 4 días')).toBeInTheDocument();
    expect(screen.getByText('Nunca regada — regar pronto')).toBeInTheDocument();
  });

  it('calls logWatering when clicking Regar ahora', async () => {
    const logWatering = vi.fn().mockResolvedValue('new-log');

    mockUseWatering.mockReturnValue({
      logs: [],
      schedules,
      dueToday,
      dueThisWeek,
      loading: false,
      logWatering,
    });

    renderWatering();

    const buttons = screen.getAllByRole('button', { name: 'Regar ahora' });

    await act(async () => {
      fireEvent.click(buttons[0]);
    });

    expect(logWatering).toHaveBeenCalledWith('plant-overdue');
    expect(screen.getByText('¡Riego guardado!')).toBeInTheDocument();
  });

  it('shows empty state when there are no plants', () => {
    mockUseWatering.mockReturnValue({
      logs: [],
      schedules: [],
      dueToday: [],
      dueThisWeek: [],
      loading: false,
      logWatering: vi.fn(),
    });

    renderWatering();

    expect(
      screen.getByText(
        'No tienes plantas registradas. ¡Añade algunas para empezar!',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Ir a mis plantas' }),
    ).toHaveAttribute('href', '/plants');
  });
});
