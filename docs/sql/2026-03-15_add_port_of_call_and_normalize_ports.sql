-- Add port_of_call column and normalize existing ports.
-- Rules:
-- 1) keep port name as-is (trim spaces only)
-- 2) port_of_call -> uppercase name stripped of trailing PORT/TERMINAL/ANCHORAGE
-- Example: Nha Be Anchorage -> NHA BE

START TRANSACTION;

SET @port_of_call_col_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ports'
      AND COLUMN_NAME = 'port_of_call'
);

SET @port_of_call_col_sql := IF(
    @port_of_call_col_exists = 0,
    'ALTER TABLE ports ADD COLUMN port_of_call VARCHAR(100) NULL AFTER name',
    'SELECT 1'
);

PREPARE stmt_port_of_call_col FROM @port_of_call_col_sql;
EXECUTE stmt_port_of_call_col;
DEALLOCATE PREPARE stmt_port_of_call_col;

UPDATE ports
SET name = TRIM(REGEXP_REPLACE(name, '\\s+', ' ')),
    port_of_call = COALESCE(NULLIF(
        TRIM(
            REGEXP_REPLACE(
                UPPER(TRIM(REGEXP_REPLACE(name, '\\s+', ' '))),
                '(\\s+(PORT|TERMINAL|ANCHORAGE))+$',
                ''
            )
        ),
        ''
    ), UPPER(TRIM(REGEXP_REPLACE(name, '\\s+', ' ')))),
    updated_at = NOW();

COMMIT;
