-- Migration: Add discharge_loading_location to shipping_agency_inquiries
-- Date: 2026-01-02
-- Description: Add field to track whether discharge/loading is at Berth or Anchorage

-- Add the new column
ALTER TABLE shipping_agency_inquiries 
ADD COLUMN IF NOT EXISTS discharge_loading_location VARCHAR(64);

-- Add comment
COMMENT ON COLUMN shipping_agency_inquiries.discharge_loading_location 
IS 'Discharge/Loading location: Berth or Anchorage';

-- Update existing records (optional - set default to NULL or a default value)
-- UPDATE shipping_agency_inquiries SET discharge_loading_location = 'Berth' WHERE discharge_loading_location IS NULL;

-- Verify the change
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'shipping_agency_inquiries' 
  AND column_name = 'discharge_loading_location';
