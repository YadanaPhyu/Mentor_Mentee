#!/usr/bin/env node

/**
 * Simple Database Seeder
 * This script creates a pre-seeded database file that your app can use
 */

const path = require('path');
const fs = require('fs');

// Import seeding data
const { sampleUsers } = require('./seedDatabase');

// Simple password hashing (same as AuthContext)
const hashPassword = (password) => {
  return Buffer.from(password + 'salt123').toString('base64');
};

// Create initial database data structure
const createInitialData = () => {
  const users = [];
  
  console.log('🌱 Preparing user data...');
  
  for (const userData of sampleUsers) {
    const hashedPassword = hashPassword(userData.password);
    
    const user = {
      id: users.length + 1,
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
    
    users.push(user);
    console.log(`✅ Prepared user: ${userData.email}`);
  }
  
  return users;
};

// Create SQL statements for the database
const generateSQL = (users) => {
  console.log('📝 Generating SQL statements...');
  
  let sql = `-- Database seeding SQL
-- Generated on ${new Date().toISOString()}

-- Clear existing data
DELETE FROM users;

-- Insert test users
`;

  users.forEach(user => {
    sql += `INSERT INTO users (id, email, password_hash, name, user_type, phone, bio, location, status, created_at, updated_at) VALUES (
  ${user.id},
  '${user.email}',
  '${user.password_hash}',
  '${user.name.replace(/'/g, "''")}',
  '${user.user_type}',
  '${user.phone}',
  '${user.bio.replace(/'/g, "''")}',
  '${user.location}',
  '${user.status}',
  '${user.created_at}',
  '${user.updated_at}'
);

`;
  });

  return sql;
};

// Main seeding function
const seedDatabase = () => {
  console.log('🔧 Simple Database Seeder');
  console.log('==========================\n');

  try {
    // Create user data
    const users = createInitialData();
    
    // Generate SQL file
    const sql = generateSQL(users);
    const sqlFilePath = path.join(__dirname, '..', 'seed-data.sql');
    fs.writeFileSync(sqlFilePath, sql);
    console.log(`📄 Created SQL file: ${sqlFilePath}`);
    
    // Create JSON file for easy reference
    const jsonData = {
      users,
      generated_at: new Date().toISOString(),
      note: "This data represents the seeded users for the mentor-mentee app"
    };
    
    const jsonFilePath = path.join(__dirname, '..', 'seed-data.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`📄 Created JSON file: ${jsonFilePath}`);

    console.log(`\n🎉 Successfully prepared ${users.length} users for seeding!`);
    
    console.log('\n📋 Test Credentials:');
    console.log('====================');
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
    
    console.log('📋 How to use:');
    console.log('1. The app will create the database automatically');
    console.log('2. Use the "Create Test Users" button in the Dev tab');
    console.log('3. Or manually register with the credentials above');
    console.log('');
    console.log('✅ Seeding preparation completed!');
    
  } catch (error) {
    console.error('❌ Seeding preparation failed:', error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
