import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Guardar</Button>);
    expect(
      screen.getByRole('button', { name: /guardar/i }),
    ).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Hacer clic</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner and disables button when loading', () => {
    render(<Button loading>Guardando</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Desactivado</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>Principal</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-garden-600');
  });

  it('applies secondary variant classes', () => {
    render(<Button variant="secondary">Secundario</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-garden-100');
  });

  it('applies danger variant classes', () => {
    render(<Button variant="danger">Eliminar</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('bg-red-600');
  });
});
