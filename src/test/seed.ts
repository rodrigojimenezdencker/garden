// Seed script for QA test data
// Each feature task (T8, T9, T10, etc.) will add its own seed functions here

export async function seedData(): Promise<void> {
  console.log('Seeding test data...');
  // TODO: populated by T8 (plants), T9 (watering), T10 (history), T16 (zones)
}

export async function clearTestData(): Promise<void> {
  console.log('Clearing test data...');
  // TODO: populated by T8, T9, T10, T16
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedData().catch(console.error);
}
