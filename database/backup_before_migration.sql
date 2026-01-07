-- Backup Script - Run this BEFORE migration
-- This creates backup tables of provinces, ports, and gallery_images

-- Drop old backup tables if they exist
DROP TABLE IF EXISTS provinces_backup;
DROP TABLE IF EXISTS ports_backup;
DROP TABLE IF EXISTS gallery_images_backup;

-- Create backup of provinces
CREATE TABLE provinces_backup AS SELECT * FROM provinces;

-- Create backup of ports
CREATE TABLE ports_backup AS SELECT * FROM ports;

-- Create backup of gallery_images (important: has FK to provinces)
CREATE TABLE gallery_images_backup AS SELECT * FROM gallery_images;

-- Verify backup
SELECT 'Backup completed!' AS status;
SELECT COUNT(*) AS provinces_backup_count FROM provinces_backup;
SELECT COUNT(*) AS ports_backup_count FROM ports_backup;
SELECT COUNT(*) AS gallery_images_backup_count FROM gallery_images_backup;

-- Show what we backed up
SELECT '=== PROVINCES BACKUP ===' AS '';
SELECT * FROM provinces_backup ORDER BY id LIMIT 10;

SELECT '=== PORTS BACKUP ===' AS '';
SELECT * FROM ports_backup ORDER BY id LIMIT 10;

SELECT '=== GALLERY IMAGES BACKUP ===' AS '';
SELECT * FROM gallery_images_backup ORDER BY id LIMIT 10;

