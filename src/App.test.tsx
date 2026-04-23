import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders Hello Garden', () => {
    render(<App />);
    expect(screen.getByText(/Hello Garden/i)).toBeInTheDocument();
  });
});
