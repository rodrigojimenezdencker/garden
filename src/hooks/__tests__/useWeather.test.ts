import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetWeatherForecast = vi.fn();
const mockShouldSkipWatering = vi.fn();
const mockSearchCities = vi.fn();

vi.mock('../../services/weather', () => ({
  getWeatherForecast: (...args: unknown[]) => mockGetWeatherForecast(...args),
  shouldSkipWatering: (...args: unknown[]) => mockShouldSkipWatering(...args),
  searchCities: (...args: unknown[]) => mockSearchCities(...args),
  weatherCodeToEmoji: () => '☀️',
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });

const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

const mockForecasts = [
  {
    date: new Date('2025-04-20'),
    temperatureMax: 25,
    temperatureMin: 15,
    precipitationMm: 0,
    precipitationProbability: 10,
    humidity: 0,
    condition: 'sunny',
    weatherCode: 0,
    windSpeedKmh: 0,
  },
];

describe('useWeather', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetWeatherForecast.mockReset();
    mockShouldSkipWatering.mockReset();
    mockSearchCities.mockReset();
    mockGeolocation.getCurrentPosition.mockReset();
    mockLocalStorage.clear();
    mockShouldSkipWatering.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with no location and no forecast', async () => {
    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    expect(result.current.hasLocation).toBe(false);
    expect(result.current.forecast).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads forecast when coordinates exist in localStorage', async () => {
    mockLocalStorage.setItem(
      'garden-app:user-coordinates',
      JSON.stringify({ latitude: -34.6, longitude: -58.4 }),
    );
    mockGetWeatherForecast.mockResolvedValue(mockForecasts);

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    expect(result.current.hasLocation).toBe(true);
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.forecast).toEqual(mockForecasts);
    expect(mockGetWeatherForecast).toHaveBeenCalledWith(-34.6, -58.4);
  });

  it('requestLocation saves coordinates and fetches forecast', async () => {
    mockGetWeatherForecast.mockResolvedValue(mockForecasts);
    mockGeolocation.getCurrentPosition.mockImplementation(
      (success: PositionCallback) => {
        success({
          coords: { latitude: -34.6, longitude: -58.4 },
        } as GeolocationPosition);
      },
    );

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.requestLocation();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'garden-app:user-coordinates',
      expect.stringContaining('-34.6'),
    );

    await waitFor(() => {
      expect(result.current.forecast).toEqual(mockForecasts);
    });
  });

  it('sets error when geolocation permission is denied', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation(
      (_success: PositionCallback, error: PositionErrorCallback) => {
        error({
          code: 1,
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
          message: 'denied',
        });
      },
    );

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.requestLocation().catch(() => {});
    });

    expect(result.current.error).toBe('Permiso de ubicación denegado');
  });

  it('sets error when forecast fetch fails', async () => {
    mockLocalStorage.setItem(
      'garden-app:user-coordinates',
      JSON.stringify({ latitude: -34.6, longitude: -58.4 }),
    );
    mockGetWeatherForecast.mockRejectedValue(
      new Error('Error al obtener el pronóstico: 500'),
    );

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.error).toBe('Error al obtener el pronóstico: 500');
    });
  });

  it('shouldSkipWatering reflects forecast analysis', async () => {
    mockLocalStorage.setItem(
      'garden-app:user-coordinates',
      JSON.stringify({ latitude: -34.6, longitude: -58.4 }),
    );
    mockGetWeatherForecast.mockResolvedValue(mockForecasts);
    mockShouldSkipWatering.mockReturnValue(true);

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    await waitFor(() => {
      expect(result.current.shouldSkipWatering).toBe(true);
    });
  });

  it('setLocationFromCity saves city and triggers forecast', async () => {
    mockGetWeatherForecast.mockResolvedValue(mockForecasts);

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    act(() => {
      result.current.setLocationFromCity({
        id: 1,
        name: 'Buenos Aires',
        latitude: -34.6,
        longitude: -58.4,
        country: 'Argentina',
      });
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'garden-app:user-coordinates',
      expect.stringContaining('Buenos Aires'),
    );

    await waitFor(() => {
      expect(result.current.forecast).toEqual(mockForecasts);
    });
  });

  it('searchCities delegates to service', async () => {
    const mockCities = [
      {
        id: 1,
        name: 'Córdoba',
        latitude: -31.4,
        longitude: -64.2,
        country: 'Argentina',
      },
    ];
    mockSearchCities.mockResolvedValue(mockCities);

    const { useWeather } = await import('../useWeather');
    const { result } = renderHook(() => useWeather());

    let cities: unknown;
    await act(async () => {
      cities = await result.current.searchCities('Córdoba');
    });

    expect(cities).toEqual(mockCities);
    expect(mockSearchCities).toHaveBeenCalledWith('Córdoba');
  });
});
