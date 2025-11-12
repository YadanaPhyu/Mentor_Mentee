const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true,
        connectTimeout: 30000,
        port: parseInt(process.env.DB_PORT) || 1433,
        instanceName: process.env.DB_SERVER?.includes('\\') ? process.env.DB_SERVER.split('\\')[1] : undefined
    }
};

async function runMigration() {
    try {
        console.log('Connecting to database...');
        await sql.connect(config);
        
        // Users table updates
        const usersMigration = `
            IF NOT EXISTS (
                SELECT * FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'dbo' 
                AND TABLE_NAME = 'Users'
            )
            BEGIN
                CREATE TABLE Users (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    email NVARCHAR(255) NOT NULL,
                    password NVARCHAR(255) NOT NULL,
                    name NVARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    last_login DATETIME NULL,
                    created_at DATETIME NOT NULL DEFAULT GETDATE(),
                    updated_at DATETIME NOT NULL DEFAULT GETDATE()
                );

                CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
                ON Users(email);

                ALTER TABLE Users
                ADD CONSTRAINT CHK_Users_Role 
                CHECK (role IN ('admin', 'mentor', 'mentee'));
            END
            ELSE
            BEGIN
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
                    AND name = 'last_login'
                )
                BEGIN
                    ALTER TABLE Users
                    ADD last_login DATETIME NULL;
                END

                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
                    AND name = 'created_at'
                )
                BEGIN
                    ALTER TABLE Users
                    ADD created_at DATETIME NOT NULL DEFAULT GETDATE();
                END

                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
                    AND name = 'updated_at'
                )
                BEGIN
                    ALTER TABLE Users
                    ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
                END

                -- Add unique constraint on email if it doesn't exist
                IF NOT EXISTS (
                    SELECT * FROM sys.indexes 
                    WHERE name = 'UQ_Users_Email' 
                    AND object_id = OBJECT_ID('Users')
                )
                BEGIN
                    CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
                    ON Users(email);
                END
            END
        `;

        console.log('Running Users table migration...');
        await sql.query(usersMigration);
        console.log('Users table migration completed successfully');

        // Insert admin user if it doesn't exist
        const adminInsert = `
            IF NOT EXISTS (
                SELECT * FROM Users WHERE email = 'admin@example.com'
            )
            BEGIN
                INSERT INTO Users (email, password, name, role)
                VALUES ('admin@example.com', 'admin123', 'System Administrator', 'admin');
            END
        `;

        console.log('Inserting admin user...');
        await sql.query(adminInsert);
        console.log('Admin user created/verified successfully');

        await sql.close();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();