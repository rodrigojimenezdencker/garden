import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../AppShell';

describe('AppShell', () => {
  it('renders children', () => {
    render(
      <AppShell>
        <div>Contenido de prueba</div>
      </AppShell>,
    );
    expect(screen.getByText('Contenido de prueba')).toBeInTheDocument();
  });

  it('renders the header with app name', () => {
    render(
      <AppShell>
        <div>Contenido</div>
      </AppShell>,
    );
    expect(screen.getByText(/Mi Jardín/i)).toBeInTheDocument();
  });

  it('renders bottom nav on mobile layout', () => {
    render(
      <AppShell>
        <div>Contenido</div>
      </AppShell>,
    );
    expect(
      screen.getByRole('navigation', { name: /navegación principal/i }),
    ).toBeInTheDocument();
  });

  it('renders sidebar for desktop layout', () => {
    render(
      <AppShell>
        <div>Contenido</div>
      </AppShell>,
    );
    expect(
      screen.getByRole('navigation', { name: /navegación lateral/i }),
    ).toBeInTheDocument();
  });
});
