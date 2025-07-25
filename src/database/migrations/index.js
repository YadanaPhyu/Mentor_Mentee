// Import all migrations in order
// Add new migrations as you create them

// Export migrations array in order
import { createAllTables } from './001_create_all_tables';

export const migrations = [
  createAllTables,
  // Add your migrations here in chronological order
];

export default migrations;
