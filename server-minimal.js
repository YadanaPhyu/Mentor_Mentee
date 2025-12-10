const express = require('express');
const cors = require('cors');
const { connectDB, sql } = require('./src/database/mssqlConfig');

const app = express();
const port = process.env.API_PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    next();
});

// Configure CORS - allow all origins for testing
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Signup endpoint
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, name, role } = req.body;
    console.log('Signup attempt:', { email, role, timestamp: new Date().toISOString() });

    try {
        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, name, and role are required' });
        }
        const normalizedEmail = email.toLowerCase();
        const userRole = role.toLowerCase();
        if (!['mentor','mentee','admin'].includes(userRole)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Check if email exists
        const existing = await sql.query`SELECT id FROM Users WHERE email = ${normalizedEmail}`;
        if (existing.recordset.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Insert user (store password in plain text for now - recommend hashing later)
        const insertUser = await sql.query`
            INSERT INTO Users (email, password, role, created_at, updated_at)
            VALUES (${normalizedEmail}, ${password}, ${userRole}, GETDATE(), GETDATE());
            SELECT SCOPE_IDENTITY() as user_id;
        `;
        const userId = insertUser.recordset[0].user_id;

        // Create minimal profile row
        await sql.query`
            INSERT INTO Profiles (user_id, full_name, bio, skills, experience_level, profile_image)
            VALUES (${userId}, ${name}, '', '', 'beginner', NULL);
        `;

        const result = await sql.query`
            SELECT u.id, u.email, u.role, p.full_name as display_name
            FROM Users u
            LEFT JOIN Profiles p ON p.user_id = u.id
            WHERE u.id = ${userId}
        `;

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, timestamp: new Date().toISOString() });

    try {
        // Admin login
        if (email.toLowerCase() === 'admin@example.com' && password === 'admin123') {
            return res.json({
                id: 'admin',
                email: 'admin@example.com',
                display_name: 'Administrator',
                role: 'admin'
            });
        }

        // Regular user login
        const userResult = await sql.query`
            SELECT u.id, u.email, u.role, p.full_name as display_name
            FROM Users u
            LEFT JOIN Profiles p ON p.user_id = u.id
            WHERE u.email = ${email.toLowerCase()}
        `;

        if (userResult.recordset.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.recordset[0];

        // Update last login
        await sql.query`
            UPDATE Users 
            SET last_login = GETDATE(), updated_at = GETDATE()
            WHERE id = ${user.id}
        `;

        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get user profile
app.get('/api/profiles/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await sql.query`
            SELECT p.*, u.email, u.role
            FROM Profiles p
            JOIN Users u ON p.user_id = u.id
            WHERE p.user_id = ${userId}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
app.put('/api/profiles/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
        full_name, bio, skills, experience_level, profile_image,
        phone, location, linkedin_url, github_url, portfolio_url,
        current_company, current_title, industry,
        availability_status, hourly_rate, years_of_experience,
        expertise_areas, preferred_communication,
        career_goals, preferred_meeting_times, learning_style, target_role
    } = req.body;
    
    try {
        // Check if profile exists
        const checkProfile = await sql.query`
            SELECT * FROM Profiles WHERE user_id = ${userId}
        `;

        if (checkProfile.recordset.length === 0) {
            // Create profile
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
            // Update profile
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
        }

        // Fetch and return updated profile
        const result = await sql.query`
            SELECT p.*, u.email, u.role
            FROM Profiles p
            JOIN Users u ON p.user_id = u.id
            WHERE p.user_id = ${userId}
        `;
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get available mentors
app.get('/api/mentors', async (req, res) => {
    try {
        const { search, skills, availability } = req.query;
        
        let query = `
            SELECT 
                u.id as user_id,
                p.full_name,
                p.bio,
                p.location,
                p.skills,
                p.availability_status,
                p.hourly_rate,
                p.expertise_areas,
                p.years_of_experience,
                p.current_company,
                p.current_title,
                p.profile_image,
                (SELECT COUNT(*) FROM Sessions WHERE mentor_id = u.id) as total_sessions,
                4.5 as rating
            FROM Users u
            JOIN Profiles p ON u.id = p.user_id
            WHERE u.role = 'mentor'
        `;

        const request = new sql.Request();
        
        if (search) {
            query += ` AND (p.full_name LIKE @search OR p.bio LIKE @search OR p.skills LIKE @search)`;
            request.input('search', sql.NVarChar, `%${search}%`);
        }
        
        if (availability) {
            query += ` AND p.availability_status = @availability`;
            request.input('availability', sql.NVarChar, availability);
        } else {
            query += ` AND (p.availability_status = 'available' OR p.availability_status IS NULL)`;
        }
        
        query += ` ORDER BY p.years_of_experience DESC`;
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching mentors:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get specific mentor details
app.get('/api/mentors/:mentorId', async (req, res) => {
    const { mentorId } = req.params;
    try {
        const result = await sql.query`
            SELECT 
                u.id as user_id,
                p.*,
                (SELECT COUNT(*) FROM Sessions WHERE mentor_id = u.id) as total_sessions,
                4.5 as rating
            FROM Users u
            JOIN Profiles p ON u.id = p.user_id
            WHERE u.id = ${mentorId} AND u.role = 'mentor'
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching mentor:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update mentor availability (status + preferred meeting times JSON)
app.put('/api/mentors/:mentorId/availability', async (req, res) => {
    const { mentorId } = req.params;
    const { availability_status, preferred_meeting_times } = req.body;

    console.log('Mentor availability update attempt:', { mentorId, availability_status });

    try {
        // Basic validation
        if (!mentorId) {
            return res.status(400).json({ error: 'mentorId is required' });
        }
        if (availability_status && !['available','unavailable','busy','away'].includes(availability_status)) {
            return res.status(400).json({ error: 'Invalid availability_status value' });
        }

        // Ensure mentor exists
        const mentorCheck = await sql.query`
            SELECT u.id, u.role, p.id as profile_id
            FROM Users u
            LEFT JOIN Profiles p ON p.user_id = u.id
            WHERE u.id = ${mentorId} AND u.role = 'mentor'
        `;
        if (mentorCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        // Preferred meeting times: accept object or string; store as JSON string
        let meetingTimesToStore = null;
        if (preferred_meeting_times) {
            if (typeof preferred_meeting_times === 'string') {
                // Validate that it's valid JSON
                try {
                    JSON.parse(preferred_meeting_times);
                    meetingTimesToStore = preferred_meeting_times;
                } catch (e) {
                    return res.status(400).json({ error: 'preferred_meeting_times must be valid JSON string' });
                }
            } else if (typeof preferred_meeting_times === 'object') {
                try {
                    meetingTimesToStore = JSON.stringify(preferred_meeting_times);
                } catch (e) {
                    return res.status(400).json({ error: 'preferred_meeting_times object not serializable' });
                }
            } else {
                return res.status(400).json({ error: 'preferred_meeting_times must be object or JSON string' });
            }
        }

        // Build update parts dynamically to avoid overwriting unrelated fields
        const updates = [];
        if (availability_status) updates.push(`availability_status = @availability_status`);
        if (meetingTimesToStore) updates.push(`preferred_meeting_times = @preferred_meeting_times`);
        updates.push(`last_updated = GETDATE()`);

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        const updateQuery = `UPDATE Profiles SET ${updates.join(', ')} WHERE user_id = @mentorId`;
        const request = new sql.Request();
        request.input('mentorId', sql.Int, mentorId);
        if (availability_status) request.input('availability_status', sql.NVarChar, availability_status);
        if (meetingTimesToStore) request.input('preferred_meeting_times', sql.NVarChar, meetingTimesToStore);
        await request.query(updateQuery);

        // Return updated mentor profile snapshot
        const result = await sql.query`
            SELECT 
                u.id as user_id,
                p.full_name,
                p.availability_status,
                p.preferred_meeting_times,
                p.hourly_rate,
                p.years_of_experience,
                p.current_title,
                p.current_company
            FROM Users u
            JOIN Profiles p ON u.id = p.user_id
            WHERE u.id = ${mentorId} AND u.role = 'mentor'
        `;

        res.json({
            message: 'Mentor availability updated',
            mentor: result.recordset[0]
        });
    } catch (err) {
        console.error('Mentor availability update error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Book a session
app.post('/api/sessions/book', async (req, res) => {
    try {
        const { mentor_id, mentee_id, date, time, duration = 60, topic, fee = 0 } = req.body;
        
        if (!mentor_id || !mentee_id) {
            return res.status(400).json({ error: 'Mentor ID and Mentee ID are required' });
        }
        
        const result = await sql.query`
            INSERT INTO Sessions (
                mentor_id, mentee_id, session_date, session_time, 
                duration_minutes, status, topic, fee_amount, 
                created_at, updated_at
            )
            VALUES (
                ${mentor_id}, ${mentee_id}, ${date}, ${time},
                ${duration}, 'pending_mentor_approval', ${topic}, ${fee},
                GETDATE(), GETDATE()
            );
            SELECT SCOPE_IDENTITY() as session_id;
        `;
        
        res.status(201).json({
            message: 'Session booked successfully',
            session_id: result.recordset[0].session_id
        });
    } catch (err) {
        console.error('Error booking session:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sessions for a user
app.get('/api/sessions', async (req, res) => {
    try {
        const { user_id, role } = req.query;
        
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        let query;
        if (role === 'mentor') {
            query = await sql.query`
                SELECT 
                    s.*,
                    mentee.full_name as mentee_name,
                    mentee_user.email as mentee_email
                FROM Sessions s
                JOIN Profiles mentee ON s.mentee_id = mentee.user_id
                JOIN Users mentee_user ON mentee.user_id = mentee_user.id
                WHERE s.mentor_id = ${user_id}
                ORDER BY s.session_date DESC, s.session_time DESC
            `;
        } else {
            query = await sql.query`
                SELECT 
                    s.*,
                    mentor.full_name as mentor_name,
                    mentor_user.email as mentor_email,
                    mentor.current_title,
                    mentor.current_company
                FROM Sessions s
                JOIN Profiles mentor ON s.mentor_id = mentor.user_id
                JOIN Users mentor_user ON mentor.user_id = mentor_user.id
                WHERE s.mentee_id = ${user_id}
                ORDER BY s.session_date DESC, s.session_time DESC
            `;
        }
        
        res.json(query.recordset);
    } catch (err) {
        console.error('Error fetching sessions:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get sessions for a specific user (alternative endpoint)
app.get('/api/sessions/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.query;
        
        console.log(`Fetching sessions for user ${userId} with role ${role}`);
        
        let query;
        if (role === 'mentor') {
            query = await sql.query`
                SELECT 
                    s.*,
                    mentee.full_name as mentee_name,
                    mentee.current_title as mentee_title,
                    mentee_user.email as mentee_email
                FROM Sessions s
                JOIN Profiles mentee ON s.mentee_id = mentee.user_id
                JOIN Users mentee_user ON mentee.user_id = mentee_user.id
                WHERE s.mentor_id = ${userId}
                ORDER BY s.session_date DESC, s.session_time DESC
            `;
        } else {
            query = await sql.query`
                SELECT 
                    s.*,
                    mentor.full_name as mentor_name,
                    mentor_user.email as mentor_email,
                    mentor.current_title,
                    mentor.current_company
                FROM Sessions s
                JOIN Profiles mentor ON s.mentor_id = mentor.user_id
                JOIN Users mentor_user ON mentor.user_id = mentor_user.id
                WHERE s.mentee_id = ${userId}
                ORDER BY s.session_date DESC, s.session_time DESC
            `;
        }
        
        console.log(`Found ${query.recordset.length} sessions`);
        res.json(query.recordset);
    } catch (err) {
        console.error('Error fetching sessions for user:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update session status
app.put('/api/sessions/:sessionId/status', async (req, res) => {
    const { sessionId } = req.params;
    const { status } = req.body;
    
    try {
        console.log(`Updating session ${sessionId} status to ${status}`);
        
        await sql.query`
            UPDATE Sessions
            SET status = ${status}, updated_at = GETDATE()
            WHERE id = ${sessionId}
        `;
        
        const result = await sql.query`
            SELECT * FROM Sessions WHERE id = ${sessionId}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        console.log(`Session ${sessionId} status updated successfully`);
        res.json({
            message: 'Session status updated successfully',
            session: result.recordset[0]
        });
    } catch (err) {
        console.error('Error updating session:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update meeting URL for a session
app.put('/api/sessions/:sessionId/meeting', async (req, res) => {
    const { sessionId } = req.params;
    const { meeting_url, meeting_provider } = req.body;
    
    try {
        console.log(`Updating meeting URL for session ${sessionId}`);
        
        if (!meeting_url) {
            return res.status(400).json({ error: 'Meeting URL is required' });
        }
        
        await sql.query`
            UPDATE Sessions
            SET meeting_url = ${meeting_url},
                meeting_provider = ${meeting_provider || 'jitsi'},
                updated_at = GETDATE()
            WHERE id = ${sessionId}
        `;
        
        const result = await sql.query`
            SELECT * FROM Sessions WHERE id = ${sessionId}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        console.log(`Meeting URL updated for session ${sessionId}`);
        res.json({
            message: 'Meeting URL updated successfully',
            session: result.recordset[0]
        });
    } catch (err) {
        console.error('Error updating meeting URL:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get a single session by ID
app.get('/api/sessions/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const result = await sql.query`
            SELECT 
                s.*,
                mentor.full_name as mentor_name,
                mentor_user.email as mentor_email,
                mentee.full_name as mentee_name,
                mentee_user.email as mentee_email
            FROM Sessions s
            LEFT JOIN Profiles mentor ON s.mentor_id = mentor.user_id
            LEFT JOIN Users mentor_user ON mentor.user_id = mentor_user.id
            LEFT JOIN Profiles mentee ON s.mentee_id = mentee.user_id
            LEFT JOIN Users mentee_user ON mentee.user_id = mentee_user.id
            WHERE s.id = ${sessionId}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching session by id:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get user stats (connections and sessions count)
app.get('/api/users/:userId/stats', async (req, res) => {
    const { userId } = req.params;
    
    try {
        // Get user role first
        const userResult = await sql.query`
            SELECT role FROM Users WHERE id = ${userId}
        `;
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userRole = userResult.recordset[0].role;
        
        let stats = {
            connections: 0,
            sessions: 0
        };
        
        if (userRole === 'mentee') {
            // For mentees: count unique mentors they've had sessions with
            const connectionsResult = await sql.query`
                SELECT COUNT(DISTINCT mentor_id) as count
                FROM Sessions
                WHERE mentee_id = ${userId}
                AND status IN ('approved', 'completed')
            `;
            
            // Count total sessions (approved and completed)
            const sessionsResult = await sql.query`
                SELECT COUNT(*) as count
                FROM Sessions
                WHERE mentee_id = ${userId}
                AND status IN ('approved', 'completed')
            `;
            
            stats.connections = connectionsResult.recordset[0].count || 0;
            stats.sessions = sessionsResult.recordset[0].count || 0;
        } else if (userRole === 'mentor') {
            // For mentors: count unique mentees they've had sessions with
            const connectionsResult = await sql.query`
                SELECT COUNT(DISTINCT mentee_id) as count
                FROM Sessions
                WHERE mentor_id = ${userId}
                AND status IN ('approved', 'completed')
            `;
            
            // Count total sessions (approved and completed)
            const sessionsResult = await sql.query`
                SELECT COUNT(*) as count
                FROM Sessions
                WHERE mentor_id = ${userId}
                AND status IN ('approved', 'completed')
            `;
            
            stats.connections = connectionsResult.recordset[0].count || 0;
            stats.sessions = sessionsResult.recordset[0].count || 0;
        }
        
        res.json(stats);
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ error: err.message });
    }
});

// Create a review for a session
app.post('/api/sessions/:sessionId/review', async (req, res) => {
    const { sessionId } = req.params;
    const { menteeId, mentorId, rating, comment } = req.body;
    if (!menteeId || !mentorId || !rating) {
        return res.status(400).json({ error: 'menteeId, mentorId, and rating are required' });
    }
    try {
        // Check if review already exists for this session and mentee
        const existing = await sql.query`
            SELECT id FROM reviews WHERE session_id = ${sessionId} AND mentee_id = ${menteeId}
        `;
        if (existing.recordset.length > 0) {
            return res.status(409).json({ error: 'Review already submitted for this session' });
        }
        // Insert review
        await sql.query`
            INSERT INTO reviews (session_id, mentor_id, mentee_id, rating, comment, created_at)
            VALUES (${sessionId}, ${mentorId}, ${menteeId}, ${rating}, ${comment}, GETDATE())
        `;
        res.json({ success: true });
    } catch (err) {
        console.error('Error creating review:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get reviews for a mentor
app.get('/api/mentors/:mentorId/reviews', async (req, res) => {
    const { mentorId } = req.params;
    try {
        const result = await sql.query`
            SELECT r.id, r.rating, r.comment, r.created_at, m.full_name as mentee_name
            FROM reviews r
            LEFT JOIN Profiles m ON r.mentee_id = m.user_id
            WHERE r.mentor_id = ${mentorId}
            ORDER BY r.created_at DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching mentor reviews:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get review for a session by mentee
app.get('/api/sessions/:sessionId/review', async (req, res) => {
    const { sessionId } = req.params;
    const { menteeId } = req.query;
    if (!menteeId) return res.status(400).json({ error: 'menteeId required' });
    try {
        const result = await sql.query`
            SELECT * FROM reviews WHERE session_id = ${sessionId} AND mentee_id = ${menteeId}
        `;
        if (result.recordset.length === 0) return res.status(404).json({ error: 'Review not found' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching review:', err);
        res.status(500).json({ error: err.message });
    }
});

// Connect to database and start server
connectDB().then(() => {
    console.log('Database connection established');
    
    const server = app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
    
    server.on('error', (err) => {
        console.error('Server error:', err);
        if (err.code === 'EADDRINUSE') {
            console.error(`Port ${port} is already in use. Please kill the process or use a different port.`);
        }
        process.exit(1);
    });
    
    // Keep the process alive
    process.on('SIGINT', () => {
        console.log('\nShutting down server...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}).catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
});
