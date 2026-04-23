import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Contenido de la tarjeta</Card>);
    expect(screen.getByText('Contenido de la tarjeta')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Contenido</Card>);
    const card = screen.getByText('Contenido');
    expect(card.className).toContain('custom-class');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Clickeable</Card>);
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has role=button and is focusable when onClick is provided', () => {
    render(<Card onClick={vi.fn()}>Interactivo</Card>);
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');
  });

  it('does not have role=button when onClick is not provided', () => {
    render(<Card>Solo contenido</Card>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
