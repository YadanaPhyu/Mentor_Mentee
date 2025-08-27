// Update profile endpoint
app.put('/api/profiles/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
        // Common fields
        full_name, bio, skills, interests, experience_level,
        linkedin_url, github_url, portfolio_url, phone, location,
        // Mentor specific fields
        availability, hourly_rate, expertise_areas, years_of_experience,
        preferred_mentoring_style, max_mentees,
        // Mentee specific fields
        career_goals, preferred_meeting_times, learning_style,
        current_job_title, target_job_title,
        // Role information
        role
    } = req.body;
    
    try {
        // First check if profile exists
        const checkProfile = await sql.query`
            SELECT p.id, u.role
            FROM Profiles p
            JOIN Users u ON p.user_id = u.id
            WHERE p.user_id = ${userId}
        `;

        let profileId;
        if (checkProfile.recordset.length === 0) {
            // Create base profile if it doesn't exist
            const result = await sql.query`
                INSERT INTO Profiles (
                    user_id, full_name, bio, skills, interests, 
                    experience_level, linkedin_url, github_url, 
                    portfolio_url, phone, location
                )
                VALUES (
                    ${userId}, ${full_name}, ${bio}, ${skills}, 
                    ${interests}, ${experience_level}, ${linkedin_url}, 
                    ${github_url}, ${portfolio_url}, ${phone}, ${location}
                );
                SELECT SCOPE_IDENTITY() as id;
            `;
            profileId = result.recordset[0].id;
        } else {
            profileId = checkProfile.recordset[0].id;
            // Update base profile
            await sql.query`
                UPDATE Profiles
                SET full_name = ${full_name},
                    bio = ${bio},
                    skills = ${skills},
                    interests = ${interests},
                    experience_level = ${experience_level},
                    linkedin_url = ${linkedin_url},
                    github_url = ${github_url},
                    portfolio_url = ${portfolio_url},
                    phone = ${phone},
                    location = ${location}
                WHERE id = ${profileId}
            `;
        }

        // Handle role-specific profile data
        if (role === 'mentor') {
            const checkMentorProfile = await sql.query`
                SELECT id FROM MentorProfiles WHERE profile_id = ${profileId}
            `;

            if (checkMentorProfile.recordset.length === 0) {
                await sql.query`
                    INSERT INTO MentorProfiles (
                        profile_id, availability, hourly_rate, 
                        expertise_areas, years_of_experience,
                        preferred_mentoring_style, max_mentees
                    )
                    VALUES (
                        ${profileId}, ${availability}, ${hourly_rate}, 
                        ${expertise_areas}, ${years_of_experience},
                        ${preferred_mentoring_style}, ${max_mentees}
                    )
                `;
            } else {
                await sql.query`
                    UPDATE MentorProfiles
                    SET availability = ${availability},
                        hourly_rate = ${hourly_rate},
                        expertise_areas = ${expertise_areas},
                        years_of_experience = ${years_of_experience},
                        preferred_mentoring_style = ${preferred_mentoring_style},
                        max_mentees = ${max_mentees}
                    WHERE profile_id = ${profileId}
                `;
            }
        } else if (role === 'mentee') {
            const checkMenteeProfile = await sql.query`
                SELECT id FROM MenteeProfiles WHERE profile_id = ${profileId}
            `;

            if (checkMenteeProfile.recordset.length === 0) {
                await sql.query`
                    INSERT INTO MenteeProfiles (
                        profile_id, career_goals, preferred_meeting_times,
                        learning_style, current_job_title, target_job_title
                    )
                    VALUES (
                        ${profileId}, ${career_goals}, ${preferred_meeting_times},
                        ${learning_style}, ${current_job_title}, ${target_job_title}
                    )
                `;
            } else {
                await sql.query`
                    UPDATE MenteeProfiles
                    SET career_goals = ${career_goals},
                        preferred_meeting_times = ${preferred_meeting_times},
                        learning_style = ${learning_style},
                        current_job_title = ${current_job_title},
                        target_job_title = ${target_job_title}
                    WHERE profile_id = ${profileId}
                `;
            }
        }

        // Fetch and return updated profile with role-specific data
        let updatedProfile;
        if (role === 'mentor') {
            const result = await sql.query`
                SELECT p.*, mp.*, u.email, u.role
                FROM Profiles p
                JOIN Users u ON p.user_id = u.id
                LEFT JOIN MentorProfiles mp ON p.id = mp.profile_id
                WHERE p.user_id = ${userId}
            `;
            updatedProfile = result.recordset[0];
        } else {
            const result = await sql.query`
                SELECT p.*, mep.*, u.email, u.role
                FROM Profiles p
                JOIN Users u ON p.user_id = u.id
                LEFT JOIN MenteeProfiles mep ON p.id = mep.profile_id
                WHERE p.user_id = ${userId}
            `;
            updatedProfile = result.recordset[0];
        }
        
        res.json(updatedProfile);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: err.message });
    }
});
