-- Add cargo_type to image_types with two allowed values.
-- Target DB: MySQL 8+

ALTER TABLE image_types
  ADD COLUMN cargo_type ENUM('IN_BULK', 'IN_BAG_PACK') NOT NULL DEFAULT 'IN_BULK' AFTER required_image_count;

-- Optional backfill safety (not needed if DEFAULT applied during ADD COLUMN)
UPDATE image_types
SET cargo_type = 'IN_BULK'
WHERE cargo_type IS NULL;
