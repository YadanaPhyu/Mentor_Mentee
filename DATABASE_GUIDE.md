# Database Migration System

## Overview

This project uses SQLite with a custom migration system for managing database schema changes. The system provides:

- ✅ **Migration Generation**: CLI tool to create new migrations
- ✅ **Migration Tracking**: Automatic tracking of executed migrations
- ✅ **Model System**: Base model class with common operations
- ✅ **Rollback Support**: Ability to rollback migrations

## Directory Structure

```
src/
├── database/
│   ├── config.js              # Database configuration
│   ├── migrationRunner.js     # Migration execution engine
│   └── migrations/
│       ├── index.js           # Migration registry
│       └── 001_*.js          # Individual migration files
├── models/
│   ├── BaseModel.js          # Base model class
│   ├── User.js              # User model example
│   └── index.js             # Model exports
└── scripts/
    └── generate-migration.js  # Migration generator CLI
```

## How to Generate Migrations

### 1. Using the CLI Generator

```bash
# Generate a new migration
node scripts/generate-migration.js create_users_table
node scripts/generate-migration.js add_email_to_users
node scripts/generate-migration.js create_index_on_emails
```

This will create a new migration file like `001_create_users_table.js`:

```javascript
export const createUsersTable = {
  name: '001_create_users_table',
  up: \`
    -- Add your SQL statements here for the migration
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  \`,
  down: \`
    -- Add your SQL statements here to rollback the migration
    DROP TABLE IF EXISTS users;
  \`
};
```

### 2. Manual Migration Creation

1. **Create migration file**: `src/database/migrations/XXX_migration_name.js`
2. **Follow naming convention**: `001_create_users_table.js`
3. **Export migration object** with `name`, `up`, and `down` properties

```javascript
export const migrationName = {
  name: '001_migration_name',
  up: \`
    -- SQL statements to apply the migration
  \`,
  down: \`
    -- SQL statements to rollback the migration
  \`
};
```

### 3. Register Migration

Add your migration to `src/database/migrations/index.js`:

```javascript
// Import your migration
import { createUsersTable } from './001_create_users_table';

// Add to migrations array
export const migrations = [
  createUsersTable,
  // ... other migrations
];
```

## Migration Best Practices

### 1. **Always write rollback SQL**
```javascript
down: \`
  DROP INDEX IF EXISTS idx_users_email;
  DROP TABLE IF EXISTS users;
\`
```

### 2. **Use IF NOT EXISTS for safety**
```javascript
up: \`
  CREATE TABLE IF NOT EXISTS users (...);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
\`
```

### 3. **Order matters**
- Migrations run in array order
- Name files with sequential numbers: `001_`, `002_`, etc.

### 4. **Common Migration Types**

**Creating Tables:**
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Adding Columns:**
```sql
ALTER TABLE users ADD COLUMN phone TEXT;
```

**Creating Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

**Creating Foreign Keys:**
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Running Migrations

### In Your App (App.js or main component):

```javascript
import { initializeDatabase } from './src/models';

export default function App() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        console.log('Database ready!');
      } catch (error) {
        console.error('Database setup failed:', error);
      }
    };
    
    setupDatabase();
  }, []);

  return (
    // Your app content
  );
}
```

### Manual Migration Control:

```javascript
import { runMigrations, rollbackMigration } from './src/database/migrationRunner';
import { migrations } from './src/database/migrations';

// Run all pending migrations
await runMigrations(migrations);

// Rollback specific migration
await rollbackMigration(migrations[0]);
```

## Using Models

### Basic Usage:

```javascript
import { UserModel } from './src/models';

// Create user
const user = await UserModel.create({
  email: 'user@example.com',
  name: 'John Doe',
  user_type: 'mentee'
});

// Find user
const user = await UserModel.findById(1);
const user = await UserModel.findByEmail('user@example.com');

// Update user
await UserModel.update(1, { name: 'Jane Doe' });

// Delete user
await UserModel.delete(1);

// Search users
const users = await UserModel.search('John');
```

### Creating New Models:

```javascript
// src/models/Session.js
import { BaseModel } from './BaseModel';

export class Session extends BaseModel {
  constructor() {
    super('sessions');
  }

  // Custom methods for this model
  async findByMentor(mentorId) {
    return await this.findWhere({ mentor_id: mentorId });
  }

  async findUpcoming() {
    const sql = \`
      SELECT * FROM \${this.tableName}
      WHERE scheduled_at > datetime('now')
      ORDER BY scheduled_at ASC
    \`;
    return await this.query(sql);
  }
}

export const SessionModel = new Session();
```

## Migration Workflow

1. **Plan your change**: Decide what database changes you need
2. **Generate migration**: `node scripts/generate-migration.js your_migration_name`
3. **Write SQL**: Add your up and down SQL statements
4. **Register migration**: Add to migrations/index.js
5. **Test migration**: Run app to test migration works
6. **Commit changes**: Migration is ready for production

## Tips

- **Test rollbacks**: Always test your down migrations work
- **Backup data**: In production, backup before major migrations
- **Incremental changes**: Make small, focused migrations
- **Document complex changes**: Add comments explaining complex SQL
- **Version control**: Commit migrations with descriptive messages
