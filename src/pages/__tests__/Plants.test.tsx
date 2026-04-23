import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Plants } from '../Plants';

const mockUsePlants = vi.fn();

vi.mock('../../hooks/usePlants', () => ({
  usePlants: () => mockUsePlants(),
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
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
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
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  },
];

function renderPlants(initialEntries = ['/plants']) {
  const router = createMemoryRouter(
    [{ path: '/plants', element: <Plants /> }],
    { initialEntries },
  );

  render(<RouterProvider router={router} />);
}

describe('Plants page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePlants.mockReturnValue({
      plants,
      loading: false,
    });
  });

  it('renders plants list', () => {
    renderPlants();

    expect(screen.getByText('Mis Plantas')).toBeInTheDocument();
    expect(screen.getByText('Lavanda')).toBeInTheDocument();
    expect(screen.getByText('Menta')).toBeInTheDocument();
  });

  it('filters plants by search', async () => {
    const user = userEvent.setup();
    renderPlants();

    await user.type(screen.getByLabelText('Buscar'), 'mentha');

    expect(screen.queryByText('Lavanda')).not.toBeInTheDocument();
    expect(screen.getByText('Menta')).toBeInTheDocument();
  });

  it('shows empty state when there are no plants', () => {
    mockUsePlants.mockReturnValue({
      plants: [],
      loading: false,
    });

    renderPlants();

    expect(
      screen.getByText(
        'No tienes plantas todavía. ¡Añade tu primera planta! 🌱',
      ),
    ).toBeInTheDocument();
  });
});
