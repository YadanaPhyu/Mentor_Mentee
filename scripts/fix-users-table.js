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
        
        // First, let's check the structure of the Users table
        const tableInfo = await sql.query`
            SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Users'
        `;
        
        console.log('Current Users table structure:', tableInfo.recordset);

        // Add missing columns one by one
        const alterQueries = [
            `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'username')
             BEGIN
                 ALTER TABLE Users ADD username NVARCHAR(255);
             END`,
            
            `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'display_name')
             BEGIN
                 ALTER TABLE Users ADD display_name NVARCHAR(255);
             END`,
            
            `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'last_login')
             BEGIN
                 ALTER TABLE Users ADD last_login DATETIME NULL;
             END`,
            
            `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'created_at')
             BEGIN
                 ALTER TABLE Users ADD created_at DATETIME NOT NULL DEFAULT GETDATE();
             END`,
            
            `IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'updated_at')
             BEGIN
                 ALTER TABLE Users ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
             END`
        ];

        for (const query of alterQueries) {
            console.log('Running query:', query);
            await sql.query(query);
        }

        // Update email constraint if needed
        await sql.query`
            IF NOT EXISTS (
                SELECT * FROM sys.indexes 
                WHERE name = 'UQ_Users_Email' 
                AND object_id = OBJECT_ID('Users')
            )
            BEGIN
                CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
                ON Users(email);
            END
        `;

        // Check if admin user exists
        const adminCheck = await sql.query`
            SELECT id FROM Users WHERE email = 'admin@example.com'
        `;

        if (adminCheck.recordset.length === 0) {
            console.log('Creating admin user...');
            await sql.query`
                INSERT INTO Users (email, password, display_name, role)
                VALUES ('admin@example.com', 'admin123', 'System Administrator', 'admin')
            `;
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        await sql.close();
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        if (err.message) console.error('Error message:', err.message);
        if (err.code) console.error('Error code:', err.code);
        process.exit(1);
    }
}

runMigration();