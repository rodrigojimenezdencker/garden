import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantForm } from '../PlantForm';

const mockAddPlant = vi.fn();
const mockUpdatePlant = vi.fn();

vi.mock('../../../hooks/usePlants', () => ({
  usePlants: () => ({
    plants: [],
    loading: false,
    addPlant: mockAddPlant,
    updatePlant: mockUpdatePlant,
    deletePlant: vi.fn(),
    getPlant: vi.fn(),
  }),
}));

describe('PlantForm', () => {
  const onSave = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddPlant.mockResolvedValue('plant-1');
    mockUpdatePlant.mockResolvedValue(undefined);
  });

  it('shows validation error when name is empty', async () => {
    const user = userEvent.setup();
    render(<PlantForm onCancel={onCancel} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(screen.getByText('Nombre requerido')).toBeInTheDocument();
    expect(mockAddPlant).not.toHaveBeenCalled();
  });

  it('shows autocomplete suggestions and fills watering frequency', async () => {
    const user = userEvent.setup();
    render(<PlantForm onCancel={onCancel} onSave={onSave} />);

    await user.type(screen.getByLabelText('Especie'), 'lava');
    await user.click(screen.getByRole('button', { name: /Lavanda/i }));

    expect(
      screen.getByDisplayValue('Lavandula angustifolia'),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('7')).toBeInTheDocument();
  });

  it('submits add mode using the hook and uploaded photo', async () => {
    const user = userEvent.setup();
    render(<PlantForm onCancel={onCancel} onSave={onSave} />);

    await user.type(screen.getByLabelText('Nombre'), 'Menta');
    await user.type(screen.getByLabelText('Especie'), 'Mentha spicata');
    await user.clear(screen.getByLabelText('Frecuencia de riego (días)'));
    await user.type(screen.getByLabelText('Frecuencia de riego (días)'), '2');
    await user.type(screen.getByLabelText('Notas'), 'Zona fresca');

    const file = new File(['photo'], 'menta.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Foto'), file);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(mockAddPlant).toHaveBeenCalledWith(
        {
          name: 'Menta',
          species: 'Mentha spicata',
          zoneId: 'other',
          notes: 'Zona fresca',
          wateringFrequencyDays: 2,
          customCareData: null,
        },
        file,
      );
    });
    expect(onSave).toHaveBeenCalled();
  });
});
