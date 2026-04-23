import { beforeEach, describe, expect, it, vi } from 'vitest';

const initializeApp = vi.fn();
const getAuth = vi.fn();
const initializeFirestore = vi.fn();
const persistentLocalCache = vi.fn();
const persistentMultipleTabManager = vi.fn();
const getFirestore = vi.fn();
const getStorage = vi.fn();

vi.mock('firebase/app', () => ({
  initializeApp: (...args: unknown[]) => initializeApp(...args),
}));

vi.mock('firebase/auth', () => ({
  getAuth: (...args: unknown[]) => getAuth(...args),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: (...args: unknown[]) => getFirestore(...args),
  initializeFirestore: (...args: unknown[]) => initializeFirestore(...args),
  persistentLocalCache: (...args: unknown[]) => persistentLocalCache(...args),
  persistentMultipleTabManager: (...args: unknown[]) =>
    persistentMultipleTabManager(...args),
}));

vi.mock('firebase/storage', () => ({
  getStorage: (...args: unknown[]) => getStorage(...args),
}));

describe('firebase initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    initializeApp.mockReset();
    getAuth.mockReset();
    initializeFirestore.mockReset();
    persistentLocalCache.mockReset();
    persistentMultipleTabManager.mockReset();
    getFirestore.mockReset();
    getStorage.mockReset();

    initializeApp.mockReturnValue({});
    getAuth.mockReturnValue({});
    persistentMultipleTabManager.mockReturnValue({});
    persistentLocalCache.mockReturnValue({});
    initializeFirestore.mockReturnValue({});
    getFirestore.mockReturnValue({});
    getStorage.mockReturnValue({});

    vi.stubEnv('VITE_FIREBASE_API_KEY', 'api-key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'project.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'project-id');
    vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'project.appspot.com');
    vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789:web:abc123');
  });

  it('initializes firebase services with env config', async () => {
    const firebase = await import('../firebase');

    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: 'api-key',
      authDomain: 'project.firebaseapp.com',
      projectId: 'project-id',
      storageBucket: 'project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abc123',
    });
    expect(persistentMultipleTabManager).toHaveBeenCalledTimes(1);
    expect(persistentLocalCache).toHaveBeenCalledWith({
      tabManager: {},
    });
    expect(initializeFirestore).toHaveBeenCalledWith(
      {},
      {
        localCache: {},
      },
    );
    expect(getAuth).toHaveBeenCalledWith({});
    expect(getFirestore).toHaveBeenCalledWith({});
    expect(getStorage).toHaveBeenCalledWith({});
    expect(firebase.auth).toBeDefined();
    expect(firebase.db).toBeDefined();
    expect(firebase.storage).toBeDefined();
  });
});
