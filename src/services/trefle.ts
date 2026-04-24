const TREFLE_BASE = 'https://trefle.io/api/v1';
const CACHE_PREFIX = 'trefle-cache-';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* localStorage quota exceeded or unavailable — safe to ignore */
  }
}

function getToken(): string {
  return import.meta.env.VITE_TREFLE_TOKEN ?? '';
}

export async function searchPlants(
  query: string,
): Promise<TreflePlantSearchResult | null> {
  const cacheKey = `search-${query}`;
  const cached = getCached<TreflePlantSearchResult>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${TREFLE_BASE}/plants/search?q=${encodeURIComponent(query)}&token=${getToken()}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data: TreflePlantSearchResult = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}

export async function getPlantDetails(
  trefleId: number,
): Promise<TreflePlantDetails | null> {
  const cacheKey = `details-${trefleId}`;
  const cached = getCached<TreflePlantDetails>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${TREFLE_BASE}/plants/${trefleId}?token=${getToken()}`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const data: TreflePlantDetails = await response.json();
    setCache(cacheKey, data);
    return data;
  } catch {
    return null;
  }
}
