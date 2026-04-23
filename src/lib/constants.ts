export const COLLECTIONS = {
  PLANTS: 'plants',
  WATERING_LOGS: 'wateringLogs',
  CARE_EVENTS: 'careEvents',
  ZONES: 'zones',
  PHOTOS: 'photos',
  USER_PROFILES: 'userProfiles',
} as const;

export const STORAGE_PATHS = {
  PLANT_PHOTOS: 'plant-photos',
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];
