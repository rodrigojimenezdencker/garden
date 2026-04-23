import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDb = { name: 'db' };
const collection = vi.fn();
const doc = vi.fn();
const firestoreGetDoc = vi.fn();
const firestoreGetDocs = vi.fn();
const firestoreAddDoc = vi.fn();
const firestoreUpdateDoc = vi.fn();
const firestoreDeleteDoc = vi.fn();
const onSnapshot = vi.fn();
const query = vi.fn();
const limit = vi.fn();
const startAfter = vi.fn();
const serverTimestamp = vi.fn();

class MockTimestamp {
  private readonly value: Date;

  constructor(value: Date) {
    this.value = value;
  }

  toDate() {
    return this.value;
  }
}

vi.mock('../../lib/firebase', () => ({
  db: mockDb,
}));

vi.mock('firebase/firestore', () => ({
  Timestamp: MockTimestamp,
  collection: (...args: unknown[]) => collection(...args),
  doc: (...args: unknown[]) => doc(...args),
  getDoc: (...args: unknown[]) => firestoreGetDoc(...args),
  getDocs: (...args: unknown[]) => firestoreGetDocs(...args),
  addDoc: (...args: unknown[]) => firestoreAddDoc(...args),
  updateDoc: (...args: unknown[]) => firestoreUpdateDoc(...args),
  deleteDoc: (...args: unknown[]) => firestoreDeleteDoc(...args),
  onSnapshot: (...args: unknown[]) => onSnapshot(...args),
  query: (...args: unknown[]) => query(...args),
  limit: (...args: unknown[]) => limit(...args),
  startAfter: (...args: unknown[]) => startAfter(...args),
  serverTimestamp: (...args: unknown[]) => serverTimestamp(...args),
}));

describe('firestore service', () => {
  beforeEach(() => {
    collection.mockReset();
    doc.mockReset();
    firestoreGetDoc.mockReset();
    firestoreGetDocs.mockReset();
    firestoreAddDoc.mockReset();
    firestoreUpdateDoc.mockReset();
    firestoreDeleteDoc.mockReset();
    onSnapshot.mockReset();
    query.mockReset();
    limit.mockReset();
    startAfter.mockReset();
    serverTimestamp.mockReset();

    collection.mockReturnValue({ type: 'collection-ref' });
    doc.mockReturnValue({ type: 'doc-ref' });
    query.mockReturnValue({ type: 'query-ref' });
    limit.mockImplementation((value: number) => ({ type: 'limit', value }));
    startAfter.mockImplementation((value: unknown) => ({
      type: 'startAfter',
      value,
    }));
    serverTimestamp.mockReturnValue({ type: 'server-timestamp' });
  });

  it('getDocument returns data with timestamps converted to dates', async () => {
    const createdAt = new Date('2024-01-10T00:00:00.000Z');
    const wateredAt = new Date('2024-01-11T00:00:00.000Z');

    firestoreGetDoc.mockResolvedValue({
      id: 'plant-1',
      exists: () => true,
      data: () => ({
        name: 'Tomate',
        createdAt: new MockTimestamp(createdAt),
        history: {
          wateredAt: new MockTimestamp(wateredAt),
        },
      }),
    });

    const { getDocument } = await import('../firestore');
    const result = await getDocument<{
      id: string;
      name: string;
      createdAt: Date;
      history: { wateredAt: Date };
    }>('plants', 'plant-1');

    expect(result).toEqual({
      id: 'plant-1',
      name: 'Tomate',
      createdAt,
      history: {
        wateredAt,
      },
    });
  });

  it('getDocument returns null for missing doc', async () => {
    firestoreGetDoc.mockResolvedValue({
      exists: () => false,
    });

    const { getDocument } = await import('../firestore');

    await expect(getDocument('plants', 'missing')).resolves.toBeNull();
  });

  it('addDocument calls serverTimestamp for createdAt and updatedAt', async () => {
    firestoreAddDoc.mockResolvedValue({ id: 'new-id' });

    const { addDocument } = await import('../firestore');
    const id = await addDocument<{
      id: string;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    }>('plants', { name: 'Albahaca' });

    expect(id).toBe('new-id');
    expect(serverTimestamp).toHaveBeenCalledTimes(2);
    expect(firestoreAddDoc).toHaveBeenCalledWith(
      { type: 'collection-ref' },
      expect.objectContaining({
        name: 'Albahaca',
        createdAt: { type: 'server-timestamp' },
        updatedAt: { type: 'server-timestamp' },
      }),
    );
  });

  it('subscribeToCollection returns unsubscribe function', async () => {
    const unsubscribe = vi.fn();
    const callback = vi.fn();

    onSnapshot.mockImplementation((_queryRef, snapshotCallback) => {
      snapshotCallback({
        docs: [
          {
            id: 'plant-1',
            data: () => ({
              name: 'Romero',
              createdAt: new MockTimestamp(
                new Date('2024-02-01T00:00:00.000Z'),
              ),
            }),
          },
        ],
      });

      return unsubscribe;
    });

    const { subscribeToCollection } = await import('../firestore');
    const result = subscribeToCollection('plants', [], callback);

    expect(result).toBe(unsubscribe);
    expect(callback).toHaveBeenCalledWith([
      {
        id: 'plant-1',
        name: 'Romero',
        createdAt: new Date('2024-02-01T00:00:00.000Z'),
      },
    ]);
  });

  it('deleteDocument calls the right doc ref', async () => {
    const docRef = { type: 'doc-ref', id: 'plant-1' };
    doc.mockReturnValue(docRef);

    const { deleteDocument } = await import('../firestore');
    await deleteDocument('plants', 'plant-1');

    expect(doc).toHaveBeenCalledWith(mockDb, 'plants', 'plant-1');
    expect(firestoreDeleteDoc).toHaveBeenCalledWith(docRef);
  });
});
