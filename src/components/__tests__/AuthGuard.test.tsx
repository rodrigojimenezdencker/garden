import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthGuard } from '../AuthGuard';

const mockUseAuthContext = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<AuthGuard />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthGuard', () => {
  it('shows loading spinner when loading', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      loading: true,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      loading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false,
      error: null,
    });

    renderWithRouter();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
