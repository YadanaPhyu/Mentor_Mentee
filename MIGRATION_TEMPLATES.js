/**
 * MIGRATION TEMPLATE GENERATOR
 * 
 * Use your model properties to create SQL migrations
 * Copy and paste these templates into your generated migration files
 */

// ================================
// USERS TABLE (from UserModel.js)
// ================================
export const createUsersTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS users (
      -- From UserModel properties:
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      profile_picture TEXT,
      user_type TEXT NOT NULL DEFAULT 'mentee' CHECK (user_type IN ('mentor', 'mentee', 'admin')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      email_verified BOOLEAN NOT NULL DEFAULT 0,
      onboarding_completed BOOLEAN NOT NULL DEFAULT 0,
      bio TEXT,
      location TEXT,
      timezone TEXT DEFAULT 'Asia/Yangon',
      language_preference TEXT DEFAULT 'en',
      email_notifications BOOLEAN NOT NULL DEFAULT 1,
      push_notifications BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    );

    -- Indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `,
  down: `
    DROP INDEX IF EXISTS idx_users_status;
    DROP INDEX IF EXISTS idx_users_user_type;
    DROP INDEX IF EXISTS idx_users_email;
    DROP TABLE IF EXISTS users;
  `
};

// ================================
// MENTORS TABLE
// ================================
export const createMentorsTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      title TEXT,
      company TEXT,
      experience_years INTEGER DEFAULT 0,
      hourly_rate DECIMAL(10,2) DEFAULT 0,
      is_available BOOLEAN NOT NULL DEFAULT 1,
      rating DECIMAL(3,2) DEFAULT 0.0,
      total_sessions INTEGER DEFAULT 0,
      response_time_hours INTEGER DEFAULT 24,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON mentors(user_id);
    CREATE INDEX IF NOT EXISTS idx_mentors_available ON mentors(is_available);
    CREATE INDEX IF NOT EXISTS idx_mentors_rating ON mentors(rating);
  `,
  down: `
    DROP INDEX IF EXISTS idx_mentors_rating;
    DROP INDEX IF EXISTS idx_mentors_available;
    DROP INDEX IF EXISTS idx_mentors_user_id;
    DROP TABLE IF EXISTS mentors;
  `
};

// ================================
// MENTEES TABLE
// ================================
export const createMenteesTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS mentees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      learning_goals TEXT,
      current_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
      preferred_session_length INTEGER DEFAULT 60, -- minutes
      budget_range TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_mentees_user_id ON mentees(user_id);
    CREATE INDEX IF NOT EXISTS idx_mentees_level ON mentees(current_level);
  `,
  down: `
    DROP INDEX IF EXISTS idx_mentees_level;
    DROP INDEX IF EXISTS idx_mentees_user_id;
    DROP TABLE IF EXISTS mentees;
  `
};

// ================================
// SKILLS TABLE
// ================================
export const createSkillsTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
    
    -- Insert common skills
    INSERT OR IGNORE INTO skills (name, category) VALUES
    ('JavaScript', 'Programming'),
    ('React Native', 'Mobile Development'),
    ('Python', 'Programming'),
    ('UI/UX Design', 'Design'),
    ('Project Management', 'Business'),
    ('Data Science', 'Analytics');
  `,
  down: `
    DROP INDEX IF EXISTS idx_skills_category;
    DROP INDEX IF EXISTS idx_skills_name;
    DROP TABLE IF EXISTS skills;
  `
};

// ================================
// USER_SKILLS TABLE (Many-to-Many)
// ================================
export const createUserSkillsTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS user_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      proficiency_level TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced', 'expert'
      years_experience INTEGER DEFAULT 0,
      is_primary BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(user_id, skill_id)
    );

    CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
    CREATE INDEX IF NOT EXISTS idx_user_skills_proficiency ON user_skills(proficiency_level);
  `,
  down: `
    DROP INDEX IF EXISTS idx_user_skills_proficiency;
    DROP INDEX IF EXISTS idx_user_skills_skill_id;
    DROP INDEX IF EXISTS idx_user_skills_user_id;
    DROP TABLE IF EXISTS user_skills;
  `
};

// ================================
// SESSIONS TABLE
// ================================
export const createSessionsTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentor_id INTEGER NOT NULL,
      mentee_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_at DATETIME NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      session_type TEXT DEFAULT 'video_call', -- 'video_call', 'chat', 'in_person'
      meeting_url TEXT,
      meeting_notes TEXT,
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      feedback TEXT,
      amount DECIMAL(10,2),
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON sessions(mentor_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_mentee_id ON sessions(mentee_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
  `,
  down: `
    DROP INDEX IF EXISTS idx_sessions_status;
    DROP INDEX IF EXISTS idx_sessions_scheduled_at;
    DROP INDEX IF EXISTS idx_sessions_mentee_id;
    DROP INDEX IF EXISTS idx_sessions_mentor_id;
    DROP TABLE IF EXISTS sessions;
  `
};

// ================================
// MESSAGES TABLE
// ================================
export const createMessagesTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      conversation_id TEXT NOT NULL, -- Can be generated as "user1_id-user2_id"
      content TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
      file_url TEXT,
      is_read BOOLEAN NOT NULL DEFAULT 0,
      sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME,
      
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at);
    CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
  `,
  down: `
    DROP INDEX IF EXISTS idx_messages_is_read;
    DROP INDEX IF EXISTS idx_messages_sent_at;
    DROP INDEX IF EXISTS idx_messages_conversation_id;
    DROP INDEX IF EXISTS idx_messages_receiver_id;
    DROP INDEX IF EXISTS idx_messages_sender_id;
    DROP TABLE IF EXISTS messages;
  `
};

// ================================
// MENTORSHIP_REQUESTS TABLE
// ================================
export const createMentorshipRequestsTableSQL = {
  up: `
    CREATE TABLE IF NOT EXISTS mentorship_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentee_id INTEGER NOT NULL,
      mentor_id INTEGER NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
      requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME,
      response_message TEXT,
      
      FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(mentee_id, mentor_id) -- Prevent duplicate requests
    );

    CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentee_id ON mentorship_requests(mentee_id);
    CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor_id ON mentorship_requests(mentor_id);
    CREATE INDEX IF NOT EXISTS idx_mentorship_requests_status ON mentorship_requests(status);
  `,
  down: `
    DROP INDEX IF EXISTS idx_mentorship_requests_status;
    DROP INDEX IF EXISTS idx_mentorship_requests_mentor_id;
    DROP INDEX IF EXISTS idx_mentorship_requests_mentee_id;
    DROP TABLE IF EXISTS mentorship_requests;
  `
};

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Generate migration: npm run generate-migration create_users_table
 * 2. Copy the SQL from createUsersTableSQL above
 * 3. Paste into your generated migration file
 * 4. Register in migrations/index.js
 * 5. Run app to execute migrations
 */
