import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'mentormentee.db';

export const getDatabase = () => {
  return SQLite.openDatabase(DATABASE_NAME);
};

export const initDatabase = async () => {
  const db = getDatabase();
  
  // Create Users table
  await db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`
    );
  });

  // Create Profiles table
  await db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT,
        bio TEXT,
        skills TEXT,
        interests TEXT,
        experience_level TEXT,
        profile_image TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );`
    );
  });

  // Create Mentorships table
  await db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS mentorships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id INTEGER,
        mentee_id INTEGER,
        status TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users (id),
        FOREIGN KEY (mentee_id) REFERENCES users (id)
      );`
    );
  });

  // Create Messages table
  await db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
      );`
    );
  });
};
