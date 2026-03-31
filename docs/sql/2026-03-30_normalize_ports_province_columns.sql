-- Normalize ports province columns
-- Goal:
-- 1) Move legacy varchar province_code into numeric province_id (BIGINT)
-- 2) Convert province_id to numeric if currently string-like
-- 3) Drop legacy province_code and province_number

SET @ports_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
);

-- Ensure province_id exists.
SET @has_province_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_id'
);

SET @sql_add_province_id := IF(
    @ports_exists = 1 AND @has_province_id = 0,
    'ALTER TABLE ports ADD COLUMN province_id BIGINT NULL',
    'SELECT 1'
);

PREPARE stmt_add_province_id FROM @sql_add_province_id;
EXECUTE stmt_add_province_id;
DEALLOCATE PREPARE stmt_add_province_id;

-- Refresh after potential ADD COLUMN.
SET @has_province_id := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_id'
);

SET @has_province_code := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_code'
);

-- Migrate province_code -> province_id.
-- Supports both legacy styles:
-- - province_code stores provinces.code (varchar)
-- - province_code stores provinces.id as numeric string
SET @sql_migrate_from_province_code := IF(
    @ports_exists = 1 AND @has_province_id = 1 AND @has_province_code = 1,
    'UPDATE ports pt
     LEFT JOIN provinces p_by_code
       ON p_by_code.code = TRIM(CAST(pt.province_code AS CHAR))
     LEFT JOIN provinces p_by_id
       ON (
             TRIM(CAST(pt.province_code AS CHAR)) REGEXP ''^[0-9]+$''
         AND p_by_id.id = CAST(TRIM(CAST(pt.province_code AS CHAR)) AS UNSIGNED)
       )
     SET pt.province_id = COALESCE(pt.province_id, p_by_code.id, p_by_id.id)
     WHERE pt.province_code IS NOT NULL
       AND TRIM(CAST(pt.province_code AS CHAR)) <> ''''',
    'SELECT 1'
);

PREPARE stmt_migrate_from_province_code FROM @sql_migrate_from_province_code;
EXECUTE stmt_migrate_from_province_code;
DEALLOCATE PREPARE stmt_migrate_from_province_code;

-- Detect current province_id data type.
SET @province_id_data_type := (
    SELECT DATA_TYPE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_id'
    LIMIT 1
);

SET @needs_province_id_convert := IF(
    @province_id_data_type IN ('char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext'),
    1,
    0
);

SET @has_province_id_tmp := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_id_tmp'
);

SET @sql_add_province_id_tmp := IF(
    @ports_exists = 1 AND @needs_province_id_convert = 1 AND @has_province_id_tmp = 0,
    'ALTER TABLE ports ADD COLUMN province_id_tmp BIGINT NULL AFTER province_id',
    'SELECT 1'
);

PREPARE stmt_add_province_id_tmp FROM @sql_add_province_id_tmp;
EXECUTE stmt_add_province_id_tmp;
DEALLOCATE PREPARE stmt_add_province_id_tmp;

SET @sql_fill_province_id_tmp := IF(
    @ports_exists = 1 AND @needs_province_id_convert = 1,
    'UPDATE ports pt
     LEFT JOIN provinces p_by_code
       ON p_by_code.code = TRIM(CAST(pt.province_id AS CHAR))
     LEFT JOIN provinces p_by_id
       ON (
             TRIM(CAST(pt.province_id AS CHAR)) REGEXP ''^[0-9]+$''
         AND p_by_id.id = CAST(TRIM(CAST(pt.province_id AS CHAR)) AS UNSIGNED)
       )
     SET pt.province_id_tmp = COALESCE(p_by_code.id, p_by_id.id)
     WHERE pt.province_id IS NOT NULL
       AND TRIM(CAST(pt.province_id AS CHAR)) <> ''''',
    'SELECT 1'
);

PREPARE stmt_fill_province_id_tmp FROM @sql_fill_province_id_tmp;
EXECUTE stmt_fill_province_id_tmp;
DEALLOCATE PREPARE stmt_fill_province_id_tmp;

SET @sql_drop_old_province_id := IF(
    @ports_exists = 1 AND @needs_province_id_convert = 1,
    'ALTER TABLE ports DROP COLUMN province_id',
    'SELECT 1'
);

PREPARE stmt_drop_old_province_id FROM @sql_drop_old_province_id;
EXECUTE stmt_drop_old_province_id;
DEALLOCATE PREPARE stmt_drop_old_province_id;

SET @sql_rename_province_id_tmp := IF(
    @ports_exists = 1 AND @needs_province_id_convert = 1,
    'ALTER TABLE ports CHANGE COLUMN province_id_tmp province_id BIGINT NULL',
    'SELECT 1'
);

PREPARE stmt_rename_province_id_tmp FROM @sql_rename_province_id_tmp;
EXECUTE stmt_rename_province_id_tmp;
DEALLOCATE PREPARE stmt_rename_province_id_tmp;

-- Final normalize province_id type.
SET @sql_modify_province_id := IF(
    @ports_exists = 1,
    'ALTER TABLE ports MODIFY COLUMN province_id BIGINT NULL',
    'SELECT 1'
);

PREPARE stmt_modify_province_id FROM @sql_modify_province_id;
EXECUTE stmt_modify_province_id;
DEALLOCATE PREPARE stmt_modify_province_id;

-- Keep only valid references.
SET @sql_null_invalid_province_id := IF(
    @ports_exists = 1,
    'UPDATE ports pt
     LEFT JOIN provinces p ON p.id = pt.province_id
     SET pt.province_id = NULL
     WHERE pt.province_id IS NOT NULL
       AND p.id IS NULL',
    'SELECT 1'
);

PREPARE stmt_null_invalid_province_id FROM @sql_null_invalid_province_id;
EXECUTE stmt_null_invalid_province_id;
DEALLOCATE PREPARE stmt_null_invalid_province_id;

-- Drop legacy columns province_code + province_number.
SET @has_province_code := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_code'
);

SET @sql_drop_province_code := IF(
    @ports_exists = 1 AND @has_province_code = 1,
    'ALTER TABLE ports DROP COLUMN province_code',
    'SELECT 1'
);

PREPARE stmt_drop_province_code FROM @sql_drop_province_code;
EXECUTE stmt_drop_province_code;
DEALLOCATE PREPARE stmt_drop_province_code;

SET @has_province_number := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'province_number'
);

SET @sql_drop_province_number := IF(
    @ports_exists = 1 AND @has_province_number = 1,
    'ALTER TABLE ports DROP COLUMN province_number',
    'SELECT 1'
);

PREPARE stmt_drop_province_number FROM @sql_drop_province_number;
EXECUTE stmt_drop_province_number;
DEALLOCATE PREPARE stmt_drop_province_number;
