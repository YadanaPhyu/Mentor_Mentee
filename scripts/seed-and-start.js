#!/usr/bin/env node

/**
 * Seed Database and Start App Script
 * This script runs migrations, seeds the database with test users, then starts the app
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Import our seeding data
const { sampleUsers, hashPassword } = require('./seedDatabase');

// Mock SQLite for Node.js environment
const mockSQLite = () => {
  // Create a simple file-based database simulation
  const dbFile = path.join(__dirname, '..', 'test-database.json');
  
  // Initialize empty database structure
  const initDB = () => {
    if (!fs.existsSync(dbFile)) {
      const emptyDB = {
        users: [],
        mentor_profiles: [],
        mentee_profiles: [],
        messages: [],
        sessions: [],
        migrations: ['001_create_all_tables']
      };
      fs.writeFileSync(dbFile, JSON.stringify(emptyDB, null, 2));
      console.log('📄 Created test database file');
    }
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  };

  // Save database
  const saveDB = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  };

  return { initDB, saveDB };
};

// Seed the database
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    const { initDB, saveDB } = mockSQLite();
    const db = initDB();

    // Clear existing users (for fresh seed)
    db.users = [];
    
    // Add sample users
    for (const userData of sampleUsers) {
      const hashedPassword = hashPassword(userData.password);
      
      const user = {
        id: db.users.length + 1,
        email: userData.email.toLowerCase(),
        password_hash: hashedPassword,
        name: userData.name,
        user_type: userData.user_type,
        phone: userData.phone,
        bio: userData.bio,
        location: userData.location,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login_at: null
      };
      
      db.users.push(user);
      console.log(`✅ Added user: ${userData.email}`);
    }

    saveDB(db);
    console.log(`🎉 Successfully seeded ${sampleUsers.length} users!`);
    
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
};

// Start the Expo app
const startApp = () => {
  console.log('\n🚀 Starting Expo app...');
  
  const expoProcess = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  expoProcess.on('error', (error) => {
    console.error('Failed to start Expo:', error);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    expoProcess.kill('SIGINT');
    process.exit(0);
  });
};

// Main execution
const main = async () => {
  console.log('🔧 Mentor-Mentee App Setup');
  console.log('============================\n');

  // Seed database
  const seedSuccess = await seedDatabase();
  
  if (seedSuccess) {
    console.log('\n📋 Test Credentials Available:');
    console.log('================================');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.user_type.toUpperCase()})`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔒 Password: ${user.password}`);
      console.log('');
    });
    
    console.log('💡 Quick Login Options:');
    console.log('   • Mentee: mentee@example.com / mentee123');
    console.log('   • Mentor: mentor@example.com / mentor123');
    console.log('   • Admin: admin@example.com / admin123');
    console.log('');
    
    // Start the app
    startApp();
  } else {
    console.log('❌ Cannot start app due to seeding failure');
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedDatabase, startApp };
