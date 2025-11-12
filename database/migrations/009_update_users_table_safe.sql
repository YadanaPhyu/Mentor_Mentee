-- Add missing columns to Users table if they don't exist
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'dbo' 
    AND TABLE_NAME = 'Users'
)
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        last_login DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME NOT NULL DEFAULT GETDATE()
    );

    CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
    ON Users(email);

    ALTER TABLE Users
    ADD CONSTRAINT CHK_Users_Role 
    CHECK (role IN ('admin', 'mentor', 'mentee'));
END
ELSE
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
        AND name = 'last_login'
    )
    BEGIN
        ALTER TABLE Users
        ADD last_login DATETIME NULL;
    END

    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
        AND name = 'created_at'
    )
    BEGIN
        ALTER TABLE Users
        ADD created_at DATETIME NOT NULL DEFAULT GETDATE();
    END

    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'[dbo].[Users]') 
        AND name = 'updated_at'
    )
    BEGIN
        ALTER TABLE Users
        ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
    END

    -- Update column types if needed
    ALTER TABLE Users
    ALTER COLUMN email NVARCHAR(255) NOT NULL;

    ALTER TABLE Users
    ALTER COLUMN password NVARCHAR(255) NOT NULL;

    -- Add unique constraint on email if it doesn't exist
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'UQ_Users_Email' 
        AND object_id = OBJECT_ID('Users')
    )
    BEGIN
        CREATE UNIQUE NONCLUSTERED INDEX UQ_Users_Email
        ON Users(email);
    END

    -- Add role constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT * FROM sys.check_constraints
        WHERE name = 'CHK_Users_Role'
    )
    BEGIN
        ALTER TABLE Users
        ADD CONSTRAINT CHK_Users_Role 
        CHECK (role IN ('admin', 'mentor', 'mentee'));
    END
END

-- Insert admin user if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM Users WHERE email = 'admin@example.com'
)
BEGIN
    INSERT INTO Users (email, password, name, role)
    VALUES ('admin@example.com', 'admin123', 'System Administrator', 'admin');
END