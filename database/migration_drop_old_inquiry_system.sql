-- Migration: Drop Old Inquiry System (InquiryHeader-based)
-- Date: 2026-01-05
-- Description: Remove old inquiry_header and detail tables after migrating to ServiceInquiry system

-- Drop detail tables first (foreign key constraints)
DROP TABLE IF EXISTS chartering_inquiries_detail;
DROP TABLE IF EXISTS freight_forwarding_inquiries_detail;
DROP TABLE IF EXISTS shipping_agency_inquiries_detail;
DROP TABLE IF EXISTS special_request_inquiries_detail;
DROP TABLE IF EXISTS logistics_inquiries_detail;

-- Drop main header table
DROP TABLE IF EXISTS inquiry_header;

-- Drop service form fields table
DROP TABLE IF EXISTS service_form_fields;

-- Verify tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
  AND table_name IN (
    'inquiry_header',
    'chartering_inquiries_detail',
    'freight_forwarding_inquiries_detail',
    'shipping_agency_inquiries_detail',
    'special_request_inquiries_detail',
    'logistics_inquiries_detail',
    'service_form_fields'
  );
-- Should return empty result if all tables dropped successfully
