-- Migration: remove username column now that authentication is email-only
-- Run after taking a backup. Assumes existing users table has username indexes from prior schema.

-- Drop the unique index implicitly created for username
ALTER TABLE users DROP INDEX username;

-- Drop the auxiliary username index if present
ALTER TABLE users DROP INDEX idx_username;

-- Remove the username column
ALTER TABLE users DROP COLUMN username;
