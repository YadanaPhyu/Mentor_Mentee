import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';
import { seeders } from './seeders';

class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Open or create database
      this.db = await SQLite.openDatabaseAsync('mentor_mentee.db');
      
      console.log('Database opened successfully');
      
      // Enable foreign keys
      await this.db.execAsync('PRAGMA foreign_keys = ON;');
      
      // Run migrations
      await this.runMigrations();
      
      // Run seeders in development
      if (__DEV__) {
        await this.runSeeders();
      }
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
      
      return this.db;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async runMigrations() {
    try {
      // Create migrations table if it doesn't exist
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          migration_name TEXT NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Get executed migrations
      const executedMigrations = await this.db.getAllAsync(
        'SELECT migration_name FROM migrations ORDER BY id'
      );
      
      const executedNames = executedMigrations.map(m => m.migration_name);

      // Run pending migrations
      for (const migration of migrations) {
        if (!executedNames.includes(migration.name)) {
          console.log(`Running migration: ${migration.name}`);
          
          // Execute migration
          await this.db.execAsync(migration.up);
          
          // Record migration
          await this.db.runAsync(
            'INSERT INTO migrations (migration_name) VALUES (?)',
            [migration.name]
          );
          
          console.log(`Migration completed: ${migration.name}`);
        }
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async runSeeders() {
    try {
      console.log('Running database seeders...');
      
      for (const seeder of seeders) {
        console.log(`Running seeder: ${seeder.name}`);
        await seeder.run(this.db);
      }
      
      console.log('Seeders completed successfully');
    } catch (error) {
      console.error('Seeder failed:', error);
      // Don't throw here, seeders are optional
    }
  }

  async rollbackMigration(migrationName) {
    try {
      const migration = migrations.find(m => m.name === migrationName);
      if (!migration || !migration.down) {
        throw new Error(`Migration ${migrationName} not found or doesn't support rollback`);
      }

      console.log(`Rolling back migration: ${migrationName}`);
      
      // Execute rollback
      await this.db.execAsync(migration.down);
      
      // Remove migration record
      await this.db.runAsync(
        'DELETE FROM migrations WHERE migration_name = ?',
        [migrationName]
      );
      
      console.log(`Migration rolled back: ${migrationName}`);
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }

  getDatabase() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      console.log('Database closed');
    }
  }
}

// Singleton instance
export const database = new Database();
export default database;
