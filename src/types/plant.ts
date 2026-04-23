export interface Plant {
  id: string;
  name: string;
  species: string;
  photoUrl: string | null;
  photoPath: string | null;
  zoneId: string | null;
  notes: string;
  wateringFrequencyDays: number;
  customCareData: PlantCareData | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlantCareData {
  sunlight: 'full-sun' | 'partial' | 'shade';
  soilType: string;
  hardinessZoneMin: number;
  hardinessZoneMax: number;
  pruningSeason: string | null;
  fertilizingFrequencyDays: number | null;
  careTips: string | null;
}

export const PlantStatus = {
  Healthy: 'healthy',
  NeedsWater: 'needs-water',
  NeedsCare: 'needs-care',
  Dormant: 'dormant',
} as const;

export type PlantStatus = (typeof PlantStatus)[keyof typeof PlantStatus];
