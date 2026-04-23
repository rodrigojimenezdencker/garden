import type { User } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import * as authService from '../services/auth';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await authService.signInWithGoogle();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al iniciar sesión con Google',
      );
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await authService.signInWithEmail(email, password);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al iniciar sesión',
        );
      }
    },
    [],
  );

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await authService.signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta');
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUp,
    signOut,
  };
}
