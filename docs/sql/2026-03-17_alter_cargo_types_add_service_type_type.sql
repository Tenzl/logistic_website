-- Upgrade existing cargo_types table to include service_type_type discriminator.
-- Target DB: MySQL 8+

ALTER TABLE cargo_types
  ADD COLUMN service_type_type VARCHAR(100) NOT NULL DEFAULT 'SHIPPING_AGENCY' AFTER display_label;

ALTER TABLE cargo_types
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (service_type_type, code),
  ADD KEY idx_cargo_types_service_type_type (service_type_type);
