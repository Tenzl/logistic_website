-- =====================================================================
-- ROLLBACK SCRIPT FOR PRICING DATABASE REFACTOR
-- =====================================================================
-- Use this to undo the changes if needed
-- WARNING: This will lose data in the new tables (rate_tiers, rate_rules, invoice_admin_*)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- STEP 1: Rollback InvoiceAdminField and InvoiceAdminValue
-- =====================================================================

DROP TABLE IF EXISTS invoice_admin_values;
DROP TABLE IF EXISTS invoice_admin_fields;

-- =====================================================================
-- STEP 2: Rollback RateTier and RateRule
-- =====================================================================

DROP TABLE IF EXISTS rate_rules;
DROP TABLE IF EXISTS rate_tiers;

-- =====================================================================
-- STEP 3: Rollback RateTableConfig changes
-- =====================================================================

SET @col_lookup_mode_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rate_table_configs' AND COLUMN_NAME = 'lookup_mode');
SET @col_axis_var_key_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rate_table_configs' AND COLUMN_NAME = 'axis_var_key');

SET @drop_lookup_mode = IF(@col_lookup_mode_exists > 0, 
    'ALTER TABLE rate_table_configs DROP COLUMN lookup_mode', 
    'SELECT "lookup_mode does not exist" AS Info');
PREPARE stmt FROM @drop_lookup_mode;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_axis_var_key = IF(@col_axis_var_key_exists > 0, 
    'ALTER TABLE rate_table_configs DROP COLUMN axis_var_key', 
    'SELECT "axis_var_key does not exist" AS Info');
PREPARE stmt FROM @drop_axis_var_key;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'rate_table_configs' 
    AND INDEX_NAME = 'idx_rate_table_configs_unique_code');

SET @drop_idx = IF(@idx_exists > 0, 
    'DROP INDEX idx_rate_table_configs_unique_code ON rate_table_configs', 
    'SELECT "Index does not exist" AS Info');
PREPARE stmt FROM @drop_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================================
-- STEP 4: Rollback ConditionalRule changes
-- =====================================================================

SET @col_value_json_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_rules' AND COLUMN_NAME = 'value_json');

SET @drop_value_json = IF(@col_value_json_exists > 0, 
    'ALTER TABLE conditional_rules DROP COLUMN value_json', 
    'SELECT "value_json does not exist" AS Info');
PREPARE stmt FROM @drop_value_json;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE conditional_rules 
    MODIFY COLUMN formula_line_id BIGINT NULL;

SET @idx_rules_fl_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_rules' AND INDEX_NAME = 'idx_conditional_rules_formula_line');
SET @idx_rules_tier_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_rules' AND INDEX_NAME = 'idx_conditional_rules_tier');

SET @drop_idx_fl = IF(@idx_rules_fl_exists > 0, 
    'DROP INDEX idx_conditional_rules_formula_line ON conditional_rules', 
    'SELECT "Index does not exist" AS Info');
PREPARE stmt FROM @drop_idx_fl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_idx_tier = IF(@idx_rules_tier_exists > 0, 
    'DROP INDEX idx_conditional_rules_tier ON conditional_rules', 
    'SELECT "Index does not exist" AS Info');
PREPARE stmt FROM @drop_idx_tier;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================================
-- STEP 5: Rollback ConditionalTier changes
-- =====================================================================

SET @col_op_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'op');
SET @col_range_type_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'range_type');
SET @col_note_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'note');

SET @drop_op = IF(@col_op_exists > 0, 
    'ALTER TABLE conditional_tiers DROP COLUMN op', 
    'SELECT "op does not exist" AS Info');
PREPARE stmt FROM @drop_op;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_range_type = IF(@col_range_type_exists > 0, 
    'ALTER TABLE conditional_tiers DROP COLUMN range_type', 
    'SELECT "range_type does not exist" AS Info');
PREPARE stmt FROM @drop_range_type;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_note = IF(@col_note_exists > 0, 
    'ALTER TABLE conditional_tiers DROP COLUMN note', 
    'SELECT "note does not exist" AS Info');
PREPARE stmt FROM @drop_note;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_rtc_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'rate_table_config_id');

SET @add_rtc = IF(@col_rtc_exists = 0, 
    'ALTER TABLE conditional_tiers ADD COLUMN rate_table_config_id BIGINT AFTER formula_line_id', 
    'SELECT "rate_table_config_id exists" AS Info');
PREPARE stmt FROM @add_rtc;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'conditional_tiers' 
    AND CONSTRAINT_NAME = 'fk_conditional_tiers_rate_table_config');

SET @add_fk = IF(@fk_exists = 0, 
    'ALTER TABLE conditional_tiers ADD CONSTRAINT fk_conditional_tiers_rate_table_config FOREIGN KEY (rate_table_config_id) REFERENCES rate_table_configs(id)', 
    'SELECT "FK exists" AS Info');
PREPARE stmt FROM @add_fk;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE conditional_tiers 
    MODIFY COLUMN formula_line_id BIGINT NULL;

SET @idx_exists = (SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND INDEX_NAME = 'idx_conditional_tiers_formula_line');

SET @drop_idx = IF(@idx_exists > 0, 
    'DROP INDEX idx_conditional_tiers_formula_line ON conditional_tiers', 
    'SELECT "Index does not exist" AS Info');
PREPARE stmt FROM @drop_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- ROLLBACK COMPLETE
-- =====================================================================
-- Remember to restore from backup if you need the actual data:
-- mysql -u root -p seatrans < backup_before_final_refactor_YYYYMMDD_HHMMSS.sql
-- =====================================================================
