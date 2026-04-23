export const ReminderStatus = {
  Pending: 'pending',
  Dismissed: 'dismissed',
  Done: 'done',
} as const;

export type ReminderStatus =
  (typeof ReminderStatus)[keyof typeof ReminderStatus];

export interface Reminder {
  id: string;
  plantId: string;
  plantName: string;
  type: 'watering' | 'care';
  message: string;
  dueDate: Date;
  status: ReminderStatus;
  createdAt: Date;
}
