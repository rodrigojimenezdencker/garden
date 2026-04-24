export interface WeatherForecast {
  date: Date;
  temperatureMin: number;
  temperatureMax: number;
  precipitationMm: number;
  precipitationProbability: number;
  humidity: number;
  condition: WeatherCondition;
  weatherCode: number;
  windSpeedKmh: number;
}

export const WeatherCondition = {
  Sunny: 'sunny',
  Cloudy: 'cloudy',
  Rainy: 'rainy',
  Stormy: 'stormy',
  Snowy: 'snowy',
  Foggy: 'foggy',
  PartlyCloudy: 'partly-cloudy',
} as const;

export type WeatherCondition =
  (typeof WeatherCondition)[keyof typeof WeatherCondition];

export interface OpenMeteoDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  weathercode: number[];
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: OpenMeteoDaily;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  cityName?: string;
}

export interface CachedForecast {
  forecasts: WeatherForecast[];
  timestamp: number;
  latitude: number;
  longitude: number;
}
