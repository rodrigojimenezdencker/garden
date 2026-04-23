export interface WeatherForecast {
  date: Date;
  temperatureMin: number;
  temperatureMax: number;
  precipitationMm: number;
  humidity: number;
  condition: WeatherCondition;
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
