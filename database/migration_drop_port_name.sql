-- Drop redundant port_id and port_name columns from shipping_agency_inquiries
-- Only keep port_of_call which contains the resolved port name

ALTER TABLE shipping_agency_inquiries 
DROP COLUMN port_id,
DROP COLUMN port_name;
