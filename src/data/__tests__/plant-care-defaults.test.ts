import { describe, expect, it } from 'vitest';
import { PLANT_CARE_DEFAULTS, findPlantDefaults } from '../plant-care-defaults';

describe('PLANT_CARE_DEFAULTS', () => {
  it('has entries for all required plants', () => {
    const names = PLANT_CARE_DEFAULTS.map((p) => p.commonNameEs.toLowerCase());
    expect(names).toContain('lavanda');
    expect(names).toContain('margarita');
    expect(names).toContain('petunia');
    expect(names).toContain('jazmín');
    expect(names).toContain('menta');
    expect(names).toContain('albahaca');
    expect(names).toContain('cilantro');
  });

  it('every entry has all required fields populated', () => {
    for (const plant of PLANT_CARE_DEFAULTS) {
      expect(plant.commonNameEs).toBeTruthy();
      expect(plant.commonNameEn).toBeTruthy();
      expect(plant.species).toBeTruthy();
      expect(plant.wateringFrequencyDays).toBeGreaterThan(0);
      expect(['full-sun', 'partial', 'shade']).toContain(plant.sunlight);
      expect(plant.soilType).toBeTruthy();
      expect(plant.hardinessZoneMin).toBeGreaterThanOrEqual(1);
      expect(plant.hardinessZoneMax).toBeGreaterThanOrEqual(
        plant.hardinessZoneMin,
      );
    }
  });
});

describe('findPlantDefaults', () => {
  it('finds plants by Spanish common name', () => {
    expect(findPlantDefaults('lavanda')).toHaveLength(1);
    expect(findPlantDefaults('albahaca')).toHaveLength(1);
    expect(findPlantDefaults('menta')).toHaveLength(1);
  });

  it('finds plants by English common name', () => {
    expect(findPlantDefaults('lavender')).toHaveLength(1);
    expect(findPlantDefaults('basil')).toHaveLength(1);
  });

  it('finds plants by species name', () => {
    const results = findPlantDefaults('Lavandula');
    expect(results).toHaveLength(1);
    expect(results[0].commonNameEs).toBe('Lavanda');
  });

  it('returns empty array for no matches', () => {
    expect(findPlantDefaults('xyz')).toHaveLength(0);
  });

  it('returns empty array for empty query', () => {
    expect(findPlantDefaults('')).toHaveLength(0);
    expect(findPlantDefaults('  ')).toHaveLength(0);
  });

  it('is case-insensitive', () => {
    expect(findPlantDefaults('LAVANDA')).toHaveLength(1);
    expect(findPlantDefaults('Albahaca')).toHaveLength(1);
  });
});
