-- Add rating columns to Sessions table
ALTER TABLE Sessions 
ADD mentor_rating DECIMAL(3, 1) NULL;

ALTER TABLE Sessions 
ADD mentee_rating DECIMAL(3, 1) NULL;

ALTER TABLE Sessions 
ADD feedback_text NVARCHAR(MAX) NULL;

-- Create index for faster lookups by ratings
CREATE INDEX idx_sessions_mentor_rating ON Sessions (mentor_rating);
CREATE INDEX idx_sessions_mentee_rating ON Sessions (mentee_rating);
