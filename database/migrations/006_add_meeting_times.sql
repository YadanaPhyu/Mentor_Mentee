-- Add columns to both Profiles and MentorProfiles tables
DECLARE @SQL NVARCHAR(MAX);

-- First, drop existing preferred_meeting_times columns if they exist
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'preferred_meeting_times')
    ALTER TABLE Profiles DROP COLUMN preferred_meeting_times;

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MentorProfiles') AND name = 'preferred_meeting_times')
    ALTER TABLE MentorProfiles DROP COLUMN preferred_meeting_times;

-- Add or update columns in Profiles table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'current_company')
    ALTER TABLE Profiles ADD current_company VARCHAR(255);

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'current_title')
    ALTER TABLE Profiles ADD current_title VARCHAR(255);

-- Add preferred_meeting_times as NTEXT with default value
ALTER TABLE Profiles ADD preferred_meeting_times NTEXT DEFAULT '{}';

-- Add mentor-specific fields with proper defaults
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'hourly_rate')
    ALTER TABLE Profiles ADD hourly_rate DECIMAL(10,2) DEFAULT 0.00;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'years_of_experience')
    ALTER TABLE Profiles ADD years_of_experience INT DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'expertise_areas')
    ALTER TABLE Profiles ADD expertise_areas NVARCHAR(MAX);

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Profiles') AND name = 'availability_status')
    ALTER TABLE Profiles ADD availability_status VARCHAR(50) DEFAULT 'unavailable';

-- Add or update columns in MentorProfiles table
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MentorProfiles') AND name = 'current_company')
    ALTER TABLE MentorProfiles ADD current_company VARCHAR(255);

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MentorProfiles') AND name = 'current_title')
    ALTER TABLE MentorProfiles ADD current_title VARCHAR(255);

-- Add preferred_meeting_times as NTEXT
ALTER TABLE MentorProfiles ADD preferred_meeting_times NTEXT;

-- Add availability_status to MentorProfiles
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MentorProfiles') AND name = 'availability_status')
    ALTER TABLE MentorProfiles ADD availability_status VARCHAR(50) DEFAULT 'unavailable';

-- Add hourly_rate to MentorProfiles
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('MentorProfiles') AND name = 'hourly_rate')
    ALTER TABLE MentorProfiles ADD hourly_rate DECIMAL(10,2) DEFAULT 0.00;

-- Create MentorAvailability table for date-based availability
CREATE TABLE MentorAvailability (
    id INT IDENTITY(1,1) PRIMARY KEY,
    mentor_profile_id INT NOT NULL,
    date_available DATE NOT NULL,
    time_slots VARCHAR(MAX) NOT NULL, -- JSON array of available time slots
    is_recurring BIT DEFAULT 0,
    recurrence_pattern VARCHAR(50), -- 'weekly', 'biweekly', etc.
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (mentor_profile_id) REFERENCES MentorProfiles(id)
);

-- Create MentorBookings table for tracking scheduled meetings
CREATE TABLE MentorBookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    mentor_profile_id INT NOT NULL,
    mentee_profile_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    notes TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (mentor_profile_id) REFERENCES MentorProfiles(id),
    FOREIGN KEY (mentee_profile_id) REFERENCES MenteeProfiles(id)
);
