-- Seed cargo types by service_type_type for immediate UI usage.
-- Run this after cargo_types table exists.
-- Target DB: MySQL 8+

INSERT INTO cargo_types (code, display_label, service_type_type)
VALUES
  -- SHIPPING_AGENCY
  ('IN_BULK', 'in bulk', 'SHIPPING_AGENCY'),
  ('IN_BAG_PACK', 'in bag/pack', 'SHIPPING_AGENCY'),
  ('BREAK_BULK', 'break bulk', 'SHIPPING_AGENCY'),
  ('PROJECT_CARGO', 'project cargo', 'SHIPPING_AGENCY'),

  -- FREIGHT_FORWARDING
  ('FCL', 'FCL (full container load)', 'FREIGHT_FORWARDING'),
  ('LCL', 'LCL (less than container load)', 'FREIGHT_FORWARDING'),
  ('AIR_FREIGHT', 'air freight', 'FREIGHT_FORWARDING'),
  ('EXPRESS', 'express', 'FREIGHT_FORWARDING'),

  -- CHARTERING_SHIP_BROKING
  ('DRY_BULK', 'dry bulk', 'CHARTERING_SHIP_BROKING'),
  ('LIQUID_BULK', 'liquid bulk', 'CHARTERING_SHIP_BROKING'),
  ('GENERAL_CARGO', 'general cargo', 'CHARTERING_SHIP_BROKING'),
  ('HEAVY_LIFT', 'heavy lift', 'CHARTERING_SHIP_BROKING'),

  -- TOTAL_LOGISTICS
  ('WAREHOUSING', 'warehousing', 'TOTAL_LOGISTICS'),
  ('DISTRIBUTION', 'distribution', 'TOTAL_LOGISTICS'),
  ('CROSS_BORDER', 'cross border', 'TOTAL_LOGISTICS'),
  ('E_COMMERCE_FULFILLMENT', 'e-commerce fulfillment', 'TOTAL_LOGISTICS'),

  -- SPECIAL_REQUEST
  ('CUSTOM', 'custom request', 'SPECIAL_REQUEST'),
  ('URGENT', 'urgent handling', 'SPECIAL_REQUEST'),
  ('TEMPERATURE_CONTROLLED', 'temperature controlled', 'SPECIAL_REQUEST'),
  ('HAZARDOUS', 'hazardous', 'SPECIAL_REQUEST')
ON DUPLICATE KEY UPDATE
  display_label = VALUES(display_label),
  is_active = 1;
