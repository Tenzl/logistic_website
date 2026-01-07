-- Rollback Script - Use this to restore data from backup
-- This will restore provinces, ports, and gallery_images from backup tables

-- IMPORTANT: This will DELETE all current data and restore from backup!

-- Check if backup tables exist
SELECT '=== CHECKING BACKUP TABLES ===' AS '';
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'provinces_backup') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END AS provinces_backup_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'ports_backup') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END AS ports_backup_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_schema = DATABASE() 
                     AND table_name = 'gallery_images_backup') 
        THEN 'EXISTS' 
        ELSE 'NOT FOUND' 
    END AS gallery_images_backup_status;

-- If backup tables don't exist, STOP HERE!
-- If they exist, continue with rollback:

SET FOREIGN_KEY_CHECKS = 0;

-- Clear current data (in reverse dependency order)
DELETE FROM gallery_images WHERE province_id IS NOT NULL;
DELETE FROM ports;
DELETE FROM provinces;

-- Restore from backup (in dependency order)
INSERT INTO provinces SELECT * FROM provinces_backup;
INSERT INTO ports SELECT * FROM ports_backup;
INSERT INTO gallery_images 
    SELECT * FROM gallery_images_backup 
    WHERE province_id IS NOT NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- Verify restoration
SELECT '=== ROLLBACK COMPLETED ===' AS '';
SELECT COUNT(*) AS provinces_restored FROM provinces;
SELECT COUNT(*) AS ports_restored FROM ports;
SELECT COUNT(*) AS gallery_images_restored FROM gallery_images WHERE province_id IS NOT NULL;

SELECT '=== SAMPLE DATA ===' AS '';
SELECT * FROM provinces ORDER BY id LIMIT 5;
SELECT * FROM ports ORDER BY id LIMIT 5;
SELECT * FROM gallery_images WHERE province_id IS NOT NULL ORDER BY id LIMIT 5;

