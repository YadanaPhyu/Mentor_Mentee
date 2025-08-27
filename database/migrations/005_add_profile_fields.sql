-- Add new columns to Profiles table one by one
-- General information
ALTER TABLE Profiles ADD phone NVARCHAR(50);
ALTER TABLE Profiles ADD location NVARCHAR(255);
ALTER TABLE Profiles ADD education NVARCHAR(MAX);
ALTER TABLE Profiles ADD linkedin_url NVARCHAR(255);
ALTER TABLE Profiles ADD github_url NVARCHAR(255);
ALTER TABLE Profiles ADD portfolio_url NVARCHAR(255);
ALTER TABLE Profiles ADD availability_status NVARCHAR(50);

-- Mentor specific fields
ALTER TABLE Profiles ADD hourly_rate DECIMAL(10, 2);
ALTER TABLE Profiles ADD years_of_experience INT;
ALTER TABLE Profiles ADD expertise_areas NVARCHAR(MAX);
ALTER TABLE Profiles ADD preferred_communication NVARCHAR(50);

-- Mentee specific fields
ALTER TABLE Profiles ADD career_goals NVARCHAR(MAX);
ALTER TABLE Profiles ADD preferred_meeting_times NVARCHAR(100);
ALTER TABLE Profiles ADD learning_style NVARCHAR(100);
ALTER TABLE Profiles ADD target_role NVARCHAR(255);

-- Common fields
ALTER TABLE Profiles ADD current_company NVARCHAR(255);
ALTER TABLE Profiles ADD current_title NVARCHAR(255);
ALTER TABLE Profiles ADD industry NVARCHAR(255);
ALTER TABLE Profiles ADD last_updated DATETIME DEFAULT GETDATE();
