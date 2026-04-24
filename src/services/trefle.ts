const TREFLE_BASE = 'https://trefle.io/api/v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_DB_NAME = 'garden-app-trefle-cache';
const CACHE_STORE_NAME = 'cache';

export interface TreflePlantSummary {
  id: number;
  common_name: string | null;
  scientific_name: string;
  image_url: string | null;
  family_common_name: string | null;
  slug: string;
}

export interface TreflePlantSearchResult {
  data: TreflePlantSummary[];
  meta: { total: number };
}

export interface TreflePlantGrowth {
  light: number | null;
  atmospheric_humidity: number | null;
  soil_humidity: number | null;
  soil_nutriments: number | null;
  ph_minimum: number | null;
  ph_maximum: number | null;
  minimum_temperature: { deg_c: number | null } | null;
  maximum_temperature: { deg_c: number | null } | null;
}

export interface TreflePlantDetails {
  data: {
    id: number;
    common_name: string | null;
    scientific_name: string;
    image_url: string | null;
    family_common_name: string | null;
    main_species: {
      growth: TreflePlantGrowth;
    } | null;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let cacheDbPromise: Promise<IDBDatabase | null> | null = null;

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error('Error de IndexedDB'));
    };
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      reject(
        transaction.error ?? new Error('Error de transacción en IndexedDB'),
      );
    };

    transaction.onabort = () => {
      reject(
        transaction.error ?? new Error('Transacción abortada en IndexedDB'),
      );
    };
  });
}

function openCacheDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  if (cacheDbPromise) {
    return cacheDbPromise;
  }

  cacheDbPromise = new Promise((resolve) => {
    const request = indexedDB.open(CACHE_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CACHE_STORE_NAME)) {
        database.createObjectStore(CACHE_STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('No se pudo abrir la caché de Trefle', request.error);
      cacheDbPromise = null;
      resolve(null);
    };

    request.onblocked = () => {
      console.warn('La caché de Trefle quedó bloqueada; se omite el caché');
      cacheDbPromise = null;
      resolve(null);
    };
  });

  return cacheDbPromise;
}

async function deleteCached(key: string): Promise<void> {
  const database = await openCacheDb();
  if (!database) {
    return;
  }

  try {
    const transaction = database.transaction(CACHE_STORE_NAME, 'readwrite');
    transaction.objectStore(CACHE_STORE_NAME).delete(key);
    await transactionToPromise(transaction);
  } catch (error: unknown) {
    console.warn('No se pudo limpiar la caché de Trefle', error);
  }
}

async function getCached<T>(key: string): Promise<T | null> {
  const database = await openCacheDb();
  if (!database) {
    return null;
  }

  try {
    const transaction = database.transaction(CACHE_STORE_NAME, 'readonly');
    const request = transaction
      .objectStore(CACHE_STORE_NAME)
      .get(key) as IDBRequest<CacheEntry<T> | undefined>;
    const entry = await requestToPromise(request);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      await deleteCached(key);
      return null;
    }

    return entry.data;
  } catch (error: unknown) {
    console.warn('No se pudo leer la caché de Trefle', error);
    return null;
  }
}

async function setCache<T>(key: string, data: T): Promise<void> {
  const database = await openCacheDb();
  if (!database) {
    return;
  }

  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    const transaction = database.transaction(CACHE_STORE_NAME, 'readwrite');
    transaction.objectStore(CACHE_STORE_NAME).put(entry, key);
    await transactionToPromise(transaction);
  } catch (error: unknown) {
    console.warn('No se pudo guardar la caché de Trefle', error);
  }
}

function getToken(): string {
  return import.meta.env.VITE_TREFLE_TOKEN ?? '';
}

export async function searchPlants(
  query: string,
): Promise<TreflePlantSearchResult | null> {
  const cacheKey = `search-${query}`;
  const cached = await getCached<TreflePlantSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${TREFLE_BASE}/plants/search?q=${encodeURIComponent(query)}&token=${getToken()}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data: TreflePlantSearchResult = await response.json();
    await setCache(cacheKey, data);
    return data;
  } catch (error: unknown) {
    console.warn('No se pudo buscar plantas en Trefle', error);
    return null;
  }
}

export async function getPlantDetails(
  trefleId: number,
): Promise<TreflePlantDetails | null> {
  const cacheKey = `details-${trefleId}`;
  const cached = await getCached<TreflePlantDetails>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${TREFLE_BASE}/plants/${trefleId}?token=${getToken()}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data: TreflePlantDetails = await response.json();
    await setCache(cacheKey, data);
    return data;
  } catch (error: unknown) {
    console.warn(
      'No se pudieron obtener los detalles de la planta en Trefle',
      error,
    );
    return null;
  }
}
