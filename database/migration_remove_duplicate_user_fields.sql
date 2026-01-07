-- Migration: Remove duplicate user fields from inquiry tables
-- Date: 2026-01-07
-- Purpose: Refactor inquiry tables to use user_id foreign key instead of duplicating user data

-- IMPORTANT: Backup your data before running this migration!

-- Step 1: Add foreign key constraint to user table (if not exists)
ALTER TABLE shipping_agency_inquiries 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS contact_info,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS company;

ALTER TABLE shipping_agency_inquiries
ADD CONSTRAINT fk_shipping_agency_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 2: Freight Forwarding Inquiries
ALTER TABLE freight_forwarding_inquiries 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS contact_info,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS company;

ALTER TABLE freight_forwarding_inquiries
ADD CONSTRAINT fk_freight_forwarding_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 3: Chartering & Broking Inquiries
ALTER TABLE chartering_broking_inquiries 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS contact_info,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS company;

ALTER TABLE chartering_broking_inquiries
ADD CONSTRAINT fk_chartering_broking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 4: Total Logistics Inquiries
ALTER TABLE total_logistics_inquiries 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS contact_info,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS company;

ALTER TABLE total_logistics_inquiries
ADD CONSTRAINT fk_total_logistics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 5: Special Request Inquiries
ALTER TABLE special_request_inquiries 
DROP COLUMN IF EXISTS full_name,
DROP COLUMN IF EXISTS contact_info,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS company;

ALTER TABLE special_request_inquiries
ADD CONSTRAINT fk_special_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Make user_id NOT NULL (requires all existing inquiries to have valid user_id)
ALTER TABLE shipping_agency_inquiries MODIFY COLUMN user_id BIGINT NOT NULL;
ALTER TABLE freight_forwarding_inquiries MODIFY COLUMN user_id BIGINT NOT NULL;
ALTER TABLE chartering_broking_inquiries MODIFY COLUMN user_id BIGINT NOT NULL;
ALTER TABLE total_logistics_inquiries MODIFY COLUMN user_id BIGINT NOT NULL;
ALTER TABLE special_request_inquiries MODIFY COLUMN user_id BIGINT NOT NULL;

-- Verification queries
SELECT 'Shipping Agency' as table_name, COUNT(*) as inquiries_count FROM shipping_agency_inquiries
UNION ALL
SELECT 'Freight Forwarding', COUNT(*) FROM freight_forwarding_inquiries
UNION ALL
SELECT 'Chartering', COUNT(*) FROM chartering_broking_inquiries
UNION ALL
SELECT 'Total Logistics', COUNT(*) FROM total_logistics_inquiries
UNION ALL
SELECT 'Special Request', COUNT(*) FROM special_request_inquiries;
