import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  shouldSkipWatering as checkShouldSkipWatering,
  getWeatherForecast,
  searchCities as searchCitiesService,
} from '../services/weather';
import type {
  GeocodingResult,
  UserCoordinates,
  WeatherForecast,
} from '../types';

const COORDINATES_KEY = 'garden-app:user-coordinates';

function getSavedCoordinates(): UserCoordinates | null {
  try {
    const raw = localStorage.getItem(COORDINATES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserCoordinates;
  } catch {
    return null;
  }
}

function saveCoordinates(coords: UserCoordinates): void {
  localStorage.setItem(COORDINATES_KEY, JSON.stringify(coords));
}

interface UseWeatherReturn {
  forecast: WeatherForecast[] | null;
  shouldSkipWatering: boolean;
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  requestLocation: () => Promise<void>;
  searchCities: (query: string) => Promise<GeocodingResult[]>;
  setLocationFromCity: (city: GeocodingResult) => void;
}

export function useWeather(): UseWeatherReturn {
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<UserCoordinates | null>(
    getSavedCoordinates,
  );

  const hasLocation = coordinates !== null;

  useEffect(() => {
    if (!coordinates) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getWeatherForecast(coordinates.latitude, coordinates.longitude)
      .then((data) => {
        if (!cancelled) {
          setForecast(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al obtener el pronóstico',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [coordinates]);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: UserCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          saveCoordinates(coords);
          setCoordinates(coords);
          resolve();
        },
        (geoError) => {
          const message =
            geoError.code === geoError.PERMISSION_DENIED
              ? 'Permiso de ubicación denegado'
              : 'No se pudo obtener tu ubicación';
          setError(message);
          reject(new Error(message));
        },
      );
    });
  }, []);

  const searchCities = useCallback(
    async (query: string): Promise<GeocodingResult[]> => {
      return searchCitiesService(query);
    },
    [],
  );

  const setLocationFromCity = useCallback((city: GeocodingResult) => {
    const coords: UserCoordinates = {
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.name,
    };
    saveCoordinates(coords);
    setCoordinates(coords);
  }, []);

  const skipWatering = useMemo(
    () => (forecast ? checkShouldSkipWatering(forecast) : false),
    [forecast],
  );

  return useMemo(
    () => ({
      forecast,
      shouldSkipWatering: skipWatering,
      loading,
      error,
      hasLocation,
      requestLocation,
      searchCities,
      setLocationFromCity,
    }),
    [
      forecast,
      skipWatering,
      loading,
      error,
      hasLocation,
      requestLocation,
      searchCities,
      setLocationFromCity,
    ],
  );
}
