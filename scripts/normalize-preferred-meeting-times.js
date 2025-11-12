const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { trustServerCertificate: true, encrypt: false, enableArithAbort: true },
};

// Format date as dd-MM-yyyy
function toDateString(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// Format time as HH:mm:ss (24-hour format)
function normalizeTimeLabel(str) {
  const time = String(str).trim();
  
  // Try to parse 12-hour format (e.g., "2:00 PM", "10:00 AM")
  const match12h = time.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*([APap][Mm])$/);
  if (match12h) {
    let [_, hStr, mStr, sStr, ap] = match12h;
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr || '00', 10);
    const s = parseInt(sStr || '00', 10);
    
    // Convert to 24-hour
    if (ap.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ap.toUpperCase() === 'AM' && h === 12) h = 0;
    
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  // Already in 24-hour format (e.g., "14:00" or "14:00:00")
  const match24h = time.match(/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/);
  if (match24h) {
    let [_, hStr, mStr, sStr] = match24h;
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '00', 10);
    const s = parseInt(sStr || '00', 10);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  // Fallback - return as-is
  return time;
}

function parseDateKey(key) {
  // Try to parse a variety of formats safely
  const str = String(key).trim();
  
  // Try dd-MM-yyyy format first (target format)
  let match = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const dd = parseInt(match[1], 10);
    const mm = parseInt(match[2], 10);
    const yyyy = parseInt(match[3], 10);
    return new Date(yyyy, mm - 1, dd);
  }
  
  // Try "Nov 12" abbreviated format
  const monthNames = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  match = str.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (match) {
    const monthIdx = monthNames[match[1]];
    const day = parseInt(match[2], 10);
    if (monthIdx !== undefined) {
      // Use current year if parsing abbreviated format
      const year = new Date().getFullYear();
      return new Date(year, monthIdx, day);
    }
  }
  
  // Try ISO or other standard formats
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  
  return null;
}

function normalizePreferredMeetingTimes(obj) {
  const normalized = {};
  const entries = Object.entries(obj || {});
  for (const [key, times] of entries) {
    const date = parseDateKey(key);
    if (!date) {
      console.warn(`Could not parse date key: ${key}, skipping`);
      continue;
    }
    const label = toDateString(date); // dd-MM-yyyy format
    const newTimes = Array.isArray(times) ? times.map(normalizeTimeLabel) : [];
    if (newTimes.length > 0) normalized[label] = newTimes;
  }
  return normalized;
}

async function run() {
  try {
    await sql.connect(config);
    console.log('Connected to DB');

    const mentors = await sql.query`
      SELECT u.id as user_id, u.email, p.preferred_meeting_times
      FROM Users u JOIN Profiles p ON p.user_id = u.id
      WHERE u.role = 'mentor'
    `;

    let updated = 0;
    for (const row of mentors.recordset) {
      const curr = row.preferred_meeting_times;
      if (!curr) continue;
      let parsed;
      try {
        parsed = JSON.parse(curr);
      } catch (_) {
        // Skip malformed here; could also replace with default 7-day slots
        continue;
      }
      const normalized = normalizePreferredMeetingTimes(parsed);
      const newJson = JSON.stringify(normalized);
      if (newJson !== curr) {
        await sql.query`
          UPDATE Profiles
          SET preferred_meeting_times = ${newJson}, last_updated = GETDATE()
          WHERE user_id = ${row.user_id}
        `;
        updated++;
        console.log(`Normalized mentor ${row.email}`);
      }
    }

    console.log(`Normalization complete. Updated ${updated} mentor(s).`);
    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error normalizing meeting times:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
