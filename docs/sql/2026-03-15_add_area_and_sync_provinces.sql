-- Add area column to provinces and synchronize province names/areas.
-- This script enforces the approved province list by:
-- 1) Normalizing known legacy names
-- 2) Updating name + area for approved provinces
-- 3) Inserting missing approved provinces
-- 4) Removing provinces outside the approved list

START TRANSACTION;

SET @area_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'area'
);

SET @area_col_sql := IF(
    @area_col_exists = 0,
    'ALTER TABLE provinces ADD COLUMN area VARCHAR(50) NULL AFTER name',
    'SELECT 1'
);

PREPARE stmt_area_col FROM @area_col_sql;
EXECUTE stmt_area_col;
DEALLOCATE PREPARE stmt_area_col;

CREATE TEMPORARY TABLE tmp_province_area (
    name VARCHAR(100) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    area VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL
);

CREATE TEMPORARY TABLE tmp_province_alias (
    alias_name VARCHAR(100) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    canonical_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL
);

INSERT INTO tmp_province_area (name, area) VALUES
('QUANG NINH', 'NORTHERN'),
('HAI PHONG', 'NORTHERN'),
('HA NOI', 'NORTHERN'),
('LAO CAI', 'NORTHERN'),
('THAI NGUYEN', 'NORTHERN'),
('LANG SON', 'NORTHERN'),
('BAC NINH', 'NORTHERN'),
('PHU THO', 'NORTHERN'),
('HUNG YEN', 'NORTHERN'),
('NINH BINH', 'NORTHERN'),
('THANH HOA', 'MIDDLE'),
('NGHE AN', 'MIDDLE'),
('HA TINH', 'MIDDLE'),
('QUANG TRI', 'MIDDLE'),
('HUE', 'MIDDLE'),
('DA NANG', 'MIDDLE'),
('QUANG NGAI', 'MIDDLE'),
('GIA LAI', 'MIDDLE'),
('KHANH HOA', 'MIDDLE'),
('TP HO CHI MINH', 'SOUTHERN'),
('DONG NAI', 'SOUTHERN'),
('CAN THO', 'SOUTHERN'),
('CA MAU', 'SOUTHERN'),
('TAY NINH', 'SOUTHERN'),
('DONG THAP', 'SOUTHERN'),
('VINH LONG', 'SOUTHERN'),
('AN GIANG', 'SOUTHERN');

INSERT INTO tmp_province_alias (alias_name, canonical_name) VALUES
('QUANG NINH', 'QUANG NINH'),
('HAI PHONG', 'HAI PHONG'),
('HA NOI', 'HA NOI'),
('LAO CAI', 'LAO CAI'),
('THAI NGUYEN', 'THAI NGUYEN'),
('LANG SON', 'LANG SON'),
('BAC NINH', 'BAC NINH'),
('PHU THO', 'PHU THO'),
('HUNG YEN', 'HUNG YEN'),
('NINH BINH', 'NINH BINH'),
('THANH HOA', 'THANH HOA'),
('NGHE AN', 'NGHE AN'),
('HA TINH', 'HA TINH'),
('QUANG TRI', 'QUANG TRI'),
('HUE', 'HUE'),
('THUA THIEN HUE', 'HUE'),
('DA NANG', 'DA NANG'),
('QUANG NGAI', 'QUANG NGAI'),
('GIA LAI', 'GIA LAI'),
('KHANH HOA', 'KHANH HOA'),
('TP HO CHI MINH', 'TP HO CHI MINH'),
('TP. HO CHI MINH', 'TP HO CHI MINH'),
('HO CHI MINH', 'TP HO CHI MINH'),
('DONG NAI', 'DONG NAI'),
('CAN THO', 'CAN THO'),
('CA MAU', 'CA MAU'),
('TAY NINH', 'TAY NINH'),
('DONG THAP', 'DONG THAP'),
('VINH LONG', 'VINH LONG'),
('AN GIANG', 'AN GIANG');

-- Normalize names to uppercase and assign area for provinces in the approved list.
UPDATE provinces p
JOIN tmp_province_alias a
    ON UPPER(REPLACE(TRIM(p.name), '.', '')) COLLATE utf8mb4_unicode_ci = REPLACE(a.alias_name, '.', '') COLLATE utf8mb4_unicode_ci
JOIN tmp_province_area t
    ON a.canonical_name COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
SET p.name = a.canonical_name,
    p.area = t.area,
    p.is_active = TRUE,
    p.updated_at = NOW();

-- Insert approved provinces that do not exist yet.
SET @next_province_id := (SELECT IFNULL(MAX(id), 0) FROM provinces);

INSERT INTO provinces (id, name, area, is_active, created_at, updated_at)
SELECT (@next_province_id := @next_province_id + 1), t.name, t.area, TRUE, NOW(), NOW()
FROM tmp_province_area t
LEFT JOIN provinces p ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE p.id IS NULL;

-- Remove dependent rows before deleting provinces outside the approved list.
DELETE gi
FROM gallery_images gi
JOIN provinces p ON p.id = gi.province_id
LEFT JOIN tmp_province_area t ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE t.name IS NULL;

DELETE o
FROM offices o
JOIN provinces p ON p.id = o.province_id
LEFT JOIN tmp_province_area t ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE t.name IS NULL;

DELETE pt
FROM ports pt
JOIN provinces p ON p.id = pt.province_id
LEFT JOIN tmp_province_area t ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE t.name IS NULL;

-- Remove provinces not in approved list.
DELETE p
FROM provinces p
LEFT JOIN tmp_province_area t ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE t.name IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_province_alias;
DROP TEMPORARY TABLE IF EXISTS tmp_province_area;

COMMIT;
