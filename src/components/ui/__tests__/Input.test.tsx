import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../Input';

describe('Input', () => {
  it('renders without a label', () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText('Escribe aquí')).toBeInTheDocument();
  });

  it('renders label associated with input', () => {
    render(<Input label="Nombre de planta" />);
    expect(screen.getByLabelText('Nombre de planta')).toBeInTheDocument();
  });

  it('shows error message and marks input invalid', () => {
    render(<Input label="Email" error="El email no es válido" />);
    expect(screen.getByText('El email no es válido')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('shows helper text when no error', () => {
    render(<Input label="Nombre" helperText="Mínimo 3 caracteres" />);
    expect(screen.getByText('Mínimo 3 caracteres')).toBeInTheDocument();
  });

  it('shows error over helper text when both provided', () => {
    render(
      <Input
        label="Campo"
        error="Error en el campo"
        helperText="Texto de ayuda"
      />,
    );
    expect(screen.getByText('Error en el campo')).toBeInTheDocument();
    expect(screen.queryByText('Texto de ayuda')).not.toBeInTheDocument();
  });
});
