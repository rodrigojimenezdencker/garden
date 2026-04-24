import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BottomNav } from '../BottomNav';

vi.mock('../../../hooks/useReminders', () => ({
  useReminders: () => ({
    reminders: [],
    reminderCount: 0,
    dismiss: vi.fn(),
    hasUnacknowledged: false,
  }),
}));

describe('BottomNav', () => {
  it('renders 5 navigation items', () => {
    render(<BottomNav />);
    expect(
      screen.getByRole('button', { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /plantas/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /riego/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /historial/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ajustes/i }),
    ).toBeInTheDocument();
  });

  it('highlights the active item', () => {
    render(<BottomNav activeItem="plantas" />);
    const plantasBtn = screen.getByRole('button', { name: /plantas/i });
    expect(plantasBtn).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive items as current', () => {
    render(<BottomNav activeItem="riego" />);
    const dashboardBtn = screen.getByRole('button', { name: /dashboard/i });
    expect(dashboardBtn).not.toHaveAttribute('aria-current', 'page');
  });
});
