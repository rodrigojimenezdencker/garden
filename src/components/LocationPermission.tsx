import { useCallback, useEffect, useRef, useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import type { GeocodingResult } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface LocationPermissionProps {
  onClose: () => void;
}

export function LocationPermission({ onClose }: LocationPermissionProps) {
  const { requestLocation, searchCities, setLocationFromCity } = useWeather();
  const [mode, setMode] = useState<'prompt' | 'search'>('prompt');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleRequestLocation = async () => {
    setRequesting(true);
    setError(null);
    try {
      await requestLocation();
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al obtener ubicación',
      );
    } finally {
      setRequesting(false);
    }
  };

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (value.trim().length < 2) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const cities = await searchCities(value);
          setResults(cities);
        } catch {
          setResults([]);
        } finally {
          setSearching(false);
        }
      }, 300);
    },
    [searchCities],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelectCity = (city: GeocodingResult) => {
    setLocationFromCity(city);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="w-full max-w-md rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          📍 Ubicación
        </h2>

        {mode === 'prompt' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Para darte el pronóstico de tu zona, necesitamos tu ubicación.
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleRequestLocation}
              loading={requesting}
              className="w-full"
            >
              Permitir ubicación
            </Button>

            <Button
              variant="secondary"
              onClick={() => setMode('search')}
              className="w-full"
            >
              Buscar ciudad
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}

        {mode === 'search' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Buscar ciudad"
              placeholder="Ej: Buenos Aires"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />

            {searching && <p className="text-sm text-gray-500">Buscando...</p>}

            {results.length > 0 && (
              <ul className="flex flex-col gap-1">
                {results.map((city) => (
                  <li key={city.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-garden-50"
                    >
                      <span className="font-medium">{city.name}</span>
                      <span className="text-gray-500">
                        {city.admin1 ? `, ${city.admin1}` : ''}, {city.country}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!searching && query.length >= 2 && results.length === 0 && (
              <p className="text-sm text-gray-500">
                No se encontraron resultados
              </p>
            )}

            <button
              type="button"
              onClick={() => setMode('prompt')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
