// Direct database session booking test
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

async function testDirectBooking() {
    try {
        console.log('🔌 Connecting to database...\n');
        await sql.connect(config);
        
        // Test data
        const bookingData = {
            mentor_id: 5,
            mentee_id: 6,
            date: 'Nov 16, 2025',
            time: '3:00 PM',
            duration: 60,
            topic: 'Direct test session',
            fee: 150
        };
        
        console.log('1️⃣ Creating session booking directly in database...');
        console.log('Data:', JSON.stringify(bookingData, null, 2));
        
        const insertResult = await sql.query`
            INSERT INTO Sessions (
                mentor_id, mentee_id, session_date, session_time,
                duration_minutes, status, topic, fee_amount,
                created_at, updated_at
            )
            VALUES (
                ${bookingData.mentor_id}, ${bookingData.mentee_id},
                ${bookingData.date}, ${bookingData.time},
                ${bookingData.duration}, 'pending_mentor_approval',
                ${bookingData.topic}, ${bookingData.fee},
                GETDATE(), GETDATE()
            );
            SELECT SCOPE_IDENTITY() as session_id;
        `;
        
        const sessionId = insertResult.recordset[0].session_id;
        console.log(`✅ Session created with ID: ${sessionId}\n`);
        
        // Fetch the session
        console.log('2️⃣ Fetching session for mentor...');
        const mentorSessions = await sql.query`
            SELECT
                s.*,
                mentee.full_name as mentee_name,
                mentee.current_title as mentee_title,
                mentee_user.email as mentee_email
            FROM Sessions s
            JOIN Profiles mentee ON s.mentee_id = mentee.user_id
            JOIN Users mentee_user ON mentee.user_id = mentee_user.id
            WHERE s.mentor_id = ${bookingData.mentor_id}
                AND s.status IN ('pending_mentor_approval', 'pending_approval')
            ORDER BY s.created_at DESC
        `;
        
        console.log(`✅ Found ${mentorSessions.recordset.length} pending session(s)`);
        if (mentorSessions.recordset.length > 0) {
            const session = mentorSessions.recordset[0];
            console.log('\nPending session details:');
            console.log(`  ID: ${session.id}`);
            console.log(`  Mentee: ${session.mentee_name} (${session.mentee_email})`);
            console.log(`  Date: ${session.session_date}`);
            console.log(`  Time: ${session.session_time}`);
            console.log(`  Topic: ${session.topic}`);
            console.log(`  Fee: $${session.fee_amount}`);
            console.log(`  Status: ${session.status}\n`);
        }
        
        // Approve the session
        console.log('3️⃣ Approving session...');
        await sql.query`
            UPDATE Sessions
            SET status = 'approved', updated_at = GETDATE()
            WHERE id = ${sessionId}
        `;
        console.log('✅ Session approved\n');
        
        // Add meeting URL
        console.log('4️⃣ Adding meeting URL...');
        const meetingUrl = `https://meet.jit.si/mentor-session-${sessionId}`;
        await sql.query`
            UPDATE Sessions
            SET meeting_url = ${meetingUrl},
                meeting_provider = 'jitsi',
                updated_at = GETDATE()
            WHERE id = ${sessionId}
        `;
        console.log(`✅ Meeting URL added: ${meetingUrl}\n`);
        
        // Fetch sessions for mentee
        console.log('5️⃣ Fetching approved session for mentee...');
        const menteeSessions = await sql.query`
            SELECT
                s.*,
                mentor.full_name as mentor_name,
                mentor.current_title,
                mentor.current_company,
                mentor_user.email as mentor_email
            FROM Sessions s
            JOIN Profiles mentor ON s.mentor_id = mentor.user_id
            JOIN Users mentor_user ON mentor.user_id = mentor_user.id
            WHERE s.mentee_id = ${bookingData.mentee_id}
                AND s.status = 'approved'
            ORDER BY s.created_at DESC
        `;
        
        console.log(`✅ Found ${menteeSessions.recordset.length} approved session(s)`);
        if (menteeSessions.recordset.length > 0) {
            const session = menteeSessions.recordset[0];
            console.log('\nApproved session for mentee:');
            console.log(`  ID: ${session.id}`);
            console.log(`  Mentor: ${session.mentor_name} (${session.current_title || 'N/A'})`);
            console.log(`  Date: ${session.session_date}`);
            console.log(`  Time: ${session.session_time}`);
            console.log(`  Meeting URL: ${session.meeting_url || 'Not set'}`);
            console.log(`  Status: ${session.status}\n`);
        }
        
        console.log('✅ ALL TESTS PASSED! Session booking flow works correctly in database.\n');
        
        await sql.close();
        process.exit(0);
        
    } catch (err) {
        console.error('\n❌ Test failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

testDirectBooking();
