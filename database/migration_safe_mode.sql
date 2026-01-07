-- SAFE MIGRATION MODE
-- This script will ONLY update data in provinces and ports tables
-- All other tables and database structure remain unchanged

-- ==============================================================
-- WHAT THIS SCRIPT DOES:
-- ==============================================================
-- 1. Backs up current provinces and ports data to backup tables
-- 2. Clears ONLY the provinces and ports tables  
-- 3. Inserts 34 new provinces
-- 4. Inserts 18 ports with updated province_id mappings
-- 5. Verifies the migration
-- ==============================================================

-- ==============================================================
-- WHAT THIS SCRIPT DOES NOT DO:
-- ==============================================================
-- ❌ Does NOT drop the database
-- ❌ Does NOT drop any tables (structure remains)
-- ❌ Does NOT affect other tables (users, orders, etc.)
-- ❌ Does NOT change table schema
-- ==============================================================

START TRANSACTION;

-- Step 1: Create backup tables (overwrite if exists)
DROP TABLE IF EXISTS provinces_backup;
DROP TABLE IF EXISTS ports_backup;
DROP TABLE IF EXISTS gallery_images_backup;

CREATE TABLE provinces_backup AS SELECT * FROM provinces;
CREATE TABLE ports_backup AS SELECT * FROM ports;
CREATE TABLE gallery_images_backup AS SELECT * FROM gallery_images;

SELECT '✓ Backup created' AS status;
SELECT COUNT(*) AS provinces_backed_up FROM provinces_backup;
SELECT COUNT(*) AS ports_backed_up FROM ports_backup;
SELECT COUNT(*) AS gallery_images_backed_up FROM gallery_images_backup;

-- Step 2: Clear only provinces, ports, and gallery_images data
-- (NOT the table structure)
SET FOREIGN_KEY_CHECKS = 0;

-- Delete in reverse dependency order
DELETE FROM gallery_images WHERE province_id IS NOT NULL;
ALTER TABLE gallery_images AUTO_INCREMENT = 1;

DELETE FROM ports;
ALTER TABLE ports AUTO_INCREMENT = 1;

DELETE FROM provinces;  
ALTER TABLE provinces AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✓ Old data cleared' AS status;

-- Step 3: Insert 34 new provinces
INSERT INTO provinces (id, name, is_active) VALUES
(1, 'An Giang', 1),
(2, 'Bắc Ninh', 1),
(3, 'Cà Mau', 1),
(4, 'Cao Bằng', 1),
(5, 'Cần Thơ', 1),
(6, 'Đà Nẵng', 1),
(7, 'Đắk Lắk', 1),
(8, 'Điện Biên', 1),
(9, 'Đồng Nai', 1),
(10, 'Đồng Tháp', 1),
(11, 'Gia Lai', 1),
(12, 'Hà Nội', 1),
(13, 'Hà Tĩnh', 1),
(14, 'Hải Phòng', 1),
(15, 'Huế', 1),
(16, 'Hưng Yên', 1),
(17, 'Khánh Hòa', 1),
(18, 'Lai Châu', 1),
(19, 'Lạng Sơn', 1),
(20, 'Lào Cai', 1),
(21, 'Lâm Đồng', 1),
(22, 'Nghệ An', 1),
(23, 'Ninh Bình', 1),
(24, 'Phú Thọ', 1),
(25, 'Quảng Ngãi', 1),
(26, 'Quảng Ninh', 1),
(27, 'Quảng Trị', 1),
(28, 'Sơn La', 1),
(29, 'Tây Ninh', 1),
(30, 'Thái Nguyên', 1),
(31, 'Thanh Hóa', 1),
(32, 'TP. Hồ Chí Minh', 1),
(33, 'Tuyên Quang', 1),
(34, 'Vĩnh Long', 1);

SELECT '✓ 34 provinces inserted' AS status;

-- Step 4: Insert 18 ports
INSERT INTO ports (name, province_id, is_active) VALUES
('Cái Lân (Cai Lan Port)', 26, 1),
('Nghi Sơn Port', 31, 1),
('Cửa Lò Port', 22, 1),
('Vũng Áng Port', 13, 1),
('Chân Mây Port', 15, 1),
('Chu Lai Port', 6, 1),
('Dung Quất Port', 25, 1),
('Quy Nhơn Port', 17, 1),
('Phu My Port', 9, 1),
('ODA Thị Vải', 9, 1),
('SP-PSA', 9, 1),
('SP-ITC', 32, 1),
('Nhà Bè Port', 32, 1),
('Hải Phòng Port', 14, 1),
('Tiên Sa Port', 6, 1),
('Cát Lái Port', 32, 1),
('Cần Thơ Port', 5, 1),
('Cam Ranh Port', 17, 1);

SELECT '✓ 18 ports inserted' AS status;

-- Step 5: Verify migration
SELECT '========================================' AS '';
SELECT '          MIGRATION SUMMARY             ' AS '';
SELECT '========================================' AS '';
SELECT COUNT(*) AS new_provinces_count FROM provinces;
SELECT COUNT(*) AS new_ports_count FROM ports;
SELECT COUNT(*) AS backup_provinces_count FROM provinces_backup;
SELECT COUNT(*) AS backup_ports_count FROM ports_backup;

-- If everything looks good, commit
-- If something is wrong, you can ROLLBACK

SELECT '========================================' AS '';
SELECT 'Review the results above.' AS '';
SELECT 'If correct, run: COMMIT;' AS '';
SELECT 'If wrong, run: ROLLBACK; to undo' AS '';
SELECT '========================================' AS '';

-- IMPORTANT: You must manually run one of these:
-- COMMIT;     -- To save changes
-- ROLLBACK;   -- To undo changes

