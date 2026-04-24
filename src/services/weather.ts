import {
  type CachedForecast,
  type GeocodingResponse,
  type GeocodingResult,
  type OpenMeteoForecastResponse,
  WeatherCondition,
  type WeatherForecast,
} from '../types';

const FORECAST_CACHE_KEY = 'garden-app:weather-forecast';
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0) return WeatherCondition.Sunny;
  if (code >= 1 && code <= 3) return WeatherCondition.PartlyCloudy;
  if (code >= 45 && code <= 48) return WeatherCondition.Foggy;
  if (code >= 51 && code <= 57) return WeatherCondition.Rainy;
  if (code >= 61 && code <= 67) return WeatherCondition.Rainy;
  if (code >= 71 && code <= 77) return WeatherCondition.Snowy;
  if (code >= 80 && code <= 82) return WeatherCondition.Rainy;
  if (code >= 95 && code <= 99) return WeatherCondition.Stormy;
  return WeatherCondition.Cloudy;
}

function parseForecastResponse(
  data: OpenMeteoForecastResponse,
): WeatherForecast[] {
  const { daily } = data;

  return daily.time.map((dateStr, i) => ({
    date: new Date(`${dateStr}T00:00:00`),
    temperatureMin: daily.temperature_2m_min[i],
    temperatureMax: daily.temperature_2m_max[i],
    precipitationMm: daily.precipitation_sum[i],
    precipitationProbability: daily.precipitation_probability_max[i],
    humidity: 0,
    condition: weatherCodeToCondition(daily.weathercode[i]),
    weatherCode: daily.weathercode[i],
    windSpeedKmh: 0,
  }));
}

function getCachedForecast(lat: number, lng: number): WeatherForecast[] | null {
  try {
    const raw = localStorage.getItem(FORECAST_CACHE_KEY);
    if (!raw) return null;

    const cached: CachedForecast = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;

    if (age > CACHE_TTL_MS) return null;
    if (cached.latitude !== lat || cached.longitude !== lng) return null;

    return cached.forecasts.map((f) => ({
      ...f,
      date: new Date(f.date),
    }));
  } catch {
    return null;
  }
}

function setCachedForecast(
  forecasts: WeatherForecast[],
  lat: number,
  lng: number,
): void {
  const cached: CachedForecast = {
    forecasts,
    timestamp: Date.now(),
    latitude: lat,
    longitude: lng,
  };
  localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(cached));
}

export async function getWeatherForecast(
  lat: number,
  lng: number,
): Promise<WeatherForecast[]> {
  const cached = getCachedForecast(lat, lng);
  if (cached) return cached;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=auto&forecast_days=7`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al obtener el pronóstico: ${response.status}`);
  }

  const data: OpenMeteoForecastResponse = await response.json();
  const forecasts = parseForecastResponse(data);

  setCachedForecast(forecasts, lat, lng);
  return forecasts;
}

export function shouldSkipWatering(forecasts: WeatherForecast[]): boolean {
  const todayAndTomorrow = forecasts.slice(0, 2);

  return todayAndTomorrow.some(
    (day) => day.precipitationProbability > 60 && day.precipitationMm > 2,
  );
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query.trim()) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error en la búsqueda de ciudades: ${response.status}`);
  }

  const data: GeocodingResponse = await response.json();
  return data.results ?? [];
}

export function weatherCodeToEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '☁️';
}

export { weatherCodeToCondition, parseForecastResponse };
