import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockUseAuthContext = vi.fn();

vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuthContext: () => mockUseAuthContext(),
}));

vi.mock('./services/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn(),
}));

import type React from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './pages/Login';

function createTestRouter(initialEntries: string[]) {
  return createMemoryRouter(
    [
      { path: '/login', element: <Login /> },
      {
        element: <AuthGuard />,
        children: [{ path: '/', element: <div>Dashboard</div> }],
      },
    ],
    { initialEntries },
  );
}

describe('App', () => {
  it('shows login page when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const testRouter = createTestRouter(['/login']);
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText(/Mi Jardín 🌱/)).toBeInTheDocument();
    expect(
      screen.getByText('Inicia sesión para gestionar tu jardín'),
    ).toBeInTheDocument();
  });

  it('shows dashboard when authenticated', () => {
    mockUseAuthContext.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@example.com' },
      loading: false,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const testRouter = createTestRouter(['/']);
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows loading state when auth is loading', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signInWithGoogle: vi.fn(),
      signInWithEmail: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const testRouter = createTestRouter(['/']);
    render(<RouterProvider router={testRouter} />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
