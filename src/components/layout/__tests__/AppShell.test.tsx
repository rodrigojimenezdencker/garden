import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from '../AppShell';

vi.mock('../../../hooks/useReminders', () => ({
  useReminders: () => ({
    reminders: [],
    reminderCount: 0,
    dismiss: vi.fn(),
    hasUnacknowledged: false,
  }),
}));

describe('AppShell', () => {
  it('renders children', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Contenido de prueba</div>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('renders the header with app name', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Contenido</div>
        </AppShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Mi Jardín/i)).toBeInTheDocument();
  });

  it('renders bottom nav on mobile layout', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Contenido</div>
        </AppShell>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('navigation', { name: /navegación principal/i }),
    ).toBeInTheDocument();
  });

  it('renders sidebar for desktop layout', () => {
    render(
      <MemoryRouter>
        <AppShell>
          <div>Contenido</div>
        </AppShell>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('navigation', { name: /navegación lateral/i }),
    ).toBeInTheDocument();
  });
});
