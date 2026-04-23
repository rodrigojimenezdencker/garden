export const CareType = {
  Water: 'water',
  Prune: 'prune',
  Fertilize: 'fertilize',
  Transplant: 'transplant',
} as const;

export type CareType = (typeof CareType)[keyof typeof CareType];

export interface CareEvent {
  id: string;
  plantId: string;
  type: CareType;
  date: Date;
  notes: string;
  loggedBy: string;
  createdAt: Date;
}
