import { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { weatherCodeToEmoji } from '../services/weather';
import { LocationPermission } from './LocationPermission';
import { Card } from './ui/Card';

export function WeatherWidget() {
  const { forecast, shouldSkipWatering, loading, error, hasLocation } =
    useWeather();
  const [showLocationModal, setShowLocationModal] = useState(false);

  if (!hasLocation) {
    return (
      <>
        <Card className="p-4">
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="flex w-full items-center gap-2 text-sm text-garden-600 hover:text-garden-700"
          >
            <span>📍</span>
            <span>Configura tu ubicación para ver el pronóstico</span>
          </button>
        </Card>
        {showLocationModal && (
          <LocationPermission onClose={() => setShowLocationModal(false)} />
        )}
      </>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="animate-pulse">🌤️</span>
          <span>Cargando pronóstico...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  if (!forecast || forecast.length === 0) return null;

  const today = forecast[0];
  const tomorrow = forecast[1] ?? null;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {weatherCodeToEmoji(today.weatherCode)}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {Math.round(today.temperatureMax)}° /{' '}
                {Math.round(today.temperatureMin)}°
              </p>
              <p className="text-xs text-gray-500">Hoy</p>
            </div>
          </div>

          {tomorrow && (
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {weatherCodeToEmoji(tomorrow.weatherCode)}
              </span>
              <div>
                <p className="text-sm text-gray-700">
                  {Math.round(tomorrow.temperatureMax)}° /{' '}
                  {Math.round(tomorrow.temperatureMin)}°
                </p>
                <p className="text-xs text-gray-500">Mañana</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>💧</span>
          <span>
            Prob. lluvia: {today.precipitationProbability}% hoy
            {tomorrow && `, ${tomorrow.precipitationProbability}% mañana`}
          </span>
        </div>

        {shouldSkipWatering ? (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            🌧️ Se espera lluvia — puedes saltar el riego
          </p>
        ) : (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
            ☀️ Sin lluvia prevista — riega según lo programado
          </p>
        )}
      </div>
    </Card>
  );
}
