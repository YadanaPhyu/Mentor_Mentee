const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { trustServerCertificate: true, encrypt: false, enableArithAbort: true },
};

// Build meeting times in unified dd-MM-yyyy format with HH:mm:ss time
// This matches the standardized format for consistent date/time handling.
function buildMeetingTimes(days = 7) {
  // Rotating slot templates (can expand as needed)
  const templates = [
    ['10:00:00', '14:00:00', '16:00:00'],
    ['09:00:00', '13:00:00', '15:00:00'],
    ['11:00:00', '14:00:00', '17:00:00'],
    ['10:00:00', '13:00:00', '17:00:00'],
  ];
  const map = {};
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const label = `${dd}-${mm}-${yyyy}`;
    map[label] = templates[i % templates.length];
  }
  return JSON.stringify(map);
}

async function run() {
  try {
    await sql.connect(config);
    console.log('Connected to DB');

  // Unified date label + slot format for all mentors
  const meetingTimes = buildMeetingTimes(7);

    // Update all mentors missing meeting times and set availability_status
    // Update mentors missing OR having inconsistent date labels (non dd-MM-yyyy pattern) OR malformed JSON
    // We detect inconsistent formats by checking if keys match dd-MM-yyyy pattern
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;

    // Pull existing mentors to evaluate which need normalization
    const existingMentors = await sql.query`
      SELECT u.id as user_id, p.preferred_meeting_times, p.availability_status
      FROM Users u
      JOIN Profiles p ON p.user_id = u.id
      WHERE u.role = 'mentor'
    `;

    let normalizedCount = 0;
    for (const row of existingMentors.recordset) {
      const current = row.preferred_meeting_times;
      let needsUpdate = false;
      if (!current || current.trim() === '') {
        needsUpdate = true;
      } else {
        try {
          const obj = JSON.parse(current);
          const keys = Object.keys(obj);
          if (keys.length === 0) {
            needsUpdate = true;
          } else {
            // Check first key for dd-MM-yyyy format
            const firstKey = keys[0];
            if (!datePattern.test(firstKey)) {
              needsUpdate = true;
            }
          }
        } catch (e) {
          needsUpdate = true; // malformed JSON
        }
      }
      if (needsUpdate) {
        await sql.query`
          UPDATE Profiles
          SET preferred_meeting_times = ${meetingTimes},
              availability_status = 'available',
              last_updated = GETDATE()
          WHERE user_id = ${row.user_id}
        `;
        normalizedCount++;
      }
    }

    console.log(`Normalized meeting times for ${normalizedCount} mentor(s).`);

  console.log('Mentor availability normalization complete.');

    // Show snapshot of mentors
    const mentors = await sql.query`
      SELECT TOP 10 u.id, u.email, p.full_name, p.availability_status, p.preferred_meeting_times
      FROM Users u JOIN Profiles p ON u.id = p.user_id
      WHERE u.role = 'mentor'
      ORDER BY u.id DESC
    `;

    mentors.recordset.forEach(m => {
      console.log({ id: m.id, email: m.email, name: m.full_name, availability_status: m.availability_status });
    });

    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
