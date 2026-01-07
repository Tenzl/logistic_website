-- Migration: Add OAuth2 support to users table
-- Date: 2026-01-08
-- Description: Add fields for Google OAuth2 authentication

-- Add OAuth provider fields
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) COMMENT 'OAuth provider name (google, facebook, etc.)',
ADD COLUMN oauth_provider_id VARCHAR(255) COMMENT 'Unique ID from OAuth provider (e.g., Google sub)',
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE COMMENT 'Whether email has been verified';

-- Create index for fast OAuth lookup
CREATE INDEX idx_oauth_provider ON users(oauth_provider, oauth_provider_id);

-- Update existing users to have email_verified = true if they are active
-- (Assuming active users have verified their email through other means)
UPDATE users 
SET email_verified = TRUE 
WHERE is_active = TRUE;

-- Verification query
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN oauth_provider IS NOT NULL THEN 1 ELSE 0 END) as oauth_users,
    SUM(CASE WHEN email_verified = TRUE THEN 1 ELSE 0 END) as verified_users
FROM users;
