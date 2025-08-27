const sql = require('mssql');
require('dotenv').config();

async function testConnection() {
    try {
        // Try different connection configurations
        const configs = [
            // Config 1: Basic
            {
                server: 'localhost\\SQLEXPRESS',
                database: process.env.DB_DATABASE,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                options: {
                    trustServerCertificate: true
                }
            },
            // Config 2: With specific dynamic port
            {
                server: 'localhost',
                port: 60595,
                database: process.env.DB_DATABASE,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                options: {
                    trustServerCertificate: true,
                    encrypt: false
                }
            },
            // Config 3: Connection string
            {
                connectionString: `Server=localhost\\SQLEXPRESS;Database=${process.env.DB_DATABASE};User Id=${process.env.DB_USER};Password=${process.env.DB_PASSWORD};TrustServerCertificate=True`
            }
        ];

        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            console.log(`\nTrying configuration ${i + 1}:`, config);
            
            try {
                const pool = await sql.connect(config);
                console.log('Connection successful!');
                const result = await pool.request().query('SELECT @@VERSION as version');
                console.log('SQL Server version:', result.recordset[0].version);
                await pool.close();
                break;
            } catch (err) {
                console.log(`Configuration ${i + 1} failed:`, err.message);
                continue;
            }
        }
    } catch (err) {
        console.error('All configurations failed:', err);
    } finally {
        await sql.close();
    }
}

testConnection();
