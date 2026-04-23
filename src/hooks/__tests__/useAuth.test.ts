import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../useAuth';

const mockOnAuthStateChanged = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithEmail = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock('../../services/auth', () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  signInWithEmail: (...args: unknown[]) => mockSignInWithEmail(...args),
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

const mockUser = { uid: 'test-uid', email: 'test@example.com' };

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(vi.fn());
  });

  it('starts with loading true and user null', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets user and loading false when auth state resolves', () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(mockUser);
        return vi.fn();
      },
    );

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('sets user to null when signed out', () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('cleans up subscription on unmount', () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('calls signInWithGoogle and handles success', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );
    mockSignInWithGoogle.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInWithGoogle).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('sets error on signInWithGoogle failure', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );
    mockSignInWithGoogle.mockRejectedValue(new Error('Google auth failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBe('Google auth failed');
  });

  it('clears error on new auth attempt', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );
    mockSignInWithGoogle.mockRejectedValueOnce(new Error('fail'));
    mockSignInWithGoogle.mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(result.current.error).toBe('fail');

    await act(async () => {
      await result.current.signInWithGoogle();
    });
    expect(result.current.error).toBeNull();
  });

  it('calls signInWithEmail with credentials', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );
    mockSignInWithEmail.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithEmail('test@example.com', 'password');
    });

    expect(mockSignInWithEmail).toHaveBeenCalledWith(
      'test@example.com',
      'password',
    );
  });

  it('calls signUp with credentials', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(null);
        return vi.fn();
      },
    );
    mockSignUp.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp('test@example.com', 'password');
    });

    expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('calls signOut', async () => {
    mockOnAuthStateChanged.mockImplementation(
      (callback: (user: unknown) => void) => {
        callback(mockUser);
        return vi.fn();
      },
    );
    mockSignOut.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
  });
});
