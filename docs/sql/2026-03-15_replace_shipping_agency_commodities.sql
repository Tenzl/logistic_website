-- HARD REPLACE commodity catalog for Shipping Agency.
-- Target DB: MySQL 8+
--
-- WARNING:
-- This script deletes all existing image_types rows of Shipping Agency then inserts the new catalog.
-- If gallery_images references existing image_type_id rows, DELETE may fail due to FK constraints.

START TRANSACTION;

SET @service_type_id = (
  SELECT id
  FROM service_types
  WHERE UPPER(name) IN ('SHIPPING_AGENCY', 'SHIPPING AGENCY')
     OR UPPER(display_name) = 'SHIPPING AGENCY'
  ORDER BY id
  LIMIT 1
);

SELECT @service_type_id AS shipping_agency_service_type_id;

-- Optional pre-check: linked images count for current commodity rows.
SELECT COUNT(*) AS linked_gallery_images
FROM gallery_images gi
JOIN image_types it ON it.id = gi.image_type_id
WHERE it.service_type_id = @service_type_id;

-- Hard delete all existing commodity rows for Shipping Agency.
DELETE FROM image_types
WHERE service_type_id = @service_type_id;

-- Insert new commodity catalog.
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
) VALUES
  -- 1) CARGO IN BULK
  (@service_type_id, 'FERTILIZER_IN_BULK', 'Fertilizer in bulk', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'WOOD_PELLETS', 'Wood Pellets', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'WOOD_CHIPS', 'Wood Chips', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'TAPIOCA_CHIPS', 'Tapioca chips', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'ILMENITE_IN_BULK', 'Ilmenite in bulk', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'CORN_IN_BULK', 'Corn in bulk', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),
  (@service_type_id, 'ADCBF', 'ADCBF', NULL, 18, 'IN_BULK', TRUE, NOW(), NOW()),

  -- 2) CARGO IN BAGS / PACKAGES
  (@service_type_id, 'FERTILIZER_IN_BAGS', 'Fertilizer in bags', NULL, 18, 'IN_BAG_PACK', TRUE, NOW(), NOW()),
  (@service_type_id, 'RICE_IN_BAGS', 'Rice in bags', NULL, 18, 'IN_BAG_PACK', TRUE, NOW(), NOW()),
  (@service_type_id, 'TAPIOCA_IN_BAGS', 'Tapioca in bags', NULL, 18, 'IN_BAG_PACK', TRUE, NOW(), NOW()),
  (@service_type_id, 'STEEL_PRODUCTS', 'Steel Products', NULL, 18, 'IN_BAG_PACK', TRUE, NOW(), NOW()),
  (@service_type_id, 'EQUIPMENT', 'Equipment', NULL, 18, 'IN_BAG_PACK', TRUE, NOW(), NOW());

COMMIT;

-- Verification query:
-- SELECT name, display_name, required_image_count, cargo_type, is_active
-- FROM image_types
-- WHERE service_type_id = @service_type_id
-- ORDER BY cargo_type, name;
