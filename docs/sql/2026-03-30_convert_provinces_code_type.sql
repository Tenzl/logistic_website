-- 1. Drop existing uk on code (if exists) so we can modify the column
-- The constraint name is usually formed based on the table name.
-- In some dialects you might just use `ALTER TABLE provinces DROP INDEX code;`
SET @constraint_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'provinces' 
      AND COLUMN_NAME = 'code'
    LIMIT 1
);

SET @sql_drop_index = IF(
    @constraint_name IS NOT NULL,
    CONCAT('ALTER TABLE provinces DROP INDEX ', @constraint_name),
    'SELECT 1'
);

PREPARE stmt_drop_index FROM @sql_drop_index;
EXECUTE stmt_drop_index;
DEALLOCATE PREPARE stmt_drop_index;

-- 2. Modify column type from varchar to int
ALTER TABLE provinces MODIFY COLUMN code INT NULL;

-- 3. Re-add unique constraint
ALTER TABLE provinces ADD UNIQUE INDEX uk_provinces_code (code);
