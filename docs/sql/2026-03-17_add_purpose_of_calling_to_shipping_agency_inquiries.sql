-- Add purpose_of_calling field for shipping agency inquiry workflow.
-- Target DB: MySQL 8+

ALTER TABLE shipping_agency_inquiries
  ADD COLUMN purpose_of_calling VARCHAR(64) NULL AFTER frt_tax_type;

CREATE INDEX idx_shipping_agency_inquiries_purpose_of_calling
  ON shipping_agency_inquiries (purpose_of_calling);
