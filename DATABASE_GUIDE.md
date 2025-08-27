# Database Setup Guide

This guide explains how to set up and use the database in the Mentor/Mentee application.

## Database Structure

The application uses SQLite through expo-sqlite with the following tables:

### Users
- id (PRIMARY KEY)
- email (UNIQUE)
- password
- role
- created_at

### Profiles
- id (PRIMARY KEY)
- user_id (FOREIGN KEY)
- full_name
- bio
- skills
- interests
- experience_level
- profile_image

### Mentorships
- id (PRIMARY KEY)
- mentor_id (FOREIGN KEY)
- mentee_id (FOREIGN KEY)
- status
- created_at

### Messages
- id (PRIMARY KEY)
- sender_id (FOREIGN KEY)
- receiver_id (FOREIGN KEY)
- content
- created_at

## Usage

1. Initialize the database:
```javascript
import { initDatabase } from './src/database/config';

// In your App.js or entry point
useEffect(() => {
  initDatabase();
}, []);
```

2. Use the Database class:
```javascript
import Database from './src/database/Database';

const db = Database.getInstance();

// Create a user
await db.createUser({
  email: 'user@example.com',
  password: 'hashedPassword',
  role: 'mentor'
});

// Create a profile
await db.createProfile({
  userId: 1,
  fullName: 'John Doe',
  bio: 'Experienced developer',
  skills: 'JavaScript,React,Node.js',
  interests: 'Web Development,Mobile Apps',
  experienceLevel: 'senior'
});

// Create a mentorship
await db.createMentorship(mentorId, menteeId);

// Send a message
await db.sendMessage(senderId, receiverId, 'Hello!');
```

## Migration Scripts

The database migrations are handled automatically when initializing the database. If you need to update the schema:

1. Update the table creation scripts in `src/database/config.js`
2. Increment the database version
3. Add migration logic in the `initDatabase` function

## Data Backup

The SQLite database is stored locally on the device. Implement regular backups to a remote server for data safety.
