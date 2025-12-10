-- Migration: Create reviews table
CREATE TABLE reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    session_id INT NOT NULL,
    mentor_id INT NOT NULL,
    mentee_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE
);
-- Index for fast mentor review lookup
CREATE INDEX idx_reviews_mentor_id ON reviews(mentor_id);
