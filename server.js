const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./src/database/mssqlConfig');

const app = express();
const port = process.env.API_PORT || 3000;

// Configure CORS
app.use(cors({
    origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:19006', 'http://localhost:3000', 'http://10.0.2.2:3000'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Connect to database
connectDB().then(() => {
    console.log('Database connection established');
    
    // Start listening only after database is connected
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        // Check if user already exists
        const checkUser = await sql.query`
            SELECT id FROM Users WHERE email = ${email}
        `;
        
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const userResult = await sql.query`
            INSERT INTO Users (email, password, role)
            VALUES (${email}, ${password}, ${role});
            SELECT SCOPE_IDENTITY() as id;
        `;
        
        const userId = userResult.recordset[0].id;

        // Create profile
        await sql.query`
            INSERT INTO Profiles (user_id, full_name)
            VALUES (${userId}, ${name});
        `;

        res.json({ 
            id: userId,
            email,
            name,
            role
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await sql.query`
            SELECT u.id, u.email, u.role, p.full_name as name
            FROM Users u
            LEFT JOIN Profiles p ON u.id = p.user_id
            WHERE u.email = ${email} AND u.password = ${password}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.recordset[0];
        res.json(user);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Users endpoints
app.get('/api/users', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Users`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const result = await sql.query`
            INSERT INTO Users (email, password, role)
            VALUES (${email}, ${password}, ${role});
            SELECT SCOPE_IDENTITY() as id;
        `;
        res.json({ id: result.recordset[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Profiles endpoints
app.get('/api/profiles/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await sql.query`
            SELECT * FROM Profiles WHERE user_id = ${userId}
        `;
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/profiles', async (req, res) => {
    const { userId, fullName, bio, skills, interests, experienceLevel } = req.body;
    try {
        const result = await sql.query`
            INSERT INTO Profiles (user_id, full_name, bio, skills, interests, experience_level)
            VALUES (${userId}, ${fullName}, ${bio}, ${skills}, ${interests}, ${experienceLevel});
            SELECT SCOPE_IDENTITY() as id;
        `;
        res.json({ id: result.recordset[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update profile endpoint
app.put('/api/profiles/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
        // Common fields
        full_name, bio, skills, experience_level, profile_image,
        phone, location, linkedin_url, github_url, portfolio_url,
        current_company, current_title, industry,
        // Mentor specific fields
        availability_status, hourly_rate, years_of_experience,
        expertise_areas, preferred_communication,
        // Mentee specific fields
        career_goals, preferred_meeting_times, learning_style, target_role
    } = req.body;
    
    try {
        // First check if profile exists
        const checkProfile = await sql.query`
            SELECT p.*, u.role 
            FROM Profiles p
            JOIN Users u ON p.user_id = u.id
            WHERE p.user_id = ${userId}
        `;

        if (checkProfile.recordset.length === 0) {
            // Create profile if it doesn't exist
            await sql.query`
                INSERT INTO Profiles (
                    user_id, full_name, bio, skills, experience_level, profile_image,
                    phone, location, linkedin_url, github_url, portfolio_url,
                    current_company, current_title, industry,
                    availability_status, hourly_rate, years_of_experience,
                    expertise_areas, preferred_communication,
                    career_goals, preferred_meeting_times, learning_style, target_role,
                    last_updated
                )
                VALUES (
                    ${userId}, ${full_name}, ${bio}, ${skills}, ${experience_level}, ${profile_image},
                    ${phone}, ${location}, ${linkedin_url}, ${github_url}, ${portfolio_url},
                    ${current_company}, ${current_title}, ${industry},
                    ${availability_status}, ${hourly_rate}, ${years_of_experience},
                    ${expertise_areas}, ${preferred_communication},
                    ${career_goals}, ${preferred_meeting_times}, ${learning_style}, ${target_role},
                    GETDATE()
                )
            `;
        } else {
            // Update existing profile
            await sql.query`
                UPDATE Profiles
                SET full_name = ${full_name},
                    bio = ${bio},
                    skills = ${skills},
                    experience_level = ${experience_level},
                    profile_image = COALESCE(${profile_image}, profile_image),
                    phone = ${phone},
                    location = ${location},
                    linkedin_url = ${linkedin_url},
                    github_url = ${github_url},
                    portfolio_url = ${portfolio_url},
                    current_company = ${current_company},
                    current_title = ${current_title},
                    industry = ${industry},
                    availability_status = ${availability_status},
                    hourly_rate = ${hourly_rate},
                    years_of_experience = ${years_of_experience},
                    expertise_areas = ${expertise_areas},
                    preferred_communication = ${preferred_communication},
                    career_goals = ${career_goals},
                    preferred_meeting_times = ${preferred_meeting_times},
                    learning_style = ${learning_style},
                    target_role = ${target_role},
                    last_updated = GETDATE()
                WHERE user_id = ${userId}
            `;

        // Fetch and return updated profile
            // Fetch and return updated profile
            const result = await sql.query`
                SELECT p.*, u.email, u.role
                FROM Profiles p
                JOIN Users u ON p.user_id = u.id
                WHERE p.user_id = ${userId}
            `;
            
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get available mentors endpoint
app.get('/api/mentors', async (req, res) => {
    try {
        console.log('GET /api/mentors - Request received', { 
            query: req.query,
            headers: req.headers 
        });
        const { search, skills, availability, limit = 20 } = req.query;
        
        // Use parameterized query to prevent SQL injection and syntax errors
        let baseQuery = `
            SELECT 
                u.id as user_id,
                p.id as profile_id,
                p.full_name,
                p.bio,
                p.location,
                p.skills,
                p.availability_status,
                p.hourly_rate,
                p.expertise_areas,
                p.years_of_experience,
                p.preferred_communication,
                p.preferred_meeting_times,
                p.linkedin_url,
                p.github_url,
                u.created_at,
                p.current_company,
                p.current_title
            FROM 
                Users u
            LEFT JOIN 
                Profiles p ON u.id = p.user_id
            WHERE 
                u.role = 'mentor'
        `;

        // Use parameterized queries with request object for safety
        const request = new sql.Request();
        
        // Add search filter if provided
        if (search) {
            baseQuery += ` 
                AND (
                    p.full_name LIKE @search
                    OR p.bio LIKE @search
                    OR p.skills LIKE @search
                    OR p.expertise_areas LIKE @search
                    OR p.current_title LIKE @search
                    OR p.current_company LIKE @search
                )
            `;
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        // Add availability filter - using availability_status from Profiles table
        if (availability) {
            baseQuery += ` AND p.availability_status = @availability`;
            request.input('availability', sql.NVarChar, availability);
        } else {
            // Default to available mentors
            baseQuery += ` AND (p.availability_status = 'available' OR p.availability_status IS NULL)`;
        }
        
        // Add skills filter if provided
        if (skills) {
            const skillsArray = skills.split(',');
            const skillConditions = [];
            
            for (let i = 0; i < skillsArray.length; i++) {
                const paramName = `skill${i}`;
                skillConditions.push(`(p.skills LIKE @${paramName} OR p.expertise_areas LIKE @${paramName})`);
                request.input(paramName, sql.NVarChar, `%${skillsArray[i].trim()}%`);
            }
            
            baseQuery += ` AND (${skillConditions.join(' OR ')})`;
        }
        
        // Add order by and limit - using MS SQL Server specific syntax
        baseQuery += `
            ORDER BY p.full_name
            OFFSET 0 ROWS
            FETCH NEXT @limit ROWS ONLY
        `;
        request.input('limit', sql.Int, parseInt(limit));
        
        // Execute the query with parameters
        const result = await request.query(baseQuery);
        
        console.log(`Found ${result.recordset.length} mentors`);
        
        // Return the results
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching mentors:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get a single mentor's details by ID
app.get('/api/mentors/:mentorId', async (req, res) => {
    try {
        const mentorId = req.params.mentorId;
        if (!mentorId) {
            return res.status(400).json({ error: 'Mentor ID is required' });
        }

        const request = new sql.Request();
        request.input('mentorId', sql.Int, mentorId);
        
        const result = await request.query(`
            SELECT 
                u.id as user_id,
                p.id as profile_id,
                p.full_name,
                p.bio,
                p.location,
                p.skills,
                p.availability_status,
                p.hourly_rate,
                p.expertise_areas,
                p.years_of_experience,
                p.preferred_communication,
                p.preferred_meeting_times,
                p.linkedin_url,
                p.github_url,
                u.created_at,
                p.current_company,
                p.current_title,
                (SELECT COUNT(*) FROM Sessions WHERE mentor_id = u.id) as total_sessions,
                4.5 as rating -- Using hardcoded rating for now until we implement a proper rating system
            FROM 
                Users u
            JOIN 
                Profiles p ON u.id = p.user_id
            WHERE 
                u.id = @mentorId AND u.role = 'mentor'
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching mentor details:', err);
        res.status(500).json({ error: err.message });
    }
});

// [DEPRECATED] Create a new session booking request - This endpoint is deprecated and redirects to the new one
app.post('/api/sessions/book_old', async (req, res) => {
    try {
        console.log('[DEPRECATED] Old session booking endpoint called');
        const { 
            mentorId,
            menteeId,
            sessionDate,
            sessionTime,
            sessionDuration,
            topic,
            sessionFee
        } = req.body;
        
        if (!mentorId || !menteeId) {
            return res.status(400).json({ error: 'Mentor ID and Mentee ID are required' });
        }
        
        if (!sessionDate || !sessionTime) {
            return res.status(400).json({ error: 'Session date and time are required' });
        }
        
        // Create a new session record with pending status
        const request = new sql.Request();
        
        // Set parameters
        request.input('mentorId', sql.Int, mentorId);
        request.input('menteeId', sql.Int, menteeId);
        request.input('sessionDate', sql.Date, new Date(sessionDate));
        request.input('sessionTime', sql.VarChar, sessionTime);
        request.input('sessionDuration', sql.Int, sessionDuration || 60);
        request.input('topic', sql.NVarChar, topic || 'General mentoring session');
        request.input('sessionFee', sql.Decimal(10, 2), sessionFee || 0);
        
        // Use parameterized query to prevent SQL injection
        const result = await request.query(`
            INSERT INTO Sessions (
                mentor_id,
                mentee_id,
                session_date,
                session_time,
                duration_minutes,
                topic,
                fee_amount,
                status,
                created_at
            )
            VALUES (
                @mentorId,
                @menteeId,
                @sessionDate,
                @sessionTime,
                @sessionDuration,
                @topic,
                @sessionFee,
                'pending_approval',
                GETDATE()
            );
            
            SELECT SCOPE_IDENTITY() as id;
        `);
        
        const sessionId = result.recordset[0].id;
        
        // Return the created session data
        request.input('sessionId', sql.Int, sessionId);
        const getSessionResult = await request.query(`
            SELECT 
                s.*,
                m_user.email as mentor_email,
                m_profile.full_name as mentor_name,
                e_user.email as mentee_email,
                e_profile.full_name as mentee_name
            FROM 
                Sessions s
            JOIN 
                Users m_user ON s.mentor_id = m_user.id
            JOIN 
                Profiles m_profile ON m_user.id = m_profile.user_id
            JOIN 
                Users e_user ON s.mentee_id = e_user.id
            JOIN 
                Profiles e_profile ON e_user.id = e_profile.user_id
            WHERE 
                s.id = @sessionId
        `);
        
        if (getSessionResult.recordset.length === 0) {
            return res.status(500).json({ error: 'Failed to create session' });
        }
        
        res.status(201).json({
            message: 'Session booking request created successfully',
            session: getSessionResult.recordset[0]
        });
        
    } catch (err) {
        console.error('Error creating session booking:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sessions for a user (as mentor or mentee)
app.get('/api/sessions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role, status } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const request = new sql.Request();
        request.input('userId', sql.Int, userId);
        
        let query = `
            SELECT 
                s.id,
                s.mentor_id,
                s.mentee_id,
                s.session_date,
                s.session_time,
                s.duration_minutes,
                s.topic,
                s.session_fee,
                s.status,
                s.created_at,
                s.updated_at,
                s.meeting_url,
                s.mentor_rating,
                s.mentee_rating,
                s.mentor_feedback,
                s.mentee_feedback,
                m_profile.full_name as mentor_name,
                e_profile.full_name as mentee_name,
                m_profile.current_title as mentor_title,
                e_profile.current_title as mentee_title
            FROM 
                Sessions s
            JOIN 
                Users m_user ON s.mentor_id = m_user.id
            JOIN 
                Profiles m_profile ON m_user.id = m_profile.user_id
            JOIN 
                Users e_user ON s.mentee_id = e_user.id
            JOIN 
                Profiles e_profile ON e_user.id = e_profile.user_id
            WHERE 
        `;
        
        // Filter by role if specified
        if (role === 'mentor') {
            query += ' s.mentor_id = @userId ';
        } else if (role === 'mentee') {
            query += ' s.mentee_id = @userId ';
        } else {
            query += ' (s.mentor_id = @userId OR s.mentee_id = @userId) ';
        }
        
        // Filter by status if specified
        if (status) {
            request.input('status', sql.VarChar, status);
            query += ' AND s.status = @status ';
        }
        
        // Add ordering
        query += ' ORDER BY s.session_date DESC, s.session_time DESC';
        
        const result = await request.query(query);
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching user sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a session status
app.put('/api/sessions/:sessionId/status', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { status, userId, userRole } = req.body;
        
        console.log('Updating status for session:', sessionId, 'Type:', typeof sessionId);
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        
        if (!sessionId || !status) {
            return res.status(400).json({ error: 'Session ID and new status are required' });
        }
        
        // Validate session ID is a number
        if (isNaN(Number(sessionId))) {
            return res.status(400).json({ 
                error: 'Invalid session ID',
                details: `Expected a number, got ${typeof sessionId}: ${sessionId}`
            });
        }
        
        // Validate the user has permission to update this session
        const request = new sql.Request();
        request.input('sessionId', sql.Int, sessionId);
        request.input('userId', sql.Int, userId);
        
        // Check if the user is related to this session
        const checkResult = await request.query(`
            SELECT 
                s.mentor_id,
                s.mentee_id,
                s.status as current_status
            FROM 
                Sessions s
            WHERE 
                s.id = @sessionId
        `);
        
        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        const session = checkResult.recordset[0];
        
        // Validate user permission
        if (userRole === 'mentor' && session.mentor_id !== userId) {
            return res.status(403).json({ error: 'You do not have permission to update this session' });
        }
        
        if (userRole === 'mentee' && session.mentee_id !== userId) {
            return res.status(403).json({ error: 'You do not have permission to update this session' });
        }
        
        // Validate status transition is allowed
        const allowedTransitions = {
            'pending_approval': ['approved', 'rejected'],
            'approved': ['completed', 'cancelled'],
            'rejected': [],
            'completed': [],
            'cancelled': []
        };
        
        if (!allowedTransitions[session.current_status].includes(status)) {
            return res.status(400).json({ 
                error: `Cannot change status from '${session.current_status}' to '${status}'`
            });
        }
        
        // Update the session status
        request.input('status', sql.VarChar, status);
        const updateResult = await request.query(`
            UPDATE Sessions
            SET 
                status = @status,
                updated_at = GETDATE()
            WHERE 
                id = @sessionId;
                
            SELECT * FROM Sessions WHERE id = @sessionId;
        `);
        
        res.json({
            message: 'Session status updated successfully',
            session: updateResult.recordset[0]
        });
    } catch (err) {
        console.error('Error updating session status:', err);
        res.status(500).json({ error: err.message });
    }
});

// Server is started after database connection is established

// Get specific mentor details
app.get('/api/mentors/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        
        const request = new sql.Request();
        request.input('mentorId', sql.Int, mentorId);
        
        const result = await request.query(`
            SELECT 
                u.id as user_id,
                p.id as profile_id,
                p.full_name,
                p.bio,
                p.skills,
                p.experience_level,
                p.profile_image,
                p.phone,
                p.location,
                p.linkedin_url,
                p.github_url,
                p.portfolio_url,
                p.current_company,
                p.current_title,
                p.industry,
                p.availability_status,
                p.hourly_rate,
                p.years_of_experience,
                p.expertise_areas,
                p.preferred_communication,
                p.career_goals,
                p.preferred_meeting_times
            FROM 
                Users u
            JOIN 
                Profiles p ON u.id = p.user_id
            WHERE 
                u.id = @mentorId AND u.role = 'mentor'
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching mentor details:', err);
        res.status(500).json({ error: err.message });
    }
});

// Book a session with a mentor
app.post('/api/sessions/book', async (req, res) => {
    try {
        console.log('=== BOOKING SESSION REQUEST ===');
        console.log('Raw request body:', JSON.stringify(req.body));
        console.log('Headers:', JSON.stringify(req.headers));
        console.log('Content type:', req.headers['content-type']);
        
        // Check if req.body is properly parsed
        if (Object.keys(req.body).length === 0) {
            console.error('Empty request body received!');
            return res.status(400).json({ error: 'Empty request body' });
        }
        
        const { mentor_id, mentee_id, date, time, duration, status, topic, fee = 0 } = req.body;
        
        // Log the types of parameters we're receiving
        console.log(`Mentor ID: ${mentor_id} (type: ${typeof mentor_id}, truthy: ${Boolean(mentor_id)})`);
        console.log(`Mentee ID: ${mentee_id} (type: ${typeof mentee_id}, truthy: ${Boolean(mentee_id)})`);
        console.log(`Date: ${date} (type: ${typeof date})`);
        console.log(`Time: ${time} (type: ${typeof time})`);
        console.log(`Duration: ${duration} (type: ${typeof duration})`);
        console.log(`Status: ${status} (type: ${typeof status})`);
        console.log(`Topic: ${topic} (type: ${typeof topic})`);
        console.log(`Fee: ${fee} (type: ${typeof fee})`);
        console.log('=================================');
        
        // Validate required fields with detailed error
        if (!mentor_id && !mentee_id) {
            console.error('Both mentor_id and mentee_id are missing');
            return res.status(400).json({ error: 'Mentor ID and Mentee ID are required' });
        } else if (!mentor_id) {
            console.error('mentor_id is missing');
            return res.status(400).json({ error: 'Mentor ID is required' });
        } else if (!mentee_id) {
            console.error('mentee_id is missing');
            return res.status(400).json({ error: 'Mentee ID is required' });
        }
        
        // Ensure IDs are numbers
        const mentorIdNum = Number(mentor_id);
        const menteeIdNum = Number(mentee_id);
        const durationNum = Number(duration) || 60;
        const feeNum = Number(fee) || 0;
        
        if (isNaN(mentorIdNum) || isNaN(menteeIdNum)) {
            return res.status(400).json({ error: 'Invalid ID format - must be a number' });
        }
        
        const request = new sql.Request();
        
        request.input('mentorId', sql.Int, mentorIdNum);
        request.input('menteeId', sql.Int, menteeIdNum);
        request.input('date', sql.VarChar, date);
        request.input('time', sql.VarChar, time);
        request.input('duration', sql.Int, durationNum);
        request.input('status', sql.VarChar, status || 'pending_mentor_approval');
        request.input('topic', sql.NVarChar, topic);
        request.input('fee', sql.Decimal(10, 2), feeNum);
        
        // Log the SQL parameters for debugging
        console.log('SQL Parameters:');
        console.log('mentorId:', mentorIdNum, '(Int)');
        console.log('menteeId:', menteeIdNum, '(Int)');
        console.log('date:', date, '(VarChar)');
        console.log('time:', time, '(VarChar)');
        console.log('duration:', durationNum, '(Int)');
        console.log('status:', status || 'pending_mentor_approval', '(VarChar)');
        console.log('topic:', topic || 'General mentoring session', '(NVarChar)');
        console.log('fee:', feeNum, '(Decimal)');
        
        // Log the SQL parameters before execution
        console.log('SQL parameters:', {
            mentorId: request.parameters.mentorId,
            menteeId: request.parameters.menteeId,
            date: request.parameters.date,
            time: request.parameters.time,
            duration: request.parameters.duration,
            status: request.parameters.status,
            topic: request.parameters.topic,
            fee: request.parameters.fee
        });
        
        const sqlQuery = `
            INSERT INTO Sessions (
                mentor_id, 
                mentee_id, 
                session_date, 
                session_time, 
                duration_minutes, 
                status,
                topic,
                fee_amount,
                created_at, 
                updated_at
            )
            VALUES (
                @mentorId, 
                @menteeId, 
                @date, 
                @time, 
                @duration, 
                @status,
                @topic,
                @fee,
                GETDATE(), 
                GETDATE()
            );
            
            SELECT SCOPE_IDENTITY() as session_id;
        `;
        
        console.log('Executing SQL query:', sqlQuery);
        
        const result = await request.query(sqlQuery);
        
        res.status(201).json({
            message: 'Session booked successfully',
            session_id: result.recordset[0].session_id
        });
    } catch (err) {
        console.error('Error booking session:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all sessions for a user (mentor or mentee)
app.get('/api/sessions', async (req, res) => {
    try {
        // In a real app, user_id would come from authenticated user
        const user_id = req.headers['user-id'] || req.query.user_id;
        const role = req.headers['user-role'] || req.query.role;
        
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const request = new sql.Request();
        request.input('userId', sql.Int, user_id);
        
        let query;
        if (role === 'mentor') {
            query = `
                SELECT 
                    s.*,
                    mentee.full_name as mentee_name,
                    mentee_user.email as mentee_email
                FROM 
                    Sessions s
                JOIN 
                    Profiles mentee ON s.mentee_id = mentee.user_id
                JOIN 
                    Users mentee_user ON mentee.user_id = mentee_user.id
                WHERE 
                    s.mentor_id = @userId
                ORDER BY 
                    s.session_date DESC, s.session_time DESC
            `;
        } else {
            // Default to mentee view
            query = `
                SELECT 
                    s.*,
                    mentor.full_name as mentor_name,
                    mentor_user.email as mentor_email,
                    mentor.current_title,
                    mentor.current_company
                FROM 
                    Sessions s
                JOIN 
                    Profiles mentor ON s.mentor_id = mentor.user_id
                JOIN 
                    Users mentor_user ON mentor.user_id = mentor_user.id
                WHERE 
                    s.mentee_id = @userId
                ORDER BY 
                    s.session_date DESC, s.session_time DESC
            `;
        }
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get a specific session
app.get('/api/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const request = new sql.Request();
        request.input('sessionId', sql.Int, sessionId);
        
        const result = await request.query(`
            SELECT 
                s.*,
                mentor.full_name as mentor_name,
                mentor_user.email as mentor_email,
                mentee.full_name as mentee_name,
                mentee_user.email as mentee_email
            FROM 
                Sessions s
            JOIN 
                Profiles mentor ON s.mentor_id = mentor.user_id
            JOIN 
                Users mentor_user ON mentor.user_id = mentor_user.id
            JOIN 
                Profiles mentee ON s.mentee_id = mentee.user_id
            JOIN 
                Users mentee_user ON mentee.user_id = mentee_user.id
            WHERE 
                s.id = @sessionId
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching session details:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add meeting URL to session
app.put('/api/sessions/:sessionId/meeting', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { meeting_url, meeting_provider } = req.body;
        
        console.log('Updating meeting URL for session:', sessionId, 'Type:', typeof sessionId);
        
        if (!meeting_url) {
            return res.status(400).json({ error: 'Meeting URL is required' });
        }
        
        // Validate session ID is a number
        if (!sessionId || isNaN(Number(sessionId))) {
            return res.status(400).json({ 
                error: 'Invalid session ID',
                details: `Expected a number, got ${typeof sessionId}: ${sessionId}`
            });
        }
        
        const request = new sql.Request();
        request.input('sessionId', sql.Int, sessionId);
        request.input('meetingUrl', sql.NVarChar, meeting_url);
        request.input('meetingProvider', sql.VarChar, meeting_provider || 'jitsi');
        
        const result = await request.query(`
            UPDATE Sessions
            SET 
                meeting_url = @meetingUrl,
                meeting_provider = @meetingProvider,
                updated_at = GETDATE()
            WHERE 
                id = @sessionId;
                
            SELECT * FROM Sessions WHERE id = @sessionId;
        `);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        res.json({
            message: 'Meeting URL updated successfully',
            session: result.recordset[0]
        });
    } catch (err) {
        console.error('Error updating meeting URL:', err);
        res.status(500).json({ error: err.message });
    }
});
