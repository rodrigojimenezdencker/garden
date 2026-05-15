import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = { currentUser: { uid: 'existing-user' } };
const signInWithRedirect = vi.fn();
const signInWithEmailAndPassword = vi.fn();
const createUserWithEmailAndPassword = vi.fn();
const firebaseSignOut = vi.fn();
const firebaseOnAuthStateChanged = vi.fn();
const googleAuthProviderConstructor = vi.fn();

class MockGoogleAuthProvider {
  constructor() {
    googleAuthProviderConstructor();
  }
}

vi.mock('../../lib/firebase', () => ({
  auth: mockAuth,
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: MockGoogleAuthProvider,
  signInWithRedirect: (...args: unknown[]) => signInWithRedirect(...args),
  signInWithEmailAndPassword: (...args: unknown[]) =>
    signInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    createUserWithEmailAndPassword(...args),
  signOut: (...args: unknown[]) => firebaseSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) =>
    firebaseOnAuthStateChanged(...args),
}));

describe('auth service', () => {
  beforeEach(() => {
    signInWithRedirect.mockReset();
    signInWithEmailAndPassword.mockReset();
    createUserWithEmailAndPassword.mockReset();
    firebaseSignOut.mockReset();
    firebaseOnAuthStateChanged.mockReset();
    googleAuthProviderConstructor.mockReset();
  });

  it('signInWithGoogle calls signInWithRedirect with GoogleAuthProvider', async () => {
    const { signInWithGoogle } = await import('../auth');
    await signInWithGoogle();

    expect(googleAuthProviderConstructor).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect).toHaveBeenCalledTimes(1);
    expect(signInWithRedirect.mock.calls[0]?.[0]).toBe(mockAuth);
    expect(signInWithRedirect.mock.calls[0]?.[1]).toBeInstanceOf(
      MockGoogleAuthProvider,
    );
  });

  it('signInWithEmail calls signInWithEmailAndPassword', async () => {
    const user = { uid: 'email-user' };
    signInWithEmailAndPassword.mockResolvedValue({ user });

    const { signInWithEmail } = await import('../auth');
    const result = await signInWithEmail('test@example.com', 'secret');

    expect(result).toBe(user);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'test@example.com',
      'secret',
    );
  });

  it('signOut calls firebaseSignOut', async () => {
    firebaseSignOut.mockResolvedValue(undefined);

    const { signOut } = await import('../auth');
    await signOut();

    expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth);
  });

  it('onAuthStateChanged returns unsubscribe', async () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    firebaseOnAuthStateChanged.mockReturnValue(unsubscribe);

    const { onAuthStateChanged } = await import('../auth');
    const result = onAuthStateChanged(callback);

    expect(result).toBe(unsubscribe);
    expect(firebaseOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback);
  });
});
