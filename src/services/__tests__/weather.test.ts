import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OpenMeteoForecastResponse, WeatherForecast } from '../../types';
import { WeatherCondition } from '../../types';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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

describe('weather service', () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    mockLocalStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-04-20T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockApiResponse: OpenMeteoForecastResponse = {
    latitude: -34.6,
    longitude: -58.4,
    timezone: 'America/Argentina/Buenos_Aires',
    daily: {
      time: [
        '2025-04-20',
        '2025-04-21',
        '2025-04-22',
        '2025-04-23',
        '2025-04-24',
        '2025-04-25',
        '2025-04-26',
      ],
      temperature_2m_max: [25, 22, 20, 18, 23, 26, 24],
      temperature_2m_min: [15, 14, 12, 10, 13, 16, 14],
      precipitation_sum: [0, 5, 10, 0, 0, 0, 0],
      precipitation_probability_max: [10, 70, 90, 20, 15, 5, 10],
      weathercode: [0, 61, 63, 1, 0, 0, 2],
    },
  };

  describe('parseForecastResponse', () => {
    it('parses API response into typed forecasts', async () => {
      const { parseForecastResponse } = await import('../weather');
      const forecasts = parseForecastResponse(mockApiResponse);

      expect(forecasts).toHaveLength(7);
      expect(forecasts[0]).toEqual({
        date: new Date('2025-04-20T00:00:00'),
        temperatureMax: 25,
        temperatureMin: 15,
        precipitationMm: 0,
        precipitationProbability: 10,
        humidity: 0,
        condition: WeatherCondition.Sunny,
        weatherCode: 0,
        windSpeedKmh: 0,
      });
    });

    it('maps weather codes to correct conditions', async () => {
      const { parseForecastResponse } = await import('../weather');
      const forecasts = parseForecastResponse(mockApiResponse);

      expect(forecasts[0].condition).toBe(WeatherCondition.Sunny);
      expect(forecasts[1].condition).toBe(WeatherCondition.Rainy);
      expect(forecasts[2].condition).toBe(WeatherCondition.Rainy);
      expect(forecasts[3].condition).toBe(WeatherCondition.PartlyCloudy);
      expect(forecasts[6].condition).toBe(WeatherCondition.PartlyCloudy);
    });
  });

  describe('getWeatherForecast', () => {
    it('fetches forecast from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const { getWeatherForecast } = await import('../weather');
      const forecasts = await getWeatherForecast(-34.6, -58.4);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch.mock.calls[0][0]).toContain('latitude=-34.6');
      expect(mockFetch.mock.calls[0][0]).toContain('longitude=-58.4');
      expect(forecasts).toHaveLength(7);
    });

    it('returns cached forecast within TTL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const { getWeatherForecast } = await import('../weather');
      await getWeatherForecast(-34.6, -58.4);

      vi.advanceTimersByTime(2 * 60 * 60 * 1000);

      const cached = await getWeatherForecast(-34.6, -58.4);
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(cached).toHaveLength(7);
    });

    it('refetches after cache TTL expires', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const { getWeatherForecast } = await import('../weather');
      await getWeatherForecast(-34.6, -58.4);

      vi.advanceTimersByTime(3 * 60 * 60 * 1000 + 1);

      await getWeatherForecast(-34.6, -58.4);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('refetches for different coordinates', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const { getWeatherForecast } = await import('../weather');
      await getWeatherForecast(-34.6, -58.4);
      await getWeatherForecast(40.4, -3.7);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const { getWeatherForecast } = await import('../weather');
      await expect(getWeatherForecast(-34.6, -58.4)).rejects.toThrow(
        'Error al obtener el pronóstico: 500',
      );
    });
  });

  describe('shouldSkipWatering', () => {
    it('returns true when today has high probability and precipitation', async () => {
      const { shouldSkipWatering } = await import('../weather');

      const forecasts: WeatherForecast[] = [
        {
          date: new Date('2025-04-20'),
          temperatureMax: 20,
          temperatureMin: 10,
          precipitationMm: 5,
          precipitationProbability: 80,
          humidity: 0,
          condition: WeatherCondition.Rainy,
          weatherCode: 61,
          windSpeedKmh: 0,
        },
        {
          date: new Date('2025-04-21'),
          temperatureMax: 18,
          temperatureMin: 8,
          precipitationMm: 0,
          precipitationProbability: 10,
          humidity: 0,
          condition: WeatherCondition.Sunny,
          weatherCode: 0,
          windSpeedKmh: 0,
        },
      ];

      expect(shouldSkipWatering(forecasts)).toBe(true);
    });

    it('returns true when tomorrow has high probability and precipitation', async () => {
      const { shouldSkipWatering } = await import('../weather');

      const forecasts: WeatherForecast[] = [
        {
          date: new Date('2025-04-20'),
          temperatureMax: 20,
          temperatureMin: 10,
          precipitationMm: 0,
          precipitationProbability: 10,
          humidity: 0,
          condition: WeatherCondition.Sunny,
          weatherCode: 0,
          windSpeedKmh: 0,
        },
        {
          date: new Date('2025-04-21'),
          temperatureMax: 18,
          temperatureMin: 8,
          precipitationMm: 8,
          precipitationProbability: 90,
          humidity: 0,
          condition: WeatherCondition.Rainy,
          weatherCode: 63,
          windSpeedKmh: 0,
        },
      ];

      expect(shouldSkipWatering(forecasts)).toBe(true);
    });

    it('returns false when probability is high but precipitation is low', async () => {
      const { shouldSkipWatering } = await import('../weather');

      const forecasts: WeatherForecast[] = [
        {
          date: new Date('2025-04-20'),
          temperatureMax: 20,
          temperatureMin: 10,
          precipitationMm: 1,
          precipitationProbability: 80,
          humidity: 0,
          condition: WeatherCondition.Rainy,
          weatherCode: 51,
          windSpeedKmh: 0,
        },
        {
          date: new Date('2025-04-21'),
          temperatureMax: 18,
          temperatureMin: 8,
          precipitationMm: 0.5,
          precipitationProbability: 70,
          humidity: 0,
          condition: WeatherCondition.Rainy,
          weatherCode: 51,
          windSpeedKmh: 0,
        },
      ];

      expect(shouldSkipWatering(forecasts)).toBe(false);
    });

    it('returns false when no rain expected', async () => {
      const { shouldSkipWatering } = await import('../weather');

      const forecasts: WeatherForecast[] = [
        {
          date: new Date('2025-04-20'),
          temperatureMax: 25,
          temperatureMin: 15,
          precipitationMm: 0,
          precipitationProbability: 10,
          humidity: 0,
          condition: WeatherCondition.Sunny,
          weatherCode: 0,
          windSpeedKmh: 0,
        },
        {
          date: new Date('2025-04-21'),
          temperatureMax: 26,
          temperatureMin: 16,
          precipitationMm: 0,
          precipitationProbability: 5,
          humidity: 0,
          condition: WeatherCondition.Sunny,
          weatherCode: 0,
          windSpeedKmh: 0,
        },
      ];

      expect(shouldSkipWatering(forecasts)).toBe(false);
    });
  });

  describe('searchCities', () => {
    it('returns cities from geocoding API', async () => {
      const mockResults = {
        results: [
          {
            id: 3435910,
            name: 'Buenos Aires',
            latitude: -34.6,
            longitude: -58.4,
            country: 'Argentina',
            admin1: 'Buenos Aires',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults),
      });

      const { searchCities } = await import('../weather');
      const cities = await searchCities('Buenos');

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch.mock.calls[0][0]).toContain('name=Buenos');
      expect(mockFetch.mock.calls[0][0]).toContain('language=es');
      expect(cities).toHaveLength(1);
      expect(cities[0].name).toBe('Buenos Aires');
    });

    it('returns empty array for empty query', async () => {
      const { searchCities } = await import('../weather');
      const cities = await searchCities('');

      expect(mockFetch).not.toHaveBeenCalled();
      expect(cities).toEqual([]);
    });

    it('returns empty array when API returns no results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { searchCities } = await import('../weather');
      const cities = await searchCities('xyznonexistent');

      expect(cities).toEqual([]);
    });
  });

  describe('weatherCodeToEmoji', () => {
    it('returns correct emojis for weather codes', async () => {
      const { weatherCodeToEmoji } = await import('../weather');

      expect(weatherCodeToEmoji(0)).toBe('☀️');
      expect(weatherCodeToEmoji(2)).toBe('⛅');
      expect(weatherCodeToEmoji(45)).toBe('🌫️');
      expect(weatherCodeToEmoji(53)).toBe('🌦️');
      expect(weatherCodeToEmoji(63)).toBe('🌧️');
      expect(weatherCodeToEmoji(73)).toBe('❄️');
      expect(weatherCodeToEmoji(81)).toBe('🌧️');
      expect(weatherCodeToEmoji(95)).toBe('⛈️');
    });
  });
});
