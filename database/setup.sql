-- Create Users table
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Create Profiles table
CREATE TABLE Profiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    full_name NVARCHAR(255),
    bio NVARCHAR(MAX),
    skills NVARCHAR(MAX),
    interests NVARCHAR(MAX),
    experience_level NVARCHAR(50),
    profile_image NVARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Create Mentorships table
CREATE TABLE Mentorships (
    id INT IDENTITY(1,1) PRIMARY KEY,
    mentor_id INT,
    mentee_id INT,
    status NVARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (mentor_id) REFERENCES Users(id),
    FOREIGN KEY (mentee_id) REFERENCES Users(id)
);

-- Create Messages table
CREATE TABLE Messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id)
);
