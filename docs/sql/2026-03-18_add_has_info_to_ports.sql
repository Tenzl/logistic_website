-- Add has_info flag for ports (0 = no info, 1 = has info)
-- MySQL 8+

ALTER TABLE ports
  ADD COLUMN IF NOT EXISTS has_info TINYINT(1) NOT NULL DEFAULT 0;

UPDATE ports
SET has_info = 0
WHERE has_info IS NULL;
