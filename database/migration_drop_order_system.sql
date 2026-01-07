-- Migration: Drop Order & ServiceRequest System
-- Date: 2026-01-05
-- Description: Remove order management and service request tables as they are not being used

-- Drop order_items table first (foreign key dependency)
DROP TABLE IF EXISTS order_items;

-- Drop orders table
DROP TABLE IF EXISTS orders;

-- Drop service_requests table
DROP TABLE IF EXISTS service_requests;

-- Verify tables are dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
  AND table_name IN ('orders', 'order_items', 'service_requests');
-- Should return empty result if all tables dropped successfully
