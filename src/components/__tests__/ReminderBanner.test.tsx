import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { WateringSchedule } from '../../types';
import { ReminderBanner } from '../ReminderBanner';

const mockDismiss = vi.fn();
const mockNavigate = vi.fn();
const mockUseReminders = vi.fn();

vi.mock('../../hooks/useReminders', () => ({
  useReminders: () => mockUseReminders(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const makeSchedule = (
  overrides: Partial<WateringSchedule> = {},
): WateringSchedule => ({
  plantId: 'plant-1',
  plantName: 'Lavanda',
  frequencyDays: 3,
  lastWateredAt: new Date('2024-06-01'),
  nextWateringDate: new Date('2024-06-04'),
  isOverdue: false,
  daysUntilNext: 0,
  ...overrides,
});

function renderBanner(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ReminderBanner />
    </MemoryRouter>,
  );
}

describe('ReminderBanner', () => {
  it('renders banner with reminder count', () => {
    mockUseReminders.mockReturnValue({
      reminders: [makeSchedule(), makeSchedule({ plantId: 'plant-2' })],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    expect(
      screen.getByText(/2 plantas necesitan agua hoy/),
    ).toBeInTheDocument();
  });

  it('renders singular form for 1 reminder', () => {
    mockUseReminders.mockReturnValue({
      reminders: [makeSchedule()],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    expect(screen.getByText(/1 planta necesita agua hoy/)).toBeInTheDocument();
  });

  it('does not render when no unacknowledged reminders', () => {
    mockUseReminders.mockReturnValue({
      reminders: [],
      hasUnacknowledged: false,
      dismiss: mockDismiss,
    });

    renderBanner();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render on /watering path', () => {
    mockUseReminders.mockReturnValue({
      reminders: [makeSchedule()],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner('/watering');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('uses red background when any reminder is overdue', () => {
    mockUseReminders.mockReturnValue({
      reminders: [
        makeSchedule({ isOverdue: true }),
        makeSchedule({ plantId: 'p2' }),
      ],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-red-500');
  });

  it('uses amber background when none are overdue', () => {
    mockUseReminders.mockReturnValue({
      reminders: [makeSchedule({ isOverdue: false })],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('bg-amber-500');
  });

  it('dismisses all reminders on close button click', () => {
    const reminders = [
      makeSchedule({ plantId: 'a' }),
      makeSchedule({ plantId: 'b' }),
    ];
    mockUseReminders.mockReturnValue({
      reminders,
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    fireEvent.click(screen.getByLabelText('Cerrar aviso'));

    expect(mockDismiss).toHaveBeenCalledTimes(2);
    expect(mockDismiss).toHaveBeenCalledWith('a');
    expect(mockDismiss).toHaveBeenCalledWith('b');
  });

  it('navigates to /watering on banner text click', () => {
    mockUseReminders.mockReturnValue({
      reminders: [makeSchedule()],
      hasUnacknowledged: true,
      dismiss: mockDismiss,
    });

    renderBanner();

    fireEvent.click(screen.getByText(/planta.*necesita.*agua/));

    expect(mockNavigate).toHaveBeenCalledWith('/watering');
  });
});
