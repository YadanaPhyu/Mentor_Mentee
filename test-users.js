const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        trustServerCertificate: true,
        encrypt: false,
        enableArithAbort: true
    }
};

async function checkUsers() {
    try {
        await sql.connect(config);
        console.log('Connected to database\n');
        
        // Get all users with profiles
        const result = await sql.query`
            SELECT u.id, u.email, u.role, p.full_name, p.current_title, p.hourly_rate
            FROM Users u
            LEFT JOIN Profiles p ON u.id = p.user_id
            WHERE u.role IN ('mentor', 'mentee')
            ORDER BY u.role, u.id
        `;
        
        console.log('=== Available Test Users ===\n');
        result.recordset.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Name: ${user.full_name || 'No profile'}`);
            if (user.role === 'mentor') {
                console.log(`Title: ${user.current_title || 'N/A'}`);
                console.log(`Rate: $${user.hourly_rate || 0}/hr`);
            }
            console.log('---');
        });
        
        // Check for existing sessions
        const sessions = await sql.query`
            SELECT COUNT(*) as count FROM Sessions
        `;
        
        console.log(`\nTotal sessions in database: ${sessions.recordset[0].count}`);
        
        await sql.close();
    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

checkUsers();
