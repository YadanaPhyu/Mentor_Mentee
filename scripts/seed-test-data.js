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
    enableArithAbort: true,
  },
};

async function ensureUser(email, role, fullName, profileExtras = {}) {
  // Returns { userId }
  // Creates user and profile if missing.
  const now = new Date();
  const safeJson = (obj) => JSON.stringify(obj);

  // Check user
  const userRes = await sql.query`SELECT id FROM Users WHERE email = ${email}`;
  let userId;
  if (userRes.recordset.length === 0) {
    const insertUser = await sql.query`
      INSERT INTO Users (email, password, role, created_at, updated_at)
      VALUES (${email}, 'password123', ${role}, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() as id;
    `;
    userId = insertUser.recordset[0].id;
    console.log(`Created ${role} user ${email} with id ${userId}`);
  } else {
    userId = userRes.recordset[0].id;
    console.log(`Found existing ${role} user ${email} with id ${userId}`);
  }

  // Check profile
  const profRes = await sql.query`SELECT id FROM Profiles WHERE user_id = ${userId}`;
  if (profRes.recordset.length === 0) {
    const {
      bio = null,
      current_title = role === 'mentor' ? 'Senior Engineer' : 'Student',
      current_company = role === 'mentor' ? 'Tech Co' : null,
      hourly_rate = role === 'mentor' ? 0 : null,
      years_of_experience = role === 'mentor' ? 5 : null,
      expertise_areas = role === 'mentor' ? 'Career Coaching;Frontend;System Design' : null,
      availability_status = 'available',
      preferred_meeting_times = null,
      target_role = role === 'mentee' ? 'Software Engineer' : null,
      education = role === 'mentee' ? 'BSc Computer Science' : null,
      location = 'Remote',
    } = profileExtras;

    const insertProfile = await sql.query`
      INSERT INTO Profiles (
        user_id, full_name, bio, current_title, current_company,
        hourly_rate, years_of_experience, expertise_areas, availability_status,
        preferred_meeting_times, target_role, education, location, last_updated
      )
      VALUES (
        ${userId}, ${fullName}, ${bio}, ${current_title}, ${current_company},
        ${hourly_rate}, ${years_of_experience}, ${expertise_areas}, ${availability_status},
        ${preferred_meeting_times}, ${target_role}, ${education}, ${location}, GETDATE()
      );
    `;
    console.log(`Created profile for ${email}`);
  } else {
    // Optionally update preferred_meeting_times if supplied
    if (profileExtras.preferred_meeting_times) {
      await sql.query`
        UPDATE Profiles SET preferred_meeting_times = ${profileExtras.preferred_meeting_times}, last_updated = GETDATE()
        WHERE user_id = ${userId}
      `;
      console.log(`Updated meeting times for ${email}`);
    }
  }

  return { userId };
}

function buildMeetingTimes() {
  // Build 3 days of slots using dd-MM-yyyy format and HH:mm:ss time format
  const options = [
    ['10:00:00', '14:00:00', '16:00:00'],
    ['09:00:00', '13:00:00', '15:00:00'],
    ['11:00:00', '14:00:00', '17:00:00'],
  ];
  const map = {};
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i + 1);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const label = `${dd}-${mm}-${yyyy}`;
    map[label] = options[i];
  }
  return JSON.stringify(map);
}

async function main() {
  try {
    await sql.connect(config);
    console.log('Connected to DB');

    // Seed one mentor and one mentee if missing
    const meetingTimesJson = buildMeetingTimes();

    const mentor = await ensureUser(
      'mentor.demo@example.com',
      'mentor',
      'Demo Mentor',
      {
        current_title: 'Staff Engineer',
        current_company: 'MentorCo',
        hourly_rate: 0, // free session
        years_of_experience: 10,
        expertise_areas: 'Leadership;Career Growth;React Native',
        availability_status: 'available',
        preferred_meeting_times: meetingTimesJson,
      }
    );

    const mentee = await ensureUser(
      'mentee.demo@example.com',
      'mentee',
      'Demo Mentee',
      {
        target_role: 'Mobile Developer',
        education: 'BSc Computer Science',
        availability_status: 'available',
      }
    );

    // Log mentors for visibility
    const mentors = await sql.query`
      SELECT TOP 5 u.id, u.email, p.full_name, p.hourly_rate, p.preferred_meeting_times
      FROM Users u JOIN Profiles p ON u.id = p.user_id
      WHERE u.role = 'mentor'
      ORDER BY u.id DESC
    `;
    console.log('Mentors snapshot:', mentors.recordset.map(m => ({ id: m.id, email: m.email, name: m.full_name, rate: m.hourly_rate })))

    console.log('Seeding complete. Mentor ID:', mentor.userId, 'Mentee ID:', mentee.userId);
    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
