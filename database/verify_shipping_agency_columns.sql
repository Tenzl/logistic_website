-- Verify shipping_agency_inquiries table structure
DESCRIBE shipping_agency_inquiries;

-- Check if columns exist
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'seatrans_db' 
  AND TABLE_NAME = 'shipping_agency_inquiries'
  AND COLUMN_NAME IN ('shipowner_to', 'mv', 'to_name');

-- Check recent data
SELECT 
    id,
    shipowner_to,
    mv,
    eta,
    dwt,
    grt,
    loa,
    cargo_type,
    cargo_name,
    full_name,
    submitted_at
FROM shipping_agency_inquiries
ORDER BY id DESC
LIMIT 5;
