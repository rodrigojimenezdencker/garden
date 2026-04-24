import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlantPhoto } from '../../../types';
import { PhotoTimeline } from '../PhotoTimeline';

const mockAddPhoto = vi.fn();
const mockDeletePhoto = vi.fn();
const mockUsePhotos = vi.fn();

vi.mock('../../../hooks/usePhotos', () => ({
  usePhotos: (plantId: string) => mockUsePhotos(plantId),
}));

const makePhoto = (overrides: Partial<PlantPhoto> = {}): PlantPhoto => ({
  id: 'photo-1',
  plantId: 'plant-1',
  url: 'https://example.com/photo1.jpg',
  storagePath: 'plant-photos/plant-1/photo1.jpg',
  caption: 'Mi planta en primavera',
  takenAt: new Date('2026-04-10T10:00:00.000Z'),
  uploadedBy: 'user-1',
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
  ...overrides,
});

describe('PhotoTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddPhoto.mockResolvedValue(undefined);
    mockDeletePhoto.mockResolvedValue(undefined);
    mockUsePhotos.mockReturnValue({
      photos: [],
      loading: false,
      addPhoto: mockAddPhoto,
      deletePhoto: mockDeletePhoto,
    });
  });

  it('shows loading state while photos are loading', () => {
    mockUsePhotos.mockReturnValue({
      photos: [],
      loading: true,
      addPhoto: mockAddPhoto,
      deletePhoto: mockDeletePhoto,
    });

    render(<PhotoTimeline plantId="plant-1" />);

    expect(screen.getByText('Cargando fotos...')).toBeInTheDocument();
  });

  it('renders photo thumbnails with dates', () => {
    const photo = makePhoto();
    mockUsePhotos.mockReturnValue({
      photos: [photo],
      loading: false,
      addPhoto: mockAddPhoto,
      deletePhoto: mockDeletePhoto,
    });

    render(<PhotoTimeline plantId="plant-1" />);

    expect(screen.getByAltText('Mi planta en primavera')).toBeInTheDocument();
    expect(screen.getByText(/10 abr 2026/i)).toBeInTheDocument();
  });

  it('shows empty state when no photos', () => {
    render(<PhotoTimeline plantId="plant-1" />);

    expect(screen.getByText(/sin fotos todavía/i)).toBeInTheDocument();
  });

  it('disables "Añadir foto" and shows limit message when at 20 photos', () => {
    const twentyPhotos = Array.from({ length: 20 }, (_, i) =>
      makePhoto({ id: `photo-${i}`, caption: null }),
    );
    mockUsePhotos.mockReturnValue({
      photos: twentyPhotos,
      loading: false,
      addPhoto: mockAddPhoto,
      deletePhoto: mockDeletePhoto,
    });

    render(<PhotoTimeline plantId="plant-1" />);

    const addButton = screen.getByRole('button', { name: 'Añadir foto' });
    expect(addButton).toBeDisabled();
    expect(screen.getByText('Máximo 20 fotos')).toBeInTheDocument();
  });

  it('opens upload form and calls addPhoto on submit', async () => {
    const user = userEvent.setup();
    render(<PhotoTimeline plantId="plant-1" />);

    await user.click(screen.getByRole('button', { name: 'Añadir foto' }));

    expect(screen.getByText('Nueva foto')).toBeInTheDocument();

    const file = new File(['img'], 'planta.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Foto'), file);
    await user.type(
      screen.getByLabelText('Descripción (opcional)'),
      'Recién regada',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(mockAddPhoto).toHaveBeenCalledWith(
        'plant-1',
        file,
        'Recién regada',
      );
    });
  });

  it('cancels upload form without calling addPhoto', async () => {
    const user = userEvent.setup();
    render(<PhotoTimeline plantId="plant-1" />);

    await user.click(screen.getByRole('button', { name: 'Añadir foto' }));
    expect(screen.getByText('Nueva foto')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Nueva foto')).not.toBeInTheDocument();
    expect(mockAddPhoto).not.toHaveBeenCalled();
  });

  it('shows error message when addPhoto fails', async () => {
    mockAddPhoto.mockRejectedValue(new Error('No se pudo subir la foto'));
    const user = userEvent.setup();
    render(<PhotoTimeline plantId="plant-1" />);

    await user.click(screen.getByRole('button', { name: 'Añadir foto' }));

    const file = new File(['img'], 'planta.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Foto'), file);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(screen.getByText('No se pudo subir la foto')).toBeInTheDocument();
    });
  });

  it('shows Comparar button only when 2 or more photos exist', () => {
    mockUsePhotos.mockReturnValue({
      photos: [makePhoto({ id: 'p1' }), makePhoto({ id: 'p2', caption: null })],
      loading: false,
      addPhoto: mockAddPhoto,
      deletePhoto: mockDeletePhoto,
    });

    render(<PhotoTimeline plantId="plant-1" />);

    expect(
      screen.getByRole('button', { name: 'Comparar' }),
    ).toBeInTheDocument();
  });
});
