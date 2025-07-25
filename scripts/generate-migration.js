#!/usr/bin/env node

/**
 * Migration Generator CLI
 * 
 * Usage:
 * node scripts/generate-migration.js create_users_table
 * node scripts/generate-migration.js add_column_to_users
 * node scripts/generate-migration.js create_index_on_emails
 */

const fs = require('fs');
const path = require('path');

// Get migration name from command line
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Please provide a migration name');
  console.log('Usage: node scripts/generate-migration.js <migration_name>');
  console.log('Example: node scripts/generate-migration.js create_users_table');
  process.exit(1);
}

// Generate timestamp for migration number
const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').substring(0, 14);
const migrationNumber = String(Date.now()).substring(-3); // Last 3 digits for uniqueness

// Get next migration number by checking existing files
const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');

// Ensure migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Get existing migration files
const existingFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.match(/^\d{3}_.*\.js$/))
  .sort();

// Generate next migration number
let nextNumber = 1;
if (existingFiles.length > 0) {
  const lastFile = existingFiles[existingFiles.length - 1];
  const lastNumber = parseInt(lastFile.substring(0, 3));
  nextNumber = lastNumber + 1;
}

const paddedNumber = String(nextNumber).padStart(3, '0');
const fileName = `${paddedNumber}_${migrationName}.js`;
const exportName = toCamelCase(migrationName);

// Generate migration template
const migrationTemplate = `export const ${exportName} = {
  name: '${paddedNumber}_${migrationName}',
  up: \`
    -- Add your SQL statements here for the migration
    -- Example:
    -- CREATE TABLE IF NOT EXISTS example_table (
    --   id INTEGER PRIMARY KEY AUTOINCREMENT,
    --   name TEXT NOT NULL,
    --   created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- );
    
    -- CREATE INDEX IF NOT EXISTS idx_example_name ON example_table(name);
  \`,
  down: \`
    -- Add your SQL statements here to rollback the migration
    -- Example:
    -- DROP INDEX IF EXISTS idx_example_name;
    -- DROP TABLE IF EXISTS example_table;
  \`
};
`;

// Helper function to convert snake_case to camelCase
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Write migration file
const filePath = path.join(migrationsDir, fileName);

try {
  fs.writeFileSync(filePath, migrationTemplate);
  
  console.log('✅ Migration created successfully!');
  console.log(`📄 File: ${fileName}`);
  console.log(`📁 Path: ${filePath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the migration file and add your SQL statements');
  console.log('2. Add the migration to src/database/migrations/index.js');
  console.log(`   - Import: import { ${exportName} } from './${fileName}';`);
  console.log(`   - Add to array: ${exportName},`);
  console.log('3. Run migrations in your app to apply changes');
  
} catch (error) {
  console.error('❌ Failed to create migration:', error.message);
  process.exit(1);
}
