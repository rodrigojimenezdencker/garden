import { render, screen } from '@testing-library/react';
import { act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../Dashboard';

const mockUsePlants = vi.fn();
const mockUseWatering = vi.fn();
const mockUseCareHistory = vi.fn();

vi.mock('../../hooks/usePlants', () => ({
  usePlants: () => mockUsePlants(),
}));

vi.mock('../../hooks/useWatering', () => ({
  useWatering: () => mockUseWatering(),
}));

vi.mock('../../hooks/useCareHistory', () => ({
  useCareHistory: () => mockUseCareHistory(),
}));

vi.mock('../../hooks/useWeather', () => ({
  useWeather: () => ({
    forecast: null,
    shouldSkipWatering: false,
    loading: false,
    error: null,
    hasLocation: false,
    requestLocation: vi.fn(),
  }),
}));

vi.mock('../../services/weather', () => ({
  weatherCodeToEmoji: () => '🌤️',
}));

const plants = [
  {
    id: 'plant-1',
    name: 'Lavanda',
    species: 'Lavandula angustifolia',
    photoUrl: null,
    photoPath: null,
    zoneId: null,
    notes: '',
    wateringFrequencyDays: 7,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
  {
    id: 'plant-2',
    name: 'Menta',
    species: 'Mentha spicata',
    photoUrl: null,
    photoPath: null,
    zoneId: null,
    notes: '',
    wateringFrequencyDays: 3,
    customCareData: null,
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

const schedules = [
  {
    plantId: 'plant-1',
    plantName: 'Lavanda',
    frequencyDays: 7,
    lastWateredAt: new Date('2024-04-20T10:00:00.000Z'),
    nextWateringDate: new Date('2024-04-22T10:00:00.000Z'),
    isOverdue: true,
    daysUntilNext: -2,
  },
  {
    plantId: 'plant-2',
    plantName: 'Menta',
    frequencyDays: 3,
    lastWateredAt: new Date('2024-04-21T08:00:00.000Z'),
    nextWateringDate: new Date('2024-04-24T08:00:00.000Z'),
    isOverdue: false,
    daysUntilNext: 0,
  },
];

const careEvents = [
  {
    id: 'event-1',
    plantId: 'plant-1',
    type: 'water' as const,
    date: new Date('2024-04-23T10:00:00.000Z'),
    notes: 'Riego profundo',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-23T10:00:00.000Z'),
  },
  {
    id: 'event-2',
    plantId: 'plant-2',
    type: 'prune' as const,
    date: new Date('2024-04-22T09:00:00.000Z'),
    notes: '',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-22T09:00:00.000Z'),
  },
  {
    id: 'event-3',
    plantId: 'plant-1',
    type: 'fertilize' as const,
    date: new Date('2024-04-10T08:00:00.000Z'),
    notes: '',
    loggedBy: 'user-1',
    createdAt: new Date('2024-04-10T08:00:00.000Z'),
  },
];

function renderDashboard() {
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-04-24T10:00:00.000Z'));

    mockUsePlants.mockReturnValue({
      plants,
      loading: false,
      addPlant: vi.fn(),
      updatePlant: vi.fn(),
      deletePlant: vi.fn(),
      getPlant: vi.fn(),
    });

    mockUseWatering.mockReturnValue({
      logs: [],
      schedules,
      loading: false,
      logWatering: vi.fn().mockResolvedValue('new-log'),
    });

    mockUseCareHistory.mockReturnValue({
      events: careEvents,
      loading: false,
      addCareEvent: vi.fn(),
      getEventsForPlant: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the page title', () => {
    renderDashboard();
    expect(screen.getByText('Mi Jardín')).toBeInTheDocument();
  });

  it('shows correct total plants count', () => {
    renderDashboard();
    expect(screen.getByText('Total plantas')).toBeInTheDocument();
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('shows correct pending today count', () => {
    renderDashboard();
    expect(screen.getAllByText('Pendientes hoy').length).toBeGreaterThanOrEqual(
      1,
    );
    const allTwos = screen.getAllByText('2');
    expect(allTwos.length).toBeGreaterThan(0);
  });

  it('shows care events count for this week', () => {
    renderDashboard();
    expect(screen.getByText('Cuidados esta semana')).toBeInTheDocument();
  });

  it('lists pending watering plants with Regar button', () => {
    renderDashboard();
    expect(screen.getAllByText('Lavanda').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Menta').length).toBeGreaterThan(0);
    const regarButtons = screen.getAllByRole('button', { name: 'Regar' });
    expect(regarButtons).toHaveLength(2);
  });

  it('calls logWatering when clicking Regar', async () => {
    const logWatering = vi.fn().mockResolvedValue('new-log');
    mockUseWatering.mockReturnValue({
      logs: [],
      schedules,
      loading: false,
      logWatering,
    });

    renderDashboard();

    const regarButtons = screen.getAllByRole('button', { name: 'Regar' });
    await act(async () => {
      fireEvent.click(regarButtons[0]);
    });

    expect(logWatering).toHaveBeenCalledWith('plant-1');
    expect(screen.getByText('¡Riego guardado! 🎉')).toBeInTheDocument();
  });

  it('shows recent care events in activity section', () => {
    renderDashboard();
    expect(screen.getByText('Actividad reciente')).toBeInTheDocument();
    expect(screen.getByText('Riego profundo')).toBeInTheDocument();
  });

  it('shows the weather widget', () => {
    renderDashboard();
    expect(screen.getByText('Clima')).toBeInTheDocument();
    expect(
      screen.getByText('Configura tu ubicación para ver el pronóstico'),
    ).toBeInTheDocument();
  });

  it('shows empty pending state when all plants are up to date', () => {
    mockUseWatering.mockReturnValue({
      logs: [],
      schedules: [
        {
          plantId: 'plant-1',
          plantName: 'Lavanda',
          frequencyDays: 7,
          lastWateredAt: new Date('2024-04-24T08:00:00.000Z'),
          nextWateringDate: new Date('2024-05-01T08:00:00.000Z'),
          isOverdue: false,
          daysUntilNext: 7,
        },
      ],
      loading: false,
      logWatering: vi.fn(),
    });

    renderDashboard();

    expect(
      screen.getByText('¡Todo al día! No hay riegos pendientes.'),
    ).toBeInTheDocument();
  });

  it('shows empty activity state when there are no care events', () => {
    mockUseCareHistory.mockReturnValue({
      events: [],
      loading: false,
      addCareEvent: vi.fn(),
      getEventsForPlant: vi.fn(),
    });

    renderDashboard();

    expect(
      screen.getByText('Aún no hay cuidados registrados.'),
    ).toBeInTheDocument();
  });

  it('shows loading state while data is being fetched', () => {
    mockUsePlants.mockReturnValue({
      plants: [],
      loading: true,
      addPlant: vi.fn(),
      updatePlant: vi.fn(),
      deletePlant: vi.fn(),
      getPlant: vi.fn(),
    });

    renderDashboard();

    expect(screen.getByLabelText('Cargando dashboard')).toBeInTheDocument();
  });

  it('shows link to add plants when no plants exist', () => {
    mockUsePlants.mockReturnValue({
      plants: [],
      loading: false,
      addPlant: vi.fn(),
      updatePlant: vi.fn(),
      deletePlant: vi.fn(),
      getPlant: vi.fn(),
    });
    mockUseWatering.mockReturnValue({
      logs: [],
      schedules: [],
      loading: false,
      logWatering: vi.fn(),
    });

    renderDashboard();

    const link = screen.getByRole('link', { name: 'Añadir plantas' });
    expect(link).toHaveAttribute('href', '/plants');
  });
});
