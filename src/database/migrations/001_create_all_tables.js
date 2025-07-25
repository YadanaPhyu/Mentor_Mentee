export const createAllTables = {
  name: '001_create_all_tables',
  up: `
    CREATE TABLE IF NOT EXISTS mentee_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      learning_goals TEXT,
      interests TEXT,
      skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
      preferred_learning_style TEXT DEFAULT 'visual' CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic')),
      preferred_mentor_gender TEXT DEFAULT 'no_preference' CHECK (preferred_mentor_gender IN ('male', 'female', 'no_preference')),
      preferred_session_duration INTEGER DEFAULT 60,
      budget_range_min INTEGER DEFAULT 0,
      budget_range_max INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'MMK',
      availability_schedule TEXT,
      total_sessions INTEGER DEFAULT 0,
      current_mentors INTEGER DEFAULT 0,
      completed_goals INTEGER DEFAULT 0,
      current_education_level TEXT,
      institution TEXT,
      field_of_study TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS mentor_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT,
      company TEXT,
      experience_years INTEGER DEFAULT 0,
      education TEXT,
      certifications TEXT,
      hourly_rate INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'MMK',
      specializations TEXT,
      availability_schedule TEXT,
      languages TEXT DEFAULT ['English'],
      rating INTEGER DEFAULT 0,
      total_sessions INTEGER DEFAULT 0,
      total_mentees INTEGER DEFAULT 0,
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT,
      sender_id TEXT,
      receiver_id TEXT,
      content TEXT,
      message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER DEFAULT 0,
      read_at DATETIME,
      edited_at DATETIME,
      reply_to_message_id TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentor_id TEXT,
      mentee_id TEXT,
      title TEXT,
      description TEXT,
      scheduled_at DATETIME,
      duration_minutes INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
      meeting_link TEXT,
      meeting_platform TEXT DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'meet', 'teams')),
      agenda TEXT,
      notes TEXT,
      mentor_notes TEXT,
      mentee_notes TEXT,
      rating TEXT,
      feedback TEXT,
      price INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'MMK',
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
      cancellation_reason TEXT,
      created_at TEXT,
      updated_at TEXT,
      started_at DATETIME,
      ended_at DATETIME
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      profile_picture TEXT,
      user_type TEXT DEFAULT 'mentee' NOT NULL CHECK (user_type IN ('mentor', 'mentee', 'admin')),
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
      bio TEXT,
      location TEXT,
      timezone TEXT DEFAULT 'Asia/Yangon',
      language_preference TEXT DEFAULT 'en',
      email_verified BOOLEAN DEFAULT 0,
      onboarding_completed BOOLEAN DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      last_login_at DATETIME
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_mentee_profiles_user_id ON mentee_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user_id ON mentor_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_messages_reply_to_message_id ON messages(reply_to_message_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON sessions(mentor_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_mentee_id ON sessions(mentee_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
  `,
  down: `
    -- Drop indexes (they will be dropped with tables)
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS sessions;
    DROP TABLE IF EXISTS messages;
    DROP TABLE IF EXISTS mentor_profiles;
    DROP TABLE IF EXISTS mentee_profiles;
  `
};
