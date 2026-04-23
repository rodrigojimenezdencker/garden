export interface WateringLog {
  id: string;
  plantId: string;
  wateredAt: Date;
  notes: string;
  loggedBy: string;
  createdAt: Date;
}

export interface WateringSchedule {
  plantId: string;
  plantName: string;
  frequencyDays: number;
  lastWateredAt: Date | null;
  nextWateringDate: Date | null;
  isOverdue: boolean;
  daysUntilNext: number | null;
}
