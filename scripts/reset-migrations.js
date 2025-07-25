#!/usr/bin/env node

/**
 * Reset Migration History
 * 
 * This script helps you reset your migration history and start fresh.
 * 
 * Usage:
 * node scripts/reset-migrations.js [--confirm]
 * 
 * Options:
 * --confirm  Skip confirmation prompt
 * 
 * WARNING: This will delete all migration history and optionally drop all tables!
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const skipConfirm = args.includes('--confirm');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');

// Helper function to ask user questions
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
};

const resetMigrations = async () => {
  console.log('🔄 Migration Reset Tool');
  console.log('═══════════════════════');
  console.log('');
  
  if (!skipConfirm) {
    console.log('⚠️  WARNING: This will reset your migration history!');
    console.log('');
    console.log('Choose your reset option:');
    console.log('1. Clear migration history only (keep data)');
    console.log('2. Clear history + drop all tables (fresh start)');
    console.log('3. Clear history + migration files (complete reset)');
    console.log('4. Cancel');
    console.log('');
    
    const choice = await askQuestion('Enter your choice (1-4): ');
    
    switch (choice) {
      case '1':
        await clearMigrationHistoryOnly();
        break;
      case '2':
        await clearHistoryAndTables();
        break;
      case '3':
        await completeReset();
        break;
      case '4':
        console.log('❌ Operation cancelled');
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid choice. Operation cancelled.');
        process.exit(1);
    }
  } else {
    await clearMigrationHistoryOnly();
  }
  
  rl.close();
};

// Option 1: Clear migration history only
const clearMigrationHistoryOnly = async () => {
  console.log('');
  console.log('🗑️  Clearing migration history only...');
  
  // Create a migration that clears the migration table
  const resetMigration = createResetHistoryMigration();
  
  console.log('✅ Created reset migration:');
  console.log(`📄 ${resetMigration.fileName}`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Add this migration to src/database/migrations/index.js');
  console.log('2. Run your app - it will clear migration history and re-run all migrations');
  console.log('3. Your data will be preserved, but schema might be recreated');
};

// Option 2: Clear history and drop tables
const clearHistoryAndTables = async () => {
  console.log('');
  console.log('🗑️  Creating migration to drop all tables and clear history...');
  
  // Get list of existing migrations to determine tables
  const existingMigrations = getExistingMigrations();
  const tables = extractTableNames(existingMigrations);
  
  const resetMigration = createDropTablesMigration(tables);
  
  console.log('✅ Created reset migration:');
  console.log(`📄 ${resetMigration.fileName}`);
  console.log('');
  console.log('⚠️  This migration will drop tables:', tables.join(', '));
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Add this migration to src/database/migrations/index.js');
  console.log('2. Run your app - it will drop all tables and re-run migrations');
  console.log('3. ALL DATA WILL BE LOST!');
};

// Option 3: Complete reset (delete files)
const completeReset = async () => {
  console.log('');
  const confirm = await askQuestion('⚠️  This will DELETE all migration files! Type "DELETE" to confirm: ');
  
  if (confirm !== 'delete') {
    console.log('❌ Operation cancelled');
    return;
  }
  
  console.log('🗑️  Performing complete reset...');
  
  // Delete all migration files except index.js
  const files = fs.readdirSync(migrationsDir);
  let deletedCount = 0;
  
  files.forEach(file => {
    if (file !== 'index.js' && file.endsWith('.js')) {
      const filePath = path.join(migrationsDir, file);
      fs.unlinkSync(filePath);
      deletedCount++;
      console.log(`🗑️  Deleted: ${file}`);
    }
  });
  
  // Reset index.js
  const indexContent = `// Import all migrations in order
// Add new migrations as you create them

// Export migrations array in order
export const migrations = [
  // Add your migrations here in chronological order
];

export default migrations;
`;
  
  fs.writeFileSync(path.join(migrationsDir, 'index.js'), indexContent);
  
  console.log('');
  console.log(`✅ Complete reset finished!`);
  console.log(`🗑️  Deleted ${deletedCount} migration files`);
  console.log('📄 Reset migrations/index.js');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Generate new migrations with: npm run auto-migrate');
  console.log('2. Or create migrations manually with: npm run generate-migration');
  console.log('3. Run your app to apply new migrations');
};

// Helper functions
const createResetHistoryMigration = () => {
  const timestamp = Date.now();
  const fileName = `999_reset_migration_history.js`;
  const filePath = path.join(migrationsDir, fileName);
  
  const migrationContent = `export const resetMigrationHistory = {
  name: '999_reset_migration_history',
  up: \`
    -- Clear migration history to start fresh
    DELETE FROM migrations;
    
    -- Reset auto-increment
    DELETE FROM sqlite_sequence WHERE name='migrations';
  \`,
  down: \`
    -- Cannot rollback a history reset
    -- Manual intervention required
  \`
};
`;
  
  fs.writeFileSync(filePath, migrationContent);
  
  return { fileName, filePath };
};

const createDropTablesMigration = (tables) => {
  const fileName = `999_drop_all_tables.js`;
  const filePath = path.join(migrationsDir, fileName);
  
  const dropStatements = tables.map(table => `    DROP TABLE IF EXISTS ${table};`).join('\n');
  
  const migrationContent = `export const dropAllTables = {
  name: '999_drop_all_tables',
  up: \`
    -- Drop all existing tables
${dropStatements}
    
    -- Clear migration history
    DROP TABLE IF EXISTS migrations;
  \`,
  down: \`
    -- Cannot rollback dropping all tables
    -- Manual intervention required
  \`
};
`;
  
  fs.writeFileSync(filePath, migrationContent);
  
  return { fileName, filePath };
};

const getExistingMigrations = () => {
  if (!fs.existsSync(migrationsDir)) return [];
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d{3}_.*\.js$/) && file !== '999_reset_migration_history.js')
    .sort();
};

const extractTableNames = (migrationFiles) => {
  const tables = new Set();
  
  migrationFiles.forEach(file => {
    const fileName = file.replace(/^\d{3}_/, '').replace(/\.js$/, '');
    
    if (fileName.includes('create_') && fileName.includes('_table')) {
      const tableName = fileName
        .replace('create_', '')
        .replace('_table', '')
        .replace(/_/g, '_');
      
      // Common table name patterns
      if (tableName.includes('user')) tables.add('users');
      if (tableName.includes('mentor_profile')) tables.add('mentor_profiles');
      if (tableName.includes('mentee_profile')) tables.add('mentee_profiles');
      if (tableName.includes('skill')) tables.add('skills');
      if (tableName.includes('user_skill')) tables.add('user_skills');
      if (tableName.includes('mentorship')) tables.add('mentorship_requests');
    }
  });
  
  return Array.from(tables);
};

// Run the script
resetMigrations().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
