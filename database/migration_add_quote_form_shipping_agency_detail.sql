-- Add quote_form column for admin-selected template
ALTER TABLE shipping_agency_inquiries_detail
ADD COLUMN IF NOT EXISTS quote_form VARCHAR(32);

COMMENT ON COLUMN shipping_agency_inquiries_detail.quote_form IS 'Selected quote template (e.g., HCM/QN)';
