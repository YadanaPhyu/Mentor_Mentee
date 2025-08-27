const sql = require('mssql');
const fs = require('fs').promises;
const path = require('path');
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
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

async function runMigration() {
    try {
        // Connect to database
        await sql.connect(config);
        console.log('Connected to database');

        // Read and execute the migration file
        const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '005_add_profile_fields.sql');
        const migrationSql = await fs.readFile(migrationPath, 'utf8');

        // Split the migration into individual statements
        const statements = migrationSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        // Execute each statement
        for (const statement of statements) {
            if (!statement.trim()) continue;
            try {
                await sql.query(statement);
                console.log('Successfully executed:', statement.trim());
            } catch (err) {
                console.error('Error executing statement:', statement.trim());
                console.error('Error details:', err);
                throw err;
            }
        }

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await sql.close();
    }
}

runMigration();
