-- Add missing columns to Users table
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
    AND name = 'last_login'
)
BEGIN
    ALTER TABLE Users
    ADD last_login DATETIME NULL;
END

-- Update existing columns if needed
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
    AND name = 'email'
)
BEGIN
    ALTER TABLE Users
    ALTER COLUMN email NVARCHAR(255) NOT NULL;
END

IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
    AND name = 'password'
)
BEGIN
    ALTER TABLE Users
    ALTER COLUMN password NVARCHAR(255) NOT NULL;
END

-- Add unique constraint on email if not exists
IF NOT EXISTS (
    SELECT * FROM sys.indexes 
    WHERE name = 'UQ_Users_Email' 
    AND object_id = OBJECT_ID('Users')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
    ON Users(email);
END

-- Ensure role column has proper constraints
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
    AND name = 'role'
)
BEGIN
    ALTER TABLE Users
    ADD CONSTRAINT CHK_Users_Role 
    CHECK (role IN ('admin', 'mentor', 'mentee'));
END