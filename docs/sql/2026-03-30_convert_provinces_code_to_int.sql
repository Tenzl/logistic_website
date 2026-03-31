-- Convert provinces.code from VARCHAR to INT.
-- Notes:
-- 1) Non-numeric values are set to NULL before type conversion.
-- 2) Numeric strings are cast to integers (e.g. '01' -> 1).

SET @provinces_exists := (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
);

SET @has_code := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'code'
);

SET @code_data_type := (
    SELECT DATA_TYPE
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'code'
    LIMIT 1
);

SET @is_text_code := IF(
    @code_data_type IN ('char', 'varchar', 'text', 'tinytext', 'mediumtext', 'longtext'),
    1,
    0
);

SET @sql_trim_blank_to_null := IF(
    @provinces_exists = 1 AND @has_code = 1 AND @is_text_code = 1,
    'UPDATE provinces
     SET code = NULLIF(TRIM(CAST(code AS CHAR)), '''')
     WHERE code IS NOT NULL',
    'SELECT 1'
);

PREPARE stmt_trim_blank_to_null FROM @sql_trim_blank_to_null;
EXECUTE stmt_trim_blank_to_null;
DEALLOCATE PREPARE stmt_trim_blank_to_null;

SET @sql_null_non_numeric := IF(
    @provinces_exists = 1 AND @has_code = 1 AND @is_text_code = 1,
    'UPDATE provinces
     SET code = NULL
     WHERE code IS NOT NULL
       AND TRIM(CAST(code AS CHAR)) <> ''''
       AND TRIM(CAST(code AS CHAR)) NOT REGEXP ''^[0-9]+$''',
    'SELECT 1'
);

PREPARE stmt_null_non_numeric FROM @sql_null_non_numeric;
EXECUTE stmt_null_non_numeric;
DEALLOCATE PREPARE stmt_null_non_numeric;

SET @sql_cast_numeric_text := IF(
    @provinces_exists = 1 AND @has_code = 1 AND @is_text_code = 1,
    'UPDATE provinces
     SET code = CAST(TRIM(CAST(code AS CHAR)) AS UNSIGNED)
     WHERE code IS NOT NULL
       AND TRIM(CAST(code AS CHAR)) REGEXP ''^[0-9]+$''',
    'SELECT 1'
);

PREPARE stmt_cast_numeric_text FROM @sql_cast_numeric_text;
EXECUTE stmt_cast_numeric_text;
DEALLOCATE PREPARE stmt_cast_numeric_text;

SET @sql_modify_code_to_int := IF(
    @provinces_exists = 1 AND @has_code = 1,
    'ALTER TABLE provinces MODIFY COLUMN code INT NULL',
    'SELECT 1'
);

PREPARE stmt_modify_code_to_int FROM @sql_modify_code_to_int;
EXECUTE stmt_modify_code_to_int;
DEALLOCATE PREPARE stmt_modify_code_to_int;

SET @has_unique_code_index := (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'provinces'
      AND COLUMN_NAME = 'code'
      AND NON_UNIQUE = 0
);

SET @sql_add_unique_code_index := IF(
    @provinces_exists = 1 AND @has_code = 1 AND @has_unique_code_index = 0,
    'ALTER TABLE provinces ADD UNIQUE KEY uk_provinces_code (code)',
    'SELECT 1'
);

PREPARE stmt_add_unique_code_index FROM @sql_add_unique_code_index;
EXECUTE stmt_add_unique_code_index;
DEALLOCATE PREPARE stmt_add_unique_code_index;
