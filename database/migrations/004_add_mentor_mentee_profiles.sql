-- Add mentor-specific fields
CREATE TABLE MentorProfiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    profile_id INT,
    availability NVARCHAR(50),
    hourly_rate DECIMAL(10,2),
    expertise_areas NVARCHAR(MAX),
    years_of_experience INT,
    preferred_mentoring_style NVARCHAR(100),
    max_mentees INT,
    FOREIGN KEY (profile_id) REFERENCES Profiles(id)
);

-- Add mentee-specific fields
CREATE TABLE MenteeProfiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    profile_id INT,
    career_goals NVARCHAR(MAX),
    preferred_meeting_times NVARCHAR(100),
    learning_style NVARCHAR(100),
    current_job_title NVARCHAR(255),
    target_job_title NVARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES Profiles(id)
);

-- Add these lines to your existing Profiles table if they don't exist
ALTER TABLE Profiles ADD
    linkedin_url NVARCHAR(255),
    github_url NVARCHAR(255),
    portfolio_url NVARCHAR(255),
    phone NVARCHAR(50),
    location NVARCHAR(255);
