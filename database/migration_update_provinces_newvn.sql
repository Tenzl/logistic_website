-- Migration: Update provinces from newvn.geojson
-- This migration updates the provinces table with data from newvn.geojson
-- The new data contains 34 provinces (instead of 63 from old vn.json)

-- IMPORTANT: Backup existing data first!
-- Uncomment these lines to create backup tables:
-- DROP TABLE IF EXISTS provinces_backup;
-- DROP TABLE IF EXISTS ports_backup;
-- CREATE TABLE provinces_backup AS SELECT * FROM provinces;
-- CREATE TABLE ports_backup AS SELECT * FROM ports;

-- Clear existing data completely
-- IMPORTANT: Disable foreign key checks to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Delete all data from tables that reference provinces
-- (in reverse dependency order)

-- 1. Delete gallery_images first (references provinces)
DELETE FROM gallery_images WHERE province_id IS NOT NULL;
ALTER TABLE gallery_images AUTO_INCREMENT = 1;

-- 2. Delete ports (references provinces)
DELETE FROM ports;
ALTER TABLE ports AUTO_INCREMENT = 1;

-- 3. Now safe to delete provinces
DELETE FROM provinces;
ALTER TABLE provinces AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Note: gallery_images data is backed up if you ran backup_before_migration.sql

-- Optional: Show that tables are now empty
-- SELECT COUNT(*) as provinces_count FROM provinces;
-- SELECT COUNT(*) as ports_count FROM ports;

-- Insert 34 provinces from newvn.geojson
-- ID matches ma_tinh from geojson (sorted by id for clarity)
INSERT INTO provinces (id, name, is_active) VALUES
(1, 'Hà Nội', 1),              -- ma_tinh: 01
(4, 'Cao Bằng', 1),            -- ma_tinh: 04
(8, 'Tuyên Quang', 1),         -- ma_tinh: 08
(11, 'Điện Biên', 1),          -- ma_tinh: 11
(12, 'Lai Châu', 1),           -- ma_tinh: 12
(14, 'Sơn La', 1),             -- ma_tinh: 14
(15, 'Lào Cai', 1),            -- ma_tinh: 15
(19, 'Thái Nguyên', 1),        -- ma_tinh: 19
(20, 'Lạng Sơn', 1),           -- ma_tinh: 20
(22, 'Quảng Ninh', 1),         -- ma_tinh: 22
(24, 'Bắc Ninh', 1),           -- ma_tinh: 24
(25, 'Phú Thọ', 1),            -- ma_tinh: 25
(31, 'Hải Phòng', 1),          -- ma_tinh: 31
(33, 'Hưng Yên', 1),           -- ma_tinh: 33
(37, 'Ninh Bình', 1),          -- ma_tinh: 37
(38, 'Thanh Hóa', 1),          -- ma_tinh: 38
(40, 'Nghệ An', 1),            -- ma_tinh: 40
(42, 'Hà Tĩnh', 1),            -- ma_tinh: 42
(44, 'Quảng Trị', 1),          -- ma_tinh: 44
(46, 'Huế', 1),                -- ma_tinh: 46
(48, 'Đà Nẵng', 1),            -- ma_tinh: 48
(51, 'Quảng Ngãi', 1),         -- ma_tinh: 51
(52, 'Gia Lai', 1),            -- ma_tinh: 52
(56, 'Khánh Hòa', 1),          -- ma_tinh: 56
(66, 'Đắk Lắk', 1),            -- ma_tinh: 66
(68, 'Lâm Đồng', 1),           -- ma_tinh: 68
(75, 'Đồng Nai', 1),           -- ma_tinh: 75
(79, 'TP. Hồ Chí Minh', 1),   -- ma_tinh: 79
(80, 'Tây Ninh', 1),           -- ma_tinh: 80
(82, 'Đồng Tháp', 1),          -- ma_tinh: 82
(86, 'Vĩnh Long', 1),          -- ma_tinh: 86
(91, 'An Giang', 1),           -- ma_tinh: 91
(92, 'Cần Thơ', 1),            -- ma_tinh: 92
(96, 'Cà Mau', 1);             -- ma_tinh: 96

-- Insert ports with province_id matching ma_tinh from newvn.geojson
INSERT INTO ports (name, province_id, is_active) VALUES
-- Quảng Ninh (ma_tinh: 22)
('Cái Lân (Cai Lan Port)', 22, 1),

-- Thanh Hóa (ma_tinh: 38)
('Nghi Sơn Port', 38, 1),

-- Nghệ An (ma_tinh: 40)
('Cửa Lò Port', 40, 1),

-- Hà Tĩnh (ma_tinh: 42)
('Vũng Áng Port', 42, 1),

-- Huế (ma_tinh: 46)
('Chân Mây Port', 46, 1),

-- Đà Nẵng (ma_tinh: 48)
('Tiên Sa Port', 48, 1),
('Chu Lai Port', 48, 1),  -- ⚠️ Mapped from Quảng Nam (not in 34 provinces)

-- Quảng Ngãi (ma_tinh: 51)
('Dung Quất Port', 51, 1),

-- Khánh Hòa (ma_tinh: 56)
('Cam Ranh Port', 56, 1),
('Quy Nhơn Port', 56, 1),  -- ⚠️ Mapped from Bình Định (not in 34 provinces)

-- Đồng Nai (ma_tinh: 75)
('Phu My Port', 75, 1),    -- ⚠️ Mapped from Bà Rịa - Vũng Tàu (not in 34 provinces)
('ODA Thị Vải', 75, 1),    -- ⚠️ Mapped from Bà Rịa - Vũng Tàu
('SP-PSA', 75, 1),         -- ⚠️ Mapped from Bà Rịa - Vũng Tàu

-- TP. Hồ Chí Minh (ma_tinh: 79)
('SP-ITC', 79, 1),
('Nhà Bè Port', 79, 1),
('Cát Lái Port', 79, 1),

-- Hải Phòng (ma_tinh: 31)
('Hải Phòng Port', 31, 1),

-- Cần Thơ (ma_tinh: 92)
('Cần Thơ Port', 92, 1);

-- Note: Province IDs now match ma_tinh from newvn.geojson
-- ⚠️ Some ports mapped to nearby provinces (original province not in 34-province list)

-- Verify the migration
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_provinces FROM provinces;
SELECT COUNT(*) AS total_ports FROM ports;

-- Display all provinces
SELECT id, name FROM provinces ORDER BY name;

