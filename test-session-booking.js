const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function testSessionBookingFlow() {
    console.log('🧪 Testing Session Booking Flow\n');
    
    try {
        // Step 1: Book a session as a mentee
        console.log('1️⃣ Booking a session...');
        const bookingData = {
            mentor_id: 5, // test.mentor@example.com
            mentee_id: 6, // test.mentee@example.com
            date: 'Nov 15, 2025',
            time: '2:00 PM',
            duration: 60,
            topic: 'Career guidance session',
            fee: 100
        };
        
        console.log('   Request:', JSON.stringify(bookingData, null, 2));
        
        const bookResponse = await fetch(`${API_URL}/api/sessions/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        
        if (!bookResponse.ok) {
            const error = await bookResponse.text();
            throw new Error(`Booking failed: ${error}`);
        }
        
        const bookResult = await bookResponse.json();
        console.log('   ✅ Session booked successfully!');
        console.log('   Session ID:', bookResult.session_id);
        const sessionId = bookResult.session_id;
        
        // Step 2: Fetch mentor's sessions
        console.log('\n2️⃣ Fetching mentor\'s session requests...');
        const mentorSessionsResponse = await fetch(`${API_URL}/api/sessions/user/5?role=mentor`);
        
        if (!mentorSessionsResponse.ok) {
            throw new Error('Failed to fetch mentor sessions');
        }
        
        const mentorSessions = await mentorSessionsResponse.json();
        console.log(`   ✅ Found ${mentorSessions.length} session(s) for mentor`);
        
        const pendingSessions = mentorSessions.filter(s => 
            s.status === 'pending_mentor_approval' || s.status === 'pending_approval'
        );
        console.log(`   📋 Pending sessions: ${pendingSessions.length}`);
        
        if (pendingSessions.length > 0) {
            const session = pendingSessions[0];
            console.log('   Latest pending session:');
            console.log(`      - ID: ${session.id}`);
            console.log(`      - Mentee: ${session.mentee_name}`);
            console.log(`      - Date: ${session.session_date}`);
            console.log(`      - Time: ${session.session_time}`);
            console.log(`      - Status: ${session.status}`);
        }
        
        // Step 3: Approve the session
        console.log('\n3️⃣ Approving the session...');
        const approveResponse = await fetch(`${API_URL}/api/sessions/${sessionId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (!approveResponse.ok) {
            const error = await approveResponse.text();
            throw new Error(`Approval failed: ${error}`);
        }
        
        const approveResult = await approveResponse.json();
        console.log('   ✅ Session approved!');
        console.log('   Updated status:', approveResult.session.status);
        
        // Step 4: Add meeting URL
        console.log('\n4️⃣ Adding video meeting URL...');
        const meetingUrl = `https://meet.jit.si/mentor-session-${sessionId}`;
        const meetingResponse = await fetch(`${API_URL}/api/sessions/${sessionId}/meeting`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                meeting_url: meetingUrl,
                meeting_provider: 'jitsi'
            })
        });
        
        if (!meetingResponse.ok) {
            const error = await meetingResponse.text();
            throw new Error(`Meeting URL update failed: ${error}`);
        }
        
        const meetingResult = await meetingResponse.json();
        console.log('   ✅ Meeting URL added!');
        console.log('   Meeting URL:', meetingResult.session.meeting_url);
        
        // Step 5: Fetch mentee's sessions
        console.log('\n5️⃣ Fetching mentee\'s sessions...');
        const menteeSessionsResponse = await fetch(`${API_URL}/api/sessions/user/6?role=mentee`);
        
        if (!menteeSessionsResponse.ok) {
            throw new Error('Failed to fetch mentee sessions');
        }
        
        const menteeSessions = await menteeSessionsResponse.json();
        console.log(`   ✅ Found ${menteeSessions.length} session(s) for mentee`);
        
        const approvedSessions = menteeSessions.filter(s => s.status === 'approved');
        console.log(`   📅 Approved sessions: ${approvedSessions.length}`);
        
        if (approvedSessions.length > 0) {
            const session = approvedSessions[0];
            console.log('   Latest approved session:');
            console.log(`      - ID: ${session.id}`);
            console.log(`      - Mentor: ${session.mentor_name}`);
            console.log(`      - Date: ${session.session_date}`);
            console.log(`      - Time: ${session.session_time}`);
            console.log(`      - Meeting URL: ${session.meeting_url || 'Not set'}`);
        }
        
        console.log('\n✅ All tests passed! Session booking flow is working correctly.\n');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testSessionBookingFlow();
