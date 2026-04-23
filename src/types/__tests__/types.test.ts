import { describe, expect, expectTypeOf, it } from 'vitest';

import { CareType } from '../care';
import {
  type CareEvent,
  type GardenZone,
  type Plant,
  type PlantPhoto,
  type Reminder,
  type ReminderStatus,
  type UserProfile,
  type WateringLog,
  ZoneType,
} from '../index';
import { PlantStatus } from '../plant';
import { WeatherCondition } from '../weather';

describe('Type definitions', () => {
  it('Plant has required fields', () => {
    expectTypeOf<Plant>().toHaveProperty('id');
    expectTypeOf<Plant>().toHaveProperty('name');
    expectTypeOf<Plant>().toHaveProperty('species');
    expectTypeOf<Plant>().toHaveProperty('wateringFrequencyDays');
    expectTypeOf<Plant>().toHaveProperty('createdAt');
  });

  it('CareType enum has all values', () => {
    expect(CareType.Water).toBe('water');
    expect(CareType.Prune).toBe('prune');
    expect(CareType.Fertilize).toBe('fertilize');
    expect(CareType.Transplant).toBe('transplant');
  });

  it('ZoneType enum has all values', () => {
    expect(ZoneType.Sun).toBe('sun');
    expect(ZoneType.Shade).toBe('shade');
    expect(ZoneType.Terrace).toBe('terrace');
    expect(ZoneType.Indoor).toBe('indoor');
    expect(ZoneType.Other).toBe('other');
  });

  it('date fields use Date type not Timestamp', () => {
    expectTypeOf<Plant['createdAt']>().toEqualTypeOf<Date>();
    expectTypeOf<CareEvent['date']>().toEqualTypeOf<Date>();
    expectTypeOf<WateringLog['wateredAt']>().toEqualTypeOf<Date>();
  });

  it('exports support related shapes', () => {
    expectTypeOf<GardenZone['type']>().toEqualTypeOf<ZoneType>();
    expectTypeOf<PlantPhoto['caption']>().toEqualTypeOf<string | null>();
    expectTypeOf<Reminder['status']>().toEqualTypeOf<ReminderStatus>();
    expectTypeOf<UserProfile['notificationPreferences']>().toEqualTypeOf<{
      wateringReminders: boolean;
      dailySummary: boolean;
    }>();
    expect(PlantStatus.Healthy).toBe('healthy');
    expect(PlantStatus.NeedsWater).toBe('needs-water');
    expect(WeatherCondition.PartlyCloudy).toBe('partly-cloudy');
  });
});
