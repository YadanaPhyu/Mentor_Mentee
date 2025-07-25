#!/usr/bin/env node

/**
 * Database Seeding Script
 * This script creates sample users for testing the authentication system
 */

const path = require('path');
const fs = require('fs');

// Mock the React Native environment for Node.js
global.Platform = { OS: 'android' };

// Mock expo-sqlite for Node.js environment
const mockDatabase = {
  execSync: () => {},
  getAllSync: () => [],
  runSync: () => ({ lastInsertRowId: 1 }),
};

// Set up the database path
const dbPath = path.join(__dirname, '..', 'database.db');

// Simple password hashing function (same as in AuthContext)
const hashPassword = (password) => {
  return Buffer.from(password + 'salt123').toString('base64');
};

// Sample users to insert
const sampleUsers = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    user_type: 'admin',
    phone: '+1234567890',
    bio: 'System administrator',
    location: 'New York, NY',
  },
  {
    email: 'mentor@example.com',
    password: 'mentor123',
    name: 'Jane Mentor',
    user_type: 'mentor',
    phone: '+1234567891',
    bio: 'Senior Software Engineer with 10+ years experience in full-stack development',
    location: 'San Francisco, CA',
  },
  {
    email: 'mentee@example.com',
    password: 'mentee123',
    name: 'John Mentee',
    user_type: 'mentee',
    phone: '+1234567892',
    bio: 'Computer Science student looking to learn web development',
    location: 'Austin, TX',
  },
  {
    email: 'sarah.dev@example.com',
    password: 'password123',
    name: 'Sarah Developer',
    user_type: 'mentor',
    phone: '+1234567893',
    bio: 'Frontend specialist with expertise in React and UI/UX design',
    location: 'Seattle, WA',
  },
  {
    email: 'mike.student@example.com',
    password: 'password123',
    name: 'Mike Student',
    user_type: 'mentee',
    phone: '+1234567894',
    bio: 'Bootcamp graduate seeking guidance in backend development',
    location: 'Chicago, IL',
  }
];

console.log('📝 Database Seeding Script');
console.log('==========================');
console.log('');
console.log('This script would insert the following sample users:');
console.log('');

sampleUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.user_type})`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Location: ${user.location}`);
  console.log('');
});

console.log('To use these credentials:');
console.log('1. Run the app');
console.log('2. Go to the login screen');
console.log('3. Use any email/password combination above');
console.log('');
console.log('Example login:');
console.log('📧 Email: mentor@example.com');
console.log('🔒 Password: mentor123');
console.log('');
console.log('Note: In a real app environment, run the migration');
console.log('and then manually add these users through the app registration.');

// Export for potential use in the app
module.exports = {
  sampleUsers,
  hashPassword
};
