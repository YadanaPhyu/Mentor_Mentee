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
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

async function connectDB() {
    try {
        console.log('Attempting to connect to database with config:', {
            server: config.server,
            database: config.database,
            user: config.user,
            options: config.options
        });
        
        await sql.connect(config);
        console.log('Connected to MSSQL database successfully');
        
        // Test the connection
        const result = await sql.query`SELECT 1 as test`;
        console.log('Test query result:', result);
        
        return sql;
    } catch (err) {
        console.error('Database connection failed with error:', {
            message: err.message,
            code: err.code,
            state: err.state,
            originalError: err.originalError
        });
        throw err;
    }
}

module.exports = { sql, connectDB };
