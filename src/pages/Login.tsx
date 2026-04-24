import { type FormEvent, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

type Mode = 'login' | 'signup';

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email requerido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
  return undefined;
}

function validatePassword(password: string, mode: Mode): string | undefined {
  if (!password) return 'Contraseña requerida';
  if (mode === 'signup' && password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  return undefined;
}

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUp, error } = useAuthContext();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [activeAction, setActiveAction] = useState<'google' | 'email' | null>(
    null,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, mode);

    if (emailError || passwordError) {
      setFormErrors({ email: emailError, password: passwordError });
      return;
    }

    setFormErrors({});
    setActiveAction('email');
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUp(email, password);
      }
    } finally {
      setActiveAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setActiveAction('google');
    try {
      await signInWithGoogle();
    } finally {
      setActiveAction(null);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormErrors({});
  };

  const isSubmitting = activeAction !== null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-garden-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-garden-700">Mi Jardín 🌱</h1>
          <p className="mt-2 text-garden-600">
            Inicia sesión para gestionar tu jardín
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          {activeAction === 'google' ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-garden-500" />
          ) : (
            <span aria-hidden="true">🔵</span>
          )}
          Iniciar sesión con Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">o</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-garden-500 focus:outline-none focus:ring-1 focus:ring-garden-500 disabled:opacity-50"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-garden-500 focus:outline-none focus:ring-1 focus:ring-garden-500 disabled:opacity-50"
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-garden-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-garden-600 disabled:opacity-50"
          >
            {activeAction === 'email' ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : mode === 'login' ? (
              'Iniciar sesión'
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-garden-600 hover:text-garden-700"
              >
                Crear una
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-medium text-garden-600 hover:text-garden-700"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
