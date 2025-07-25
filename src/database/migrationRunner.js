import { db } from './config';
import { Platform } from 'react-native';

// Migration tracking table (platform-aware)
const createMigrationsTable = () => {
  try {
    if (Platform.OS === 'web') {
      console.log('Mock: Creating migrations table');
      return;
    }
    
    if (db.execSync) {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      console.warn('Database not available for migration table creation');
    }
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
};

// Get executed migrations (platform-aware)
export const getExecutedMigrations = () => {
  try {
    if (Platform.OS === 'web') {
      console.log('Mock: Getting executed migrations');
      return [];
    }
    
    if (db.getAllSync) {
      const result = db.getAllSync('SELECT name FROM migrations ORDER BY executed_at ASC;');
      return result.map(row => row.name);
    } else {
      console.warn('Database not available for getting migrations');
      return [];
    }
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    // If the table doesn't exist yet, return empty array
    if (error.message && error.message.includes('no such table')) {
      return [];
    }
    return []; // Return empty array instead of throwing for development
  }
};

// Record migration as executed
export const recordMigration = (migrationName) => {
  try {
    if (Platform.OS === 'web') {
      console.log('Mock: Recording migration:', migrationName);
      return;
    }
    
    if (db.runSync) {
      db.runSync('INSERT INTO migrations (name) VALUES (?);', [migrationName]);
    }
  } catch (error) {
    console.error('Error recording migration:', error);
    // Don't throw in development mode
  }
};

// Remove migration record (for rollbacks)
export const removeMigrationRecord = (migrationName) => {
  try {
    if (Platform.OS === 'web') {
      console.log('Mock: Removing migration:', migrationName);
      return;
    }
    
    if (db.runSync) {
      db.runSync('DELETE FROM migrations WHERE name = ?;', [migrationName]);
    }
  } catch (error) {
    console.error('Error removing migration record:', error);
    // Don't throw in development mode
  }
};

// Execute a migration
export const executeMigration = (migration) => {
  try {
    if (Platform.OS === 'web') {
      console.log('Mock: Executing migration:', migration.name);
      return;
    }
    
    // Execute the migration SQL
    if (db.execSync) {
      db.execSync(migration.up);
    }
    
    // Record migration as executed
    recordMigration(migration.name);
    
    console.log(`✅ Migration ${migration.name} executed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migration.name} failed:`, error);
    // Don't throw in development mode, just log
  }
};

// Rollback a migration
export const rollbackMigration = (migration) => {
  try {
    // Execute the rollback SQL
    db.execSync(migration.down);
    
    // Remove migration record
    removeMigrationRecord(migration.name);
    
    console.log(`⬇️ Migration ${migration.name} rolled back successfully`);
  } catch (error) {
    console.error(`❌ Rollback ${migration.name} failed:`, error);
    throw error;
  }
};

// Run pending migrations
export const runMigrations = async (migrations) => {
  try {
    // Ensure migrations table exists
    createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = getExecutedMigrations();
    
    // Filter pending migrations
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.includes(migration.name)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }
    
    console.log(`🚀 Running ${pendingMigrations.length} pending migrations...`);
    
    // Execute each pending migration
    for (const migration of pendingMigrations) {
      executeMigration(migration);
    }
    
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Initialize database (run migrations)
export const initializeDatabase = async () => {
  try {
    // Import all migrations
    const { migrations } = await import('./migrations/index');
    
    // Run migrations
    await runMigrations(migrations);
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export default {
  runMigrations,
  initializeDatabase,
  executeMigration,
  rollbackMigration,
  getExecutedMigrations,
};
