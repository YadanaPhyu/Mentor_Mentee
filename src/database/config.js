import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Database configuration
export const DB_NAME = 'mentor_mentee.db';
export const DB_VERSION = 1;

// Initialize database connection (platform-specific)
let db;

try {
  // Try the new API first for all platforms (now that web is properly configured)
  if (SQLite.openDatabaseSync) {
    db = SQLite.openDatabaseSync(DB_NAME);
    console.log('✅ Database initialized with openDatabaseSync on platform:', Platform.OS);
  } else {
    // Legacy API for older expo-sqlite versions
    db = SQLite.openDatabase(DB_NAME);
    console.log('✅ Database initialized with legacy openDatabase on platform:', Platform.OS);
  }
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  throw new Error(`Failed to initialize SQLite database: ${error.message}`);
}

export { db };

// Database configuration object
export const dbConfig = {
  name: DB_NAME,
  version: DB_VERSION,
  displayName: 'Mentor Mentee Database',
  size: 200000, // 200KB
};

// Enable foreign key constraints (platform-specific)
export const enableForeignKeys = () => {
  try {
    if (Platform.OS !== 'web' && db.execSync) {
      db.execSync('PRAGMA foreign_keys = ON;');
      console.log('Foreign keys enabled');
    } else {
      console.log('Foreign keys not supported on this platform');
    }
  } catch (error) {
    console.error('Failed to enable foreign keys:', error);
  }
};

export default db;
