import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlantDetails, searchPlants } from '../trefle';
import type { TreflePlantDetails, TreflePlantSearchResult } from '../trefle';

const MOCK_SEARCH_RESULT: TreflePlantSearchResult = {
  data: [
    {
      id: 1,
      common_name: 'Lavender',
      scientific_name: 'Lavandula angustifolia',
      image_url: 'https://example.com/lavender.jpg',
      family_common_name: 'Mint family',
      slug: 'lavandula-angustifolia',
    },
  ],
  meta: { total: 1 },
};

const MOCK_DETAILS_RESULT: TreflePlantDetails = {
  data: {
    id: 1,
    common_name: 'Lavender',
    scientific_name: 'Lavandula angustifolia',
    image_url: 'https://example.com/lavender.jpg',
    family_common_name: 'Mint family',
    main_species: {
      growth: {
        light: 9,
        atmospheric_humidity: 4,
        soil_humidity: 3,
        soil_nutriments: 2,
        ph_minimum: 6.0,
        ph_maximum: 8.0,
        minimum_temperature: { deg_c: -15 },
        maximum_temperature: { deg_c: 40 },
      },
    },
  },
};

describe('trefle service', () => {
  const fetchMock = vi.fn();
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let indexedDbStore = new Map<string, unknown>();

  function createRequest<T>(
    executor: () => T,
    shouldFail = false,
  ): IDBRequest<T> {
    const request = {
      result: undefined,
      error: shouldFail ? new Error('IndexedDB error') : null,
      onsuccess: null,
      onerror: null,
    } as unknown as IDBRequest<T>;

    queueMicrotask(() => {
      if (shouldFail) {
        request.onerror?.call(request, new Event('error'));
        return;
      }

      (request as unknown as Record<string, unknown>).result = executor();
      request.onsuccess?.call(request, new Event('success'));
    });

    return request;
  }

  function createTransaction(mode: IDBTransactionMode): IDBTransaction {
    const transaction = {
      error: null,
      oncomplete: null,
      onerror: null,
      onabort: null,
      objectStore: () => ({
        get: (key: string) => createRequest(() => indexedDbStore.get(key)),
        put: (value: unknown, key: string) => {
          indexedDbStore.set(key, value);
          return createRequest(() => undefined);
        },
        delete: (key: string) => {
          indexedDbStore.delete(key);
          return createRequest(() => undefined);
        },
      }),
    } as unknown as IDBTransaction;

    queueMicrotask(() => {
      if (mode !== 'readonly') {
        transaction.oncomplete?.call(transaction, new Event('complete'));
      }
    });

    return transaction;
  }

  function createDatabase(): IDBDatabase {
    return {
      objectStoreNames: {
        contains: () => true,
      },
      createObjectStore: () => ({}) as IDBObjectStore,
      transaction: (_storeName: string, mode: IDBTransactionMode) =>
        createTransaction(mode),
    } as unknown as IDBDatabase;
  }

  function createOpenRequest(): IDBOpenDBRequest {
    const database = createDatabase();
    const request = {
      result: database,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      onblocked: null,
    } as unknown as IDBOpenDBRequest;

    queueMicrotask(() => {
      request.onupgradeneeded?.call(
        request,
        new Event('upgradeneeded') as unknown as IDBVersionChangeEvent,
      );
      request.onsuccess?.call(request, new Event('success'));
    });

    return request;
  }

  beforeEach(() => {
    vi.resetModules();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);
    indexedDbStore = new Map();
    vi.stubGlobal('indexedDB', {
      open: vi.fn(() => createOpenRequest()),
    });
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchPlants', () => {
    it('fetches search results from API', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_SEARCH_RESULT),
      });

      const result = await searchPlants('lavender');

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0][0]).toContain('/plants/search?q=lavender');
      expect(result).toEqual(MOCK_SEARCH_RESULT);
    });

    it('returns cached result on second call', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_SEARCH_RESULT),
      });

      await searchPlants('lavender');
      const result = await searchPlants('lavender');

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(result).toEqual(MOCK_SEARCH_RESULT);
    });

    it('fetches again after cache expires', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(MOCK_SEARCH_RESULT),
      });

      await searchPlants('lavender');

      indexedDbStore.set('search-lavender', {
        data: MOCK_SEARCH_RESULT,
        timestamp: Date.now() - 25 * 60 * 60 * 1000,
      });

      const result = await searchPlants('lavender');

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result).toEqual(MOCK_SEARCH_RESULT);
    });

    it('returns null when API returns error status', async () => {
      fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await searchPlants('lavender');

      expect(result).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      const result = await searchPlants('lavender');

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo buscar plantas en Trefle',
        expect.any(Error),
      );
    });

    it('fetches without cache when IndexedDB is unavailable', async () => {
      vi.stubGlobal('indexedDB', undefined);
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_SEARCH_RESULT),
      });

      const result = await searchPlants('lavender');

      expect(result).toEqual(MOCK_SEARCH_RESULT);
      expect(fetchMock).toHaveBeenCalledOnce();
    });
  });

  describe('getPlantDetails', () => {
    it('fetches plant details from API', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_DETAILS_RESULT),
      });

      const result = await getPlantDetails(1);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(fetchMock.mock.calls[0][0]).toContain('/plants/1?token=');
      expect(result).toEqual(MOCK_DETAILS_RESULT);
    });

    it('returns cached result on second call', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(MOCK_DETAILS_RESULT),
      });

      await getPlantDetails(1);
      const result = await getPlantDetails(1);

      expect(fetchMock).toHaveBeenCalledOnce();
      expect(result).toEqual(MOCK_DETAILS_RESULT);
    });

    it('returns null when API is down', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await getPlantDetails(1);

      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudieron obtener los detalles de la planta en Trefle',
        expect.any(Error),
      );
    });
  });
});
