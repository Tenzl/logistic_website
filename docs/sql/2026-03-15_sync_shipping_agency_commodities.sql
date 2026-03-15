-- Sync Shipping Agency commodity/image types to the new naming and cargo type set.
-- Target DB: MySQL 8+
--
-- This script is idempotent:
-- 1) Renames legacy names to new names (where mapped)
-- 2) Upserts the target list
-- 3) Marks old non-target names as inactive (no hard delete)

START TRANSACTION;

-- Resolve Shipping Agency service_type_id (adjust this query if your name/display_name differs).
SET @service_type_id = (
  SELECT id
  FROM service_types
  WHERE UPPER(name) IN ('SHIPPING_AGENCY', 'SHIPPING AGENCY')
     OR UPPER(display_name) = 'SHIPPING AGENCY'
  ORDER BY id
  LIMIT 1
);

SELECT @service_type_id AS shipping_agency_service_type_id;

CREATE TEMPORARY TABLE tmp_target_commodities (
  name VARCHAR(100) PRIMARY KEY,
  display_name VARCHAR(200) NOT NULL,
  required_image_count INT NOT NULL,
  cargo_type ENUM('IN_BULK', 'IN_BAG_PACK') NOT NULL
);

INSERT INTO tmp_target_commodities (name, display_name, required_image_count, cargo_type) VALUES
  -- 1) CARGO IN BULK
  ('FERTILIZER_IN_BULK', 'Fertilizer in bulk', 18, 'IN_BULK'),
  ('WOOD_PELLETS', 'Wood Pellets', 18, 'IN_BULK'),
  ('WOOD_CHIPS', 'Wood Chips', 18, 'IN_BULK'),
  ('TAPIOCA_CHIPS', 'Tapioca chips', 18, 'IN_BULK'),
  ('ILMENITE_IN_BULK', 'Ilmenite in bulk', 18, 'IN_BULK'),
  ('CORN_IN_BULK', 'Corn in bulk', 18, 'IN_BULK'),
  ('ADCBF', 'ADCBF', 18, 'IN_BULK'),

  -- 2) CARGO IN BAGS / PACKAGES
  ('FERTILIZER_IN_BAGS', 'Fertilizer in bags', 18, 'IN_BAG_PACK'),
  ('RICE_IN_BAGS', 'Rice in bags', 18, 'IN_BAG_PACK'),
  ('TAPIOCA_IN_BAGS', 'Tapioca in bags', 18, 'IN_BAG_PACK'),
  ('STEEL_PRODUCTS', 'Steel Products', 18, 'IN_BAG_PACK'),
  ('EQUIPMENT', 'Equipment', 18, 'IN_BAG_PACK');

CREATE TEMPORARY TABLE tmp_legacy_name_map (
  old_name VARCHAR(100) PRIMARY KEY,
  new_name VARCHAR(100) NOT NULL
);

INSERT INTO tmp_legacy_name_map (old_name, new_name) VALUES
  ('FERTILIZER', 'FERTILIZER_IN_BAGS'),
  ('RICE', 'RICE_IN_BAGS'),
  ('TAPIOCA', 'TAPIOCA_IN_BAGS'),
  ('CORN_IN_BULK', 'CORN_IN_BULK'),
  ('WOOD_CHIPS', 'WOOD_CHIPS'),
  ('WOOD_PELLETS', 'WOOD_PELLETS'),
  ('STEEL_PRODUCTS', 'STEEL_PRODUCTS');

-- Step 1: Rename known legacy records and update their attributes.
UPDATE image_types it
JOIN tmp_legacy_name_map m ON m.old_name = it.name
JOIN tmp_target_commodities t ON t.name = m.new_name
SET it.name = t.name,
    it.display_name = t.display_name,
    it.required_image_count = t.required_image_count,
    it.cargo_type = t.cargo_type,
    it.is_active = TRUE,
    it.updated_at = NOW()
WHERE @service_type_id IS NOT NULL
  AND it.service_type_id = @service_type_id;

-- Step 2: Normalize already-correct target names.
UPDATE image_types it
JOIN tmp_target_commodities t ON t.name = it.name
SET it.display_name = t.display_name,
    it.required_image_count = t.required_image_count,
    it.cargo_type = t.cargo_type,
    it.is_active = TRUE,
    it.updated_at = NOW()
WHERE @service_type_id IS NOT NULL
  AND it.service_type_id = @service_type_id;

-- Step 3: Insert missing target records.
INSERT INTO image_types (
  service_type_id,
  name,
  display_name,
  description,
  required_image_count,
  cargo_type,
  is_active,
  created_at,
  updated_at
)
SELECT
  @service_type_id,
  t.name,
  t.display_name,
  NULL,
  t.required_image_count,
  t.cargo_type,
  TRUE,
  NOW(),
  NOW()
FROM tmp_target_commodities t
WHERE @service_type_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM image_types it
    WHERE it.service_type_id = @service_type_id
      AND it.name = t.name
  );

-- Step 4: Inactivate non-target names (safe, no hard delete).
UPDATE image_types it
SET it.is_active = FALSE,
    it.updated_at = NOW()
WHERE @service_type_id IS NOT NULL
  AND it.service_type_id = @service_type_id
  AND it.name NOT IN (SELECT name FROM tmp_target_commodities);

DROP TEMPORARY TABLE IF EXISTS tmp_legacy_name_map;
DROP TEMPORARY TABLE IF EXISTS tmp_target_commodities;

COMMIT;

-- Verification query:
-- SELECT name, display_name, required_image_count, cargo_type, is_active
-- FROM image_types
-- WHERE service_type_id = @service_type_id
-- ORDER BY name;
