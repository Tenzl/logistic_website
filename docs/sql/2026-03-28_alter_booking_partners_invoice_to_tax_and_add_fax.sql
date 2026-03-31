-- Normalize booking partners schema:
-- - rename invoice_tax_number -> tax_number
-- - add fax column
-- - drop legacy invoice_company_* columns

-- Add fax column if missing
SET @has_fax := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'fax'
);
SET @sql_add_fax := IF(
  @has_fax = 0,
  'ALTER TABLE booking_partners ADD COLUMN fax VARCHAR(64) NULL AFTER phone',
  'SELECT 1'
);
PREPARE stmt_add_fax FROM @sql_add_fax;
EXECUTE stmt_add_fax;
DEALLOCATE PREPARE stmt_add_fax;

-- Rename invoice_tax_number -> tax_number when old exists and new does not
SET @has_invoice_tax := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_tax_number'
);
SET @has_tax := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'tax_number'
);
SET @sql_rename_tax := IF(
  @has_invoice_tax = 1 AND @has_tax = 0,
  'ALTER TABLE booking_partners CHANGE COLUMN invoice_tax_number tax_number VARCHAR(128) NULL',
  'SELECT 1'
);
PREPARE stmt_rename_tax FROM @sql_rename_tax;
EXECUTE stmt_rename_tax;
DEALLOCATE PREPARE stmt_rename_tax;

-- Ensure tax_number exists (for safety when both old/new are absent)
SET @has_tax_after := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'tax_number'
);
SET @sql_add_tax := IF(
  @has_tax_after = 0,
  'ALTER TABLE booking_partners ADD COLUMN tax_number VARCHAR(128) NULL AFTER customer_type',
  'SELECT 1'
);
PREPARE stmt_add_tax FROM @sql_add_tax;
EXECUTE stmt_add_tax;
DEALLOCATE PREPARE stmt_add_tax;

-- Drop legacy invoice company columns if present
SET @drop_icn := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_company_name'
);
SET @sql_drop_icn := IF(
  @drop_icn = 1,
  'ALTER TABLE booking_partners DROP COLUMN invoice_company_name',
  'SELECT 1'
);
PREPARE stmt_drop_icn FROM @sql_drop_icn;
EXECUTE stmt_drop_icn;
DEALLOCATE PREPARE stmt_drop_icn;

SET @drop_ica := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_company_address'
);
SET @sql_drop_ica := IF(
  @drop_ica = 1,
  'ALTER TABLE booking_partners DROP COLUMN invoice_company_address',
  'SELECT 1'
);
PREPARE stmt_drop_ica FROM @sql_drop_ica;
EXECUTE stmt_drop_ica;
DEALLOCATE PREPARE stmt_drop_ica;

SET @drop_icp := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_company_phone'
);
SET @sql_drop_icp := IF(
  @drop_icp = 1,
  'ALTER TABLE booking_partners DROP COLUMN invoice_company_phone',
  'SELECT 1'
);
PREPARE stmt_drop_icp FROM @sql_drop_icp;
EXECUTE stmt_drop_icp;
DEALLOCATE PREPARE stmt_drop_icp;

SET @drop_icf := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_company_fax'
);
SET @sql_drop_icf := IF(
  @drop_icf = 1,
  'ALTER TABLE booking_partners DROP COLUMN invoice_company_fax',
  'SELECT 1'
);
PREPARE stmt_drop_icf FROM @sql_drop_icf;
EXECUTE stmt_drop_icf;
DEALLOCATE PREPARE stmt_drop_icf;

SET @drop_ice := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'booking_partners'
    AND COLUMN_NAME = 'invoice_company_email'
);
SET @sql_drop_ice := IF(
  @drop_ice = 1,
  'ALTER TABLE booking_partners DROP COLUMN invoice_company_email',
  'SELECT 1'
);
PREPARE stmt_drop_ice FROM @sql_drop_ice;
EXECUTE stmt_drop_ice;
DEALLOCATE PREPARE stmt_drop_ice;
