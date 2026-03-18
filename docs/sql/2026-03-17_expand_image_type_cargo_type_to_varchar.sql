-- Expand image_types.cargo_type from enum to varchar so many cargo types can be stored.
-- Target DB: MySQL 8+

ALTER TABLE image_types
  MODIFY COLUMN cargo_type VARCHAR(100) NOT NULL;

CREATE INDEX idx_image_types_cargo_type ON image_types (cargo_type);
