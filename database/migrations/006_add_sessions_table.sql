-- Create Sessions table for mentor-mentee session booking
CREATE TABLE Sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    session_date VARCHAR(50) NOT NULL,
    session_time VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_mentor_approval',
    topic NVARCHAR(255),
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    meeting_url NVARCHAR(500) NULL,
    meeting_provider VARCHAR(50) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (mentor_id) REFERENCES Users(id),
    FOREIGN KEY (mentee_id) REFERENCES Users(id)
);

-- Index for faster lookups by mentor_id and mentee_id
CREATE INDEX idx_sessions_mentor_id ON Sessions (mentor_id);
CREATE INDEX idx_sessions_mentee_id ON Sessions (mentee_id);
CREATE INDEX idx_sessions_status ON Sessions (status);
