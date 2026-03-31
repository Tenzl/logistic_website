-- Add province code column and sync code/name/area by approved mapping.
-- Non-destructive: updates existing rows and inserts missing approved provinces.

START TRANSACTION;

SET @code_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'code'
);

SET @code_col_sql := IF(
    @code_col_exists = 0,
    'ALTER TABLE provinces ADD COLUMN code VARCHAR(10) NULL AFTER name',
    'SELECT 1'
);

PREPARE stmt_code_col FROM @code_col_sql;
EXECUTE stmt_code_col;
DEALLOCATE PREPARE stmt_code_col;

SET @display_name_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'display_name'
);

SET @display_name_col_sql := IF(
    @display_name_col_exists = 0,
    'ALTER TABLE provinces ADD COLUMN display_name VARCHAR(100) NULL AFTER name',
    'SELECT 1'
);

PREPARE stmt_display_name_col FROM @display_name_col_sql;
EXECUTE stmt_display_name_col;
DEALLOCATE PREPARE stmt_display_name_col;

CREATE TEMPORARY TABLE tmp_province_code (
    code VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL,
    name VARCHAR(100) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    display_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
    area VARCHAR(50) COLLATE utf8mb4_unicode_ci NOT NULL
);

CREATE TEMPORARY TABLE tmp_province_alias (
    alias_name VARCHAR(100) COLLATE utf8mb4_unicode_ci PRIMARY KEY,
    canonical_name VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL
);

INSERT INTO tmp_province_code (code, name, display_name, area) VALUES
('01', 'HA NOI', 'Ha Noi', 'NORTHERN'),
('15', 'LAO CAI', 'Lao Cai', 'NORTHERN'),
('19', 'THAI NGUYEN', 'Thai Nguyen', 'NORTHERN'),
('20', 'LANG SON', 'Lang Son', 'NORTHERN'),
('22', 'QUANG NINH', 'Quang Ninh', 'NORTHERN'),
('24', 'BAC NINH', 'Bac Ninh', 'NORTHERN'),
('25', 'PHU THO', 'Phu Tho', 'NORTHERN'),
('31', 'HAI PHONG', 'Hai Phong', 'NORTHERN'),
('33', 'HUNG YEN', 'Hung Yen', 'NORTHERN'),
('37', 'NINH BINH', 'Ninh Binh', 'NORTHERN'),
('38', 'THANH HOA', 'Thanh Hoa', 'MIDDLE'),
('40', 'NGHE AN', 'Nghe An', 'MIDDLE'),
('42', 'HA TINH', 'Ha Tinh', 'MIDDLE'),
('44', 'QUANG TRI', 'Quang Tri', 'MIDDLE'),
('46', 'HUE', 'Hue', 'MIDDLE'),
('48', 'DA NANG', 'Da Nang', 'MIDDLE'),
('51', 'QUANG NGAI', 'Quang Ngai', 'MIDDLE'),
('52', 'GIA LAI', 'Gia Lai', 'MIDDLE'),
('56', 'KHANH HOA', 'Khanh Hoa', 'MIDDLE'),
('75', 'DONG NAI', 'Dong Nai', 'SOUTHERN'),
('79', 'HO CHI MINH', 'Ho Chi Minh', 'SOUTHERN'),
('80', 'TAY NINH', 'Tay Ninh', 'SOUTHERN'),
('82', 'DONG THAP', 'Dong Thap', 'SOUTHERN'),
('86', 'VINH LONG', 'Vinh Long', 'SOUTHERN'),
('91', 'AN GIANG', 'An Giang', 'SOUTHERN'),
('92', 'CAN THO', 'Can Tho', 'SOUTHERN'),
('96', 'CA MAU', 'Ca Mau', 'SOUTHERN');

INSERT INTO tmp_province_alias (alias_name, canonical_name) VALUES
('HA NOI', 'HA NOI'),
('LAO CAI', 'LAO CAI'),
('THAI NGUYEN', 'THAI NGUYEN'),
('LANG SON', 'LANG SON'),
('QUANG NINH', 'QUANG NINH'),
('BAC NINH', 'BAC NINH'),
('PHU THO', 'PHU THO'),
('HAI PHONG', 'HAI PHONG'),
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
('HO CHI MINH', 'HO CHI MINH'),
('TP. HO CHI MINH', 'HO CHI MINH'),
('TP HO CHI MINH', 'HO CHI MINH'),
('DONG NAI', 'DONG NAI'),
('TAY NINH', 'TAY NINH'),
('DONG THAP', 'DONG THAP'),
('VINH LONG', 'VINH LONG'),
('AN GIANG', 'AN GIANG'),
('CAN THO', 'CAN THO'),
('CA MAU', 'CA MAU');

UPDATE provinces p
JOIN tmp_province_alias a
    ON UPPER(REPLACE(TRIM(p.name), '.', '')) COLLATE utf8mb4_unicode_ci = REPLACE(a.alias_name, '.', '') COLLATE utf8mb4_unicode_ci
JOIN tmp_province_code t
    ON a.canonical_name COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
SET p.name = t.name,
    p.display_name = t.display_name,
    p.code = t.code,
    p.area = t.area,
    p.is_active = TRUE,
    p.updated_at = NOW();

SET @next_province_id := (SELECT IFNULL(MAX(id), 0) FROM provinces);

INSERT INTO provinces (id, name, display_name, code, area, is_active, created_at, updated_at)
SELECT (@next_province_id := @next_province_id + 1), t.name, t.display_name, t.code, t.area, TRUE, NOW(), NOW()
FROM tmp_province_code t
LEFT JOIN provinces p ON UPPER(TRIM(p.name)) COLLATE utf8mb4_unicode_ci = t.name COLLATE utf8mb4_unicode_ci
WHERE p.id IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_province_alias;
DROP TEMPORARY TABLE IF EXISTS tmp_province_code;

COMMIT;
