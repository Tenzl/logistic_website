-- Create service_form_fields table
CREATE TABLE IF NOT EXISTS service_form_fields (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_type_id BIGINT NOT NULL,
  field_key VARCHAR(64) NOT NULL,
  label VARCHAR(255) NOT NULL,
  type ENUM('text','email','tel','textarea','select','number','date') NOT NULL,
  required BOOLEAN NOT NULL DEFAULT FALSE,
  placeholder VARCHAR(255) NULL,
  grid_span INT NOT NULL DEFAULT 12,
  options JSON NULL,
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  meta JSON NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT fk_sff_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(id),
  CONSTRAINT uq_sff_service_key UNIQUE (service_type_id, field_key)
);

-- Add details column to service_inquiries if missing
ALTER TABLE service_inquiries
  ADD COLUMN IF NOT EXISTS details TEXT;
