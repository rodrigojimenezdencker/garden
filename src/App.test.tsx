import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders Mi Jardín heading', () => {
    render(<App />);
    const header = screen.getByRole('banner');
    expect(header).toHaveTextContent(/Mi Jardín/i);
  });

  it('renders Dashboard heading', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /dashboard/i }),
    ).toBeInTheDocument();
  });

  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/bienvenido a mi jardín/i)).toBeInTheDocument();
  });
});
