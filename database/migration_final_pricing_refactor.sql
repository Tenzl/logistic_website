-- =====================================================================
-- PRICING DATABASE REFACTOR - FINAL SCHEMA MIGRATION
-- =====================================================================
-- This migration implements Option A with complete separation of concerns:
-- 1. ConditionalTier/Rule OWNED by FormulaLine (formula_line_id NOT NULL)
-- 2. RateTier/RateRule separate for rate table lookup
-- 3. InvoiceAdminField/Value for admin-only invoice inputs
-- =====================================================================

-- BACKUP REMINDER
-- Before running, create backup:
-- mysqldump -u root -p seatrans > backup_before_final_refactor_$(date +%Y%m%d_%H%M%S).sql

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- STEP 1: Update ConditionalTier - Make formula_line_id NOT NULL
-- =====================================================================

-- First, handle any orphaned tiers (tiers without formula_line_id)
-- Option A: Delete orphaned tiers
DELETE FROM conditional_rules WHERE conditional_tier_id IN (
    SELECT id FROM conditional_tiers WHERE formula_line_id IS NULL
);
DELETE FROM conditional_tiers WHERE formula_line_id IS NULL;

-- Option B: If you want to migrate them, create a "default" formula line first
-- Then: UPDATE conditional_tiers SET formula_line_id = <default_id> WHERE formula_line_id IS NULL;

-- Drop the rate_table_config relationship from conditional_tiers
-- Check if foreign key exists first
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'conditional_tiers' 
    AND CONSTRAINT_NAME = 'fk_conditional_tiers_rate_table_config');

SET @drop_fk_sql = IF(@fk_exists > 0, 
    'ALTER TABLE conditional_tiers DROP FOREIGN KEY fk_conditional_tiers_rate_table_config', 
    'SELECT "FK does not exist" AS Info');
PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if column exists before dropping
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'conditional_tiers' 
    AND COLUMN_NAME = 'rate_table_config_id');

SET @drop_col_sql = IF(@col_exists > 0, 
    'ALTER TABLE conditional_tiers DROP COLUMN rate_table_config_id', 
    'SELECT "Column does not exist" AS Info');
PREPARE stmt FROM @drop_col_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make formula_line_id NOT NULL
ALTER TABLE conditional_tiers 
    MODIFY COLUMN formula_line_id BIGINT NOT NULL;

-- Add new columns to conditional_tiers
SET @col_op_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'op');
SET @col_range_type_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'range_type');
SET @col_note_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_tiers' AND COLUMN_NAME = 'note');

SET @add_op = IF(@col_op_exists = 0, 'ALTER TABLE conditional_tiers ADD COLUMN op VARCHAR(20) AFTER max_value', 'SELECT "op exists" AS Info');
PREPARE stmt FROM @add_op;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_range_type = IF(@col_range_type_exists = 0, 'ALTER TABLE conditional_tiers ADD COLUMN range_type VARCHAR(20) AFTER op', 'SELECT "range_type exists" AS Info');
PREPARE stmt FROM @add_range_type;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_note = IF(@col_note_exists = 0, 'ALTER TABLE conditional_tiers ADD COLUMN note TEXT AFTER range_type', 'SELECT "note exists" AS Info');
PREPARE stmt FROM @add_note;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conditional_tiers_formula_line 
    ON conditional_tiers(formula_line_id, order_no);

-- =====================================================================
-- STEP 2: Update ConditionalRule - Make formula_line_id NOT NULL
-- =====================================================================

-- Handle orphaned rules (rules without formula_line_id)
-- Populate formula_line_id from their parent tier
UPDATE conditional_rules cr
INNER JOIN conditional_tiers ct ON cr.conditional_tier_id = ct.id
SET cr.formula_line_id = ct.formula_line_id
WHERE cr.formula_line_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE conditional_rules 
    MODIFY COLUMN formula_line_id BIGINT NOT NULL;

-- Add value_json column for complex types
SET @col_value_json_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conditional_rules' AND COLUMN_NAME = 'value_json');

SET @add_value_json = IF(@col_value_json_exists = 0, 
    'ALTER TABLE conditional_rules ADD COLUMN value_json TEXT AFTER value', 
    'SELECT "value_json exists" AS Info');
PREPARE stmt FROM @add_value_json;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conditional_rules_formula_line 
    ON conditional_rules(formula_line_id);
CREATE INDEX IF NOT EXISTS idx_conditional_rules_tier 
    ON conditional_rules(conditional_tier_id, order_no);

-- =====================================================================
-- STEP 3: Create RateTier and RateRule tables (separate from ConditionalTier)
-- =====================================================================

CREATE TABLE IF NOT EXISTS rate_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rate_table_config_id BIGINT NOT NULL,
    order_no INT NOT NULL,
    min_value DOUBLE,
    max_value DOUBLE,
    result_value DOUBLE NOT NULL,
    note TEXT,
    CONSTRAINT fk_rate_tiers_rate_table_config 
        FOREIGN KEY (rate_table_config_id) 
        REFERENCES rate_table_configs(id) 
        ON DELETE CASCADE,
    INDEX idx_rate_tiers_config (rate_table_config_id, order_no),
    INDEX idx_rate_tiers_range (rate_table_config_id, min_value, max_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rate_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rate_tier_id BIGINT NOT NULL,
    order_no INT NOT NULL,
    var_key VARCHAR(100) NOT NULL,
    op VARCHAR(20) NOT NULL,
    value TEXT,
    min_value DOUBLE,
    max_value DOUBLE,
    note TEXT,
    CONSTRAINT fk_rate_rules_rate_tier 
        FOREIGN KEY (rate_tier_id) 
        REFERENCES rate_tiers(id) 
        ON DELETE CASCADE,
    INDEX idx_rate_rules_tier (rate_tier_id, order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- STEP 4: Update RateTableConfig
-- =====================================================================

-- Add new columns
SET @col_lookup_mode_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rate_table_configs' AND COLUMN_NAME = 'lookup_mode');
SET @col_axis_var_key_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'rate_table_configs' AND COLUMN_NAME = 'axis_var_key');

SET @add_lookup_mode = IF(@col_lookup_mode_exists = 0, 
    'ALTER TABLE rate_table_configs ADD COLUMN lookup_mode VARCHAR(20) NOT NULL DEFAULT ''TIERED'' AFTER basis', 
    'SELECT "lookup_mode exists" AS Info');
PREPARE stmt FROM @add_lookup_mode;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_axis_var_key = IF(@col_axis_var_key_exists = 0, 
    'ALTER TABLE rate_table_configs ADD COLUMN axis_var_key VARCHAR(100) AFTER lookup_mode', 
    'SELECT "axis_var_key exists" AS Info');
PREPARE stmt FROM @add_axis_var_key;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Populate axis_var_key from primary_var_key where applicable
UPDATE rate_table_configs 
SET axis_var_key = primary_var_key 
WHERE axis_var_key IS NULL AND basis = 'tier';

-- Create unique index on (pricing_group_id, code) for lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_table_configs_unique_code 
    ON rate_table_configs(pricing_group_id, code);

-- =====================================================================
-- STEP 5: Create InvoiceAdminField and InvoiceAdminValue tables
-- =====================================================================

CREATE TABLE IF NOT EXISTS invoice_admin_fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pricing_group_id BIGINT NOT NULL,
    var_key VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    input_type VARCHAR(20) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    unit VARCHAR(50),
    options_json TEXT,
    order_no INT NOT NULL,
    note TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_admin_fields_pricing_group 
        FOREIGN KEY (pricing_group_id) 
        REFERENCES pricing_groups(id) 
        ON DELETE CASCADE,
    UNIQUE INDEX idx_invoice_admin_fields_unique (pricing_group_id, var_key),
    INDEX idx_invoice_admin_fields_order (pricing_group_id, order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoice_admin_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    estimate_id BIGINT NOT NULL,
    admin_field_id BIGINT NOT NULL,
    value_number DOUBLE,
    value_text TEXT,
    value_bool BOOLEAN,
    value_json TEXT,
    updated_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_admin_values_estimate 
        FOREIGN KEY (estimate_id) 
        REFERENCES saved_estimates(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_invoice_admin_values_field 
        FOREIGN KEY (admin_field_id) 
        REFERENCES invoice_admin_fields(id) 
        ON DELETE CASCADE,
    UNIQUE INDEX idx_invoice_admin_values_unique (estimate_id, admin_field_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- STEP 6: Data Migration (if needed)
-- =====================================================================

-- If you have existing rate table configs using ConditionalTier,
-- you need to migrate them to RateTier/RateRule
-- This is highly dependent on your current data structure

-- Example migration (adjust based on your actual data):
-- INSERT INTO rate_tiers (rate_table_config_id, order_no, min_value, max_value, result_value, note)
-- SELECT 
--     ct.rate_table_config_id,
--     ct.order_no,
--     ct.min_value,
--     ct.max_value,
--     ct.price,
--     ct.tier_name
-- FROM conditional_tiers ct
-- WHERE ct.rate_table_config_id IS NOT NULL;

-- Migrate admin inputs to invoice_admin_fields (where appropriate)
-- INSERT INTO invoice_admin_fields (pricing_group_id, var_key, label, input_type, required, unit, order_no, note)
-- SELECT 
--     <determine_pricing_group_id>,
--     ai.variable_name,
--     ai.label,
--     ai.input_type,
--     ai.is_required,
--     ai.unit,
--     <assign_order_no>,
--     ai.description
-- FROM admin_inputs ai
-- WHERE <conditions_for_admin_only_fields>;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check ConditionalTier integrity
SELECT 
    COUNT(*) as total_tiers,
    COUNT(formula_line_id) as with_formula_line,
    COUNT(CASE WHEN formula_line_id IS NULL THEN 1 END) as without_formula_line
FROM conditional_tiers;

-- Check ConditionalRule integrity
SELECT 
    COUNT(*) as total_rules,
    COUNT(formula_line_id) as with_formula_line,
    COUNT(conditional_tier_id) as with_tier
FROM conditional_rules;

-- Check RateTier counts
SELECT 
    rtc.code,
    rtc.lookup_mode,
    COUNT(rt.id) as tier_count
FROM rate_table_configs rtc
LEFT JOIN rate_tiers rt ON rt.rate_table_config_id = rtc.id
GROUP BY rtc.id, rtc.code, rtc.lookup_mode;

-- Check InvoiceAdminField counts
SELECT 
    pg.name as pricing_group,
    COUNT(iaf.id) as admin_field_count
FROM pricing_groups pg
LEFT JOIN invoice_admin_fields iaf ON iaf.pricing_group_id = pg.id
GROUP BY pg.id, pg.name;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Next steps:
-- 1. Test with sample data
-- 2. Update application services to use new structure
-- 3. Deploy and monitor
-- =====================================================================
