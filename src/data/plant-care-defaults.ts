import type { PlantCareData } from '../types';

export interface PlantCareDefault extends PlantCareData {
  commonNameEs: string;
  commonNameEn: string;
  species: string;
  wateringFrequencyDays: number;
}

export const PLANT_CARE_DEFAULTS: PlantCareDefault[] = [
  {
    commonNameEs: 'Lavanda',
    commonNameEn: 'Lavender',
    species: 'Lavandula angustifolia',
    wateringFrequencyDays: 7,
    sunlight: 'full-sun',
    soilType: 'bien drenado / arenoso',
    hardinessZoneMin: 5,
    hardinessZoneMax: 9,
    pruningSeason: 'Primavera temprana',
    fertilizingFrequencyDays: 365,
    careTips:
      'Riega solo cuando el sustrato se haya secado por completo y evita el encharcamiento. Poda ligeramente después de la floración para mantenerla compacta y vigorosa.',
  },
  {
    commonNameEs: 'Margarita',
    commonNameEn: 'Daisy',
    species: 'Bellis perennis',
    wateringFrequencyDays: 3,
    sunlight: 'partial',
    soilType: 'franco',
    hardinessZoneMin: 4,
    hardinessZoneMax: 8,
    pruningSeason: 'Después de floración',
    fertilizingFrequencyDays: 30,
    careTips:
      'Mantén el sustrato ligeramente húmedo, pero sin saturarlo. Retira flores marchitas para prolongar la floración y estimular nuevos brotes.',
  },
  {
    commonNameEs: 'Petunia',
    commonNameEn: 'Petunia',
    species: 'Petunia × hybrida',
    wateringFrequencyDays: 2,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 9,
    hardinessZoneMax: 11,
    pruningSeason: 'Verano',
    fertilizingFrequencyDays: 14,
    careTips:
      'Riega con frecuencia en épocas cálidas para evitar que se deshidraten. Despunta flores secas y aporta abono regular para sostener una floración continua.',
  },
  {
    commonNameEs: 'Jazmín',
    commonNameEn: 'Common jasmine',
    species: 'Jasminum officinale',
    wateringFrequencyDays: 3,
    sunlight: 'full-sun',
    soilType: 'rico / húmedo',
    hardinessZoneMin: 7,
    hardinessZoneMax: 10,
    pruningSeason: 'Después de floración',
    fertilizingFrequencyDays: 30,
    careTips:
      'Agradece riegos regulares durante el crecimiento activo, pero con buen drenaje. Guía y poda la planta tras florecer para conservar una estructura ordenada.',
  },
  {
    commonNameEs: 'Menta',
    commonNameEn: 'Spearmint',
    species: 'Mentha spicata',
    wateringFrequencyDays: 2,
    sunlight: 'partial',
    soilType: 'rico / húmedo',
    hardinessZoneMin: 4,
    hardinessZoneMax: 9,
    pruningSeason: 'Primavera y verano',
    fertilizingFrequencyDays: 45,
    careTips:
      'Mantén el suelo fresco y no dejes que se seque del todo. Cultívala en maceta o controla su expansión porque puede volverse invasiva.',
  },
  {
    commonNameEs: 'Albahaca',
    commonNameEn: 'Basil',
    species: 'Ocimum basilicum',
    wateringFrequencyDays: 2,
    sunlight: 'full-sun',
    soilType: 'rico / bien drenado',
    hardinessZoneMin: 10,
    hardinessZoneMax: 11,
    pruningSeason: 'Verano',
    fertilizingFrequencyDays: 21,
    careTips:
      'Pinza las puntas para fomentar una planta más frondosa y evitar la floración temprana. Riega de forma constante, pero deja secar la capa superior entre riegos.',
  },
  {
    commonNameEs: 'Cilantro',
    commonNameEn: 'Coriander',
    species: 'Coriandrum sativum',
    wateringFrequencyDays: 3,
    sunlight: 'partial',
    soilType: 'bien drenado / franco',
    hardinessZoneMin: 2,
    hardinessZoneMax: 11,
    pruningSeason: 'No aplica',
    fertilizingFrequencyDays: 30,
    careTips:
      'Prefiere temperaturas frescas; si hace mucho calor, espiga rápido. Siembra escalonadamente y riega con regularidad para mantener hojas tiernas y aromáticas.',
  },
  {
    commonNameEs: 'Limonero',
    commonNameEn: 'Lemon tree',
    species: 'Citrus limon',
    wateringFrequencyDays: 5,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 9,
    hardinessZoneMax: 11,
    pruningSeason: 'Final de invierno',
    fertilizingFrequencyDays: 30,
    careTips:
      'Necesita sol directo y riegos profundos, dejando secar ligeramente la superficie entre riegos. Protege de heladas y aporta fertilizante para cítricos en temporada de crecimiento.',
  },
  {
    commonNameEs: 'Naranjo',
    commonNameEn: 'Orange tree',
    species: 'Citrus × sinensis',
    wateringFrequencyDays: 5,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 9,
    hardinessZoneMax: 11,
    pruningSeason: 'Final de invierno',
    fertilizingFrequencyDays: 30,
    careTips:
      'Evita suelos encharcados y riega con constancia durante floración y fructificación. Poda ramas cruzadas para mejorar luz y ventilación dentro de la copa.',
  },
  {
    commonNameEs: 'Higuera',
    commonNameEn: 'Fig tree',
    species: 'Ficus carica',
    wateringFrequencyDays: 7,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 6,
    hardinessZoneMax: 10,
    pruningSeason: 'Invierno',
    fertilizingFrequencyDays: 60,
    careTips:
      'Una vez establecida tolera algo de sequía, así que riega en profundidad y con menos frecuencia. Poda en reposo para controlar tamaño y favorecer la producción.',
  },
  {
    commonNameEs: 'Olivo',
    commonNameEn: 'Olive tree',
    species: 'Olea europaea',
    wateringFrequencyDays: 10,
    sunlight: 'full-sun',
    soilType: 'bien drenado / pedregoso',
    hardinessZoneMin: 8,
    hardinessZoneMax: 11,
    pruningSeason: 'Final de invierno',
    fertilizingFrequencyDays: 60,
    careTips:
      'Tolera sequía mejor que el exceso de agua, así que usa riegos profundos y espaciados. Asegura buen drenaje y poda para abrir la copa y equilibrar la producción.',
  },
  {
    commonNameEs: 'Romero',
    commonNameEn: 'Rosemary',
    species: 'Rosmarinus officinalis',
    wateringFrequencyDays: 7,
    sunlight: 'full-sun',
    soilType: 'bien drenado / arenoso',
    hardinessZoneMin: 8,
    hardinessZoneMax: 11,
    pruningSeason: 'Primavera',
    fertilizingFrequencyDays: 90,
    careTips:
      'Prefiere suelo pobre y seco antes que excesivamente fértil o húmedo. Recorta puntas de forma ligera para mantenerlo compacto sin llegar a madera vieja.',
  },
  {
    commonNameEs: 'Tomillo',
    commonNameEn: 'Thyme',
    species: 'Thymus vulgaris',
    wateringFrequencyDays: 7,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 5,
    hardinessZoneMax: 9,
    pruningSeason: 'Primavera',
    fertilizingFrequencyDays: 90,
    careTips:
      'No necesita riegos frecuentes; el exceso de humedad reduce su aroma y vigor. Corta ligeramente después de florecer para estimular un crecimiento más denso.',
  },
  {
    commonNameEs: 'Geranio',
    commonNameEn: 'Geranium',
    species: 'Pelargonium spp.',
    wateringFrequencyDays: 3,
    sunlight: 'full-sun',
    soilType: 'bien drenado',
    hardinessZoneMin: 10,
    hardinessZoneMax: 11,
    pruningSeason: 'Primavera',
    fertilizingFrequencyDays: 30,
    careTips:
      'Riega cuando la capa superior del sustrato esté seca y retira flores marchitas con frecuencia. Una poda suave al inicio de la temporada ayuda a que ramifique mejor y floree más.',
  },
];

export function findPlantDefaults(query: string): PlantCareDefault[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return PLANT_CARE_DEFAULTS.filter(
    (p) =>
      p.commonNameEs.toLowerCase().includes(q) ||
      p.commonNameEn.toLowerCase().includes(q) ||
      p.species.toLowerCase().includes(q),
  );
}
