# Local Database Server Setup Guide

## Option 1: MySQL (Recommended for beginners)

### Install MySQL
```bash
# Windows (using Chocolatey)
choco install mysql

# Or download from: https://dev.mysql.com/downloads/installer/

# macOS (using Homebrew)
brew install mysql

# Start MySQL service
mysql.server start  # macOS
net start mysql     # Windows
```

### Setup Database
```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE mentor_mentee;

-- Create user
CREATE USER 'mentee_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mentor_mentee.* TO 'mentee_user'@'localhost';
FLUSH PRIVILEGES;
```

### Connection Details
- **Host:** localhost
- **Port:** 3306
- **Database:** mentor_mentee
- **Username:** mentee_user
- **Password:** your_password

## Option 2: PostgreSQL

### Install PostgreSQL
```bash
# Windows
choco install postgresql

# macOS
brew install postgresql

# Start service
brew services start postgresql  # macOS
pg_ctl start                   # Windows
```

### Setup Database
```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE mentor_mentee;

-- Create user
CREATE USER mentee_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE mentor_mentee TO mentee_user;
```

### Connection Details
- **Host:** localhost
- **Port:** 5432
- **Database:** mentor_mentee
- **Username:** mentee_user
- **Password:** your_password

## Option 3: Docker (Easy setup)

### MySQL with Docker
```bash
# Run MySQL container
docker run --name mentor-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=mentor_mentee \
  -e MYSQL_USER=mentee_user \
  -e MYSQL_PASSWORD=userpassword \
  -p 3306:3306 \
  -d mysql:8.0

# Connect
mysql -h localhost -P 3306 -u mentee_user -p mentor_mentee
```

### PostgreSQL with Docker
```bash
# Run PostgreSQL container
docker run --name mentor-postgres \
  -e POSTGRES_DB=mentor_mentee \
  -e POSTGRES_USER=mentee_user \
  -e POSTGRES_PASSWORD=userpassword \
  -p 5432:5432 \
  -d postgres:15

# Connect
psql -h localhost -p 5432 -U mentee_user -d mentor_mentee
```

## Database Management Tools

### MySQL
- **phpMyAdmin:** Web-based admin panel
- **MySQL Workbench:** Official GUI tool
- **HeidiSQL:** Windows GUI tool

### PostgreSQL
- **pgAdmin:** Official web-based admin
- **DBeaver:** Cross-platform GUI tool

### Universal Tools
- **TablePlus:** Premium GUI (Mac/Windows)
- **DataGrip:** JetBrains IDE
- **VS Code Extensions:** SQLite/MySQL/PostgreSQL

## Environment Configuration

Create `.env` file in your project:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mentor_mentee
DB_USER=mentee_user
DB_PASSWORD=your_password
DB_TYPE=mysql

# SQLite (alternative)
SQLITE_PATH=./database.sqlite
```

## Next Steps

After setting up your local database:

1. **Choose your database library:**
   - MySQL: `mysql2` or `knex.js`
   - PostgreSQL: `pg` or `knex.js`
   - ORM: `prisma`, `typeorm`, or `sequelize`

2. **Update your migration system** to work with your chosen database

3. **Create API endpoints** (if building a backend)

4. **Connect your React Native app** to the API (instead of local SQLite)
