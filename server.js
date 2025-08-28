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
        // First get the user's role
        const userResult = await sql.query`
            SELECT role FROM Users WHERE id = ${userId}
        `;
        
        if (userResult.recordset.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const role = userResult.recordset[0].role;
        let result;

        if (role === 'mentor') {
            result = await sql.query`
                SELECT 
                    p.id,
                    p.user_id,
                    p.full_name,
                    p.bio,
                    p.skills,
                    p.experience_level,
                    p.phone,
                    p.location,
                    p.current_company,
                    p.current_title,
                    p.availability_status,
                    p.hourly_rate,
                    p.expertise_areas,
                    p.years_of_experience,
                    p.preferred_mentoring_style,
                    p.max_mentees,
                    p.preferred_meeting_times,
                    p.current_title as mentor_title,
                    p.current_company as mentor_company,
                    u.email,
                    u.role
                FROM Profiles p
                JOIN Users u ON p.user_id = u.id
                WHERE p.user_id = ${userId}
            `;
        } else {
            result = await sql.query`
                SELECT 
                    p.id,
                    p.user_id,
                    p.full_name,
                    p.bio,
                    p.skills,
                    p.experience_level,
                    p.phone,
                    p.location,
                    p.current_company,
                    p.current_title,
                    mep.career_goals,
                    mep.learning_style,
                    mep.current_job_title,
                    mep.target_job_title,
                    u.email,
                    u.role
                FROM Profiles p
                JOIN Users u ON p.user_id = u.id
                LEFT JOIN MenteeProfiles mep ON p.id = mep.profile_id
                WHERE p.user_id = ${userId}
            `;
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Profile fetch error:', err);
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
        expertise_areas, preferred_communication, preferred_meeting_times,
        // Mentee specific fields
        career_goals, learning_style, target_role
    } = req.body;
    
    console.log('Received preferred_meeting_times:', preferred_meeting_times);
    
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
            // Update role-specific profile table
        if (checkProfile.recordset[0].role === 'mentor') {
            await sql.query`
                UPDATE MentorProfiles
                SET preferred_meeting_times = ${preferred_meeting_times}
                WHERE profile_id IN (
                    SELECT id FROM Profiles WHERE user_id = ${userId}
                )
            `;
        }

        // Fetch and return updated profile with role-specific data
        const result = await sql.query`
            SELECT p.*, u.email, u.role,
                CASE WHEN u.role = 'mentor' 
                    THEN (
                        SELECT preferred_meeting_times 
                        FROM MentorProfiles mp 
                        WHERE mp.profile_id = p.id
                    )
                    ELSE NULL 
                END as preferred_meeting_times
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

// Server is started after database connection is established
