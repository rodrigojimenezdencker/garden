export const ZoneType = {
  Sun: 'sun',
  Shade: 'shade',
  Terrace: 'terrace',
  Indoor: 'indoor',
  Other: 'other',
} as const;

export type ZoneType = (typeof ZoneType)[keyof typeof ZoneType];

export interface GardenZone {
  id: string;
  name: string;
  type: ZoneType;
  createdAt: Date;
}
