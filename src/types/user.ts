export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  locationLat: number | null;
  locationLng: number | null;
  notificationPreferences: NotificationPreferences;
  createdAt: Date;
}

export interface NotificationPreferences {
  wateringReminders: boolean;
  dailySummary: boolean;
}
