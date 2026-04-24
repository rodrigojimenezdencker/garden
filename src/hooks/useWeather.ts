import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { getDocument, updateDocument } from '../services/firestore';
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

interface StoredWeatherProfile {
  locationLat: number | null;
  locationLng: number | null;
  weatherCityName?: string | null;
}

function getSavedCoordinates(): UserCoordinates | null {
  try {
    const raw = localStorage.getItem(COORDINATES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserCoordinates;
  } catch (_error: unknown) {
    // Invalid local cache should not block weather loading; we'll fall back to a fresh lookup.
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
  const { user } = useAuthContext();
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<UserCoordinates | null>(
    getSavedCoordinates,
  );

  const hasLocation = coordinates !== null;

  useEffect(() => {
    if (coordinates || !user?.uid) {
      return;
    }

    let cancelled = false;

    getDocument<StoredWeatherProfile>('users', user.uid)
      .then((profile) => {
        if (cancelled || !profile) {
          return;
        }

        if (
          typeof profile.locationLat !== 'number' ||
          typeof profile.locationLng !== 'number'
        ) {
          return;
        }

        const nextCoordinates: UserCoordinates = {
          latitude: profile.locationLat,
          longitude: profile.locationLng,
          cityName: profile.weatherCityName ?? undefined,
        };

        saveCoordinates(nextCoordinates);
        setCoordinates(nextCoordinates);
      })
      .catch((fetchError: unknown) => {
        console.warn(
          'No se pudieron recuperar las coordenadas desde Firestore',
          fetchError,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [coordinates, user?.uid]);

  const persistCoordinates = useCallback(
    async (coords: UserCoordinates) => {
      saveCoordinates(coords);

      if (!user?.uid) {
        return;
      }

      try {
        await updateDocument<StoredWeatherProfile>('users', user.uid, {
          locationLat: coords.latitude,
          locationLng: coords.longitude,
          weatherCityName: coords.cityName ?? null,
        });
      } catch (saveError: unknown) {
        console.warn(
          'No se pudieron guardar las coordenadas en Firestore',
          saveError,
        );
      }
    },
    [user?.uid],
  );

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
          void persistCoordinates(coords);
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
  }, [persistCoordinates]);

  const searchCities = useCallback(
    async (query: string): Promise<GeocodingResult[]> => {
      return searchCitiesService(query);
    },
    [],
  );

  const setLocationFromCity = useCallback(
    (city: GeocodingResult) => {
      const coords: UserCoordinates = {
        latitude: city.latitude,
        longitude: city.longitude,
        cityName: city.name,
      };
      void persistCoordinates(coords);
      setCoordinates(coords);
    },
    [persistCoordinates],
  );

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
