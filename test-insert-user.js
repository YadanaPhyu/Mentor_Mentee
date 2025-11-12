const sql = require('mssql');
require('dotenv').config();

(async () => {
  try {
    const cfg = {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: { trustServerCertificate: true, encrypt: false },
    };
    await sql.connect(cfg);
    const q = `
      INSERT INTO Users (email, password, role, created_at, updated_at)
      VALUES ('temp.user@example.com', 'pass', 'mentee', GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `;
    const res = await sql.query(q);
    console.log('Inserted user with ID:', res.recordset[0].id);
    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
