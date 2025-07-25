#!/usr/bin/env node

/**
 * View Migration Log
 * 
 * Usage:
 * node scripts/view-migration-log.js
 */

import { getExecutedMigrations } from '../src/database/migrationRunner.js';
import db from '../src/database/config.js';

const viewMigrationLog = async () => {
  try {
    console.log('🔍 Checking migration history...\n');
    
    // Get executed migrations
    const executed = await getExecutedMigrations();
    
    if (executed.length === 0) {
      console.log('📝 No migrations have been executed yet');
      console.log('💡 Run your app to execute pending migrations');
      return;
    }
    
    console.log(`📊 Migration History (${executed.length} migrations executed):`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Get detailed migration info
    const migrationDetails = await new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT name, executed_at FROM migrations ORDER BY executed_at ASC;',
          [],
          (_, result) => {
            const details = [];
            for (let i = 0; i < result.rows.length; i++) {
              details.push(result.rows.item(i));
            }
            resolve(details);
          },
          (_, error) => reject(error)
        );
      });
    });
    
    migrationDetails.forEach((migration, index) => {
      const date = new Date(migration.executed_at).toLocaleString();
      console.log(`${index + 1}. ${migration.name}`);
      console.log(`   ⏰ Executed: ${date}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error viewing migration log:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  viewMigrationLog();
}

export default viewMigrationLog;
