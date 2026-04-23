import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from '../Login';

const mockAuthContext = {
  user: null,
  loading: false,
  error: null as string | null,
  signInWithGoogle: vi.fn(),
  signInWithEmail: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContext,
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContext.error = null;
    mockAuthContext.loading = false;
  });

  it('renders login form with title and subtitle', () => {
    render(<Login />);

    expect(screen.getByText(/Mi Jardín 🌱/)).toBeInTheDocument();
    expect(
      screen.getByText('Inicia sesión para gestionar tu jardín'),
    ).toBeInTheDocument();
  });

  it('renders Google sign in button', () => {
    render(<Login />);

    expect(
      screen.getByRole('button', { name: /Iniciar sesión con Google/i }),
    ).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    render(<Login />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByText('Email requerido')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(screen.getByText('Contraseña requerida')).toBeInTheDocument();
  });

  it('shows validation error for short password in signup mode', async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.click(screen.getByRole('button', { name: 'Crear una' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), '12345');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      screen.getByText('La contraseña debe tener al menos 6 caracteres'),
    ).toBeInTheDocument();
  });

  it('calls signInWithEmail on valid login submit', async () => {
    const user = userEvent.setup();
    mockAuthContext.signInWithEmail.mockResolvedValue(undefined);
    render(<Login />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(mockAuthContext.signInWithEmail).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });

  it('calls signUp on valid signup submit', async () => {
    const user = userEvent.setup();
    mockAuthContext.signUp.mockResolvedValue(undefined);
    render(<Login />);

    await user.click(screen.getByRole('button', { name: 'Crear una' }));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(mockAuthContext.signUp).toHaveBeenCalledWith(
      'test@example.com',
      'password123',
    );
  });

  it('toggles between login and signup mode', async () => {
    const user = userEvent.setup();
    render(<Login />);

    expect(
      screen.getByRole('button', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Crear una' }));

    expect(
      screen.getByRole('button', { name: 'Crear cuenta' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(
      screen.getByRole('button', { name: /^Iniciar sesión$/ }),
    ).toBeInTheDocument();
  });

  it('displays auth error from context', () => {
    mockAuthContext.error = 'Firebase: Error (auth/wrong-password).';
    render(<Login />);

    expect(
      screen.getByText('Firebase: Error (auth/wrong-password).'),
    ).toBeInTheDocument();
  });

  it('calls signInWithGoogle when Google button is clicked', async () => {
    const user = userEvent.setup();
    mockAuthContext.signInWithGoogle.mockResolvedValue(undefined);
    render(<Login />);

    await user.click(
      screen.getByRole('button', { name: /Iniciar sesión con Google/i }),
    );

    expect(mockAuthContext.signInWithGoogle).toHaveBeenCalled();
  });
});
