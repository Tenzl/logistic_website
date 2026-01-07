-- Seed data for Contact Page
-- This file adds Special Request service type, offices with contact info and coordinates, 
-- and ensures provinces with ports are properly configured

-- ============================================
-- 1. Create Offices table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS offices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    province_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    manager_name VARCHAR(255),
    manager_title VARCHAR(255),
    manager_mobile VARCHAR(50),
    manager_email VARCHAR(255),
    is_headquarter BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_province (province_id),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Add Special Request Service Type
-- ============================================
INSERT INTO service_types (id, name, display_name, description, is_active, created_at, updated_at)
VALUES
    (5, 'special-request', 'Special Request', 'Custom inquiries and special requirements from contact page', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    display_name = VALUES(display_name),
    description = VALUES(description),
    is_active = VALUES(is_active),
    updated_at = NOW();

-- ============================================
-- 3. Insert Office Information with Coordinates
-- ============================================
-- Ho Chi Minh City Head Office
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    29, -- Ho Chi Minh City
    'SEATRANS Head Office',
    '26 Nguyen Hue Street, Ben Nghe Ward, District 1, Ho Chi Minh City, Vietnam',
    10.776990, 106.700920,
    'Minh Khang (Mr)',
    'Office Supervisor',
    '+84 90-111-2233',
    'hcm.office@seatrans.com.vn',
    TRUE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- Hai Phong Branch
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    47, -- Hai Phong
    'SEATRANS Hai Phong Branch',
    '12 Lach Tray Street, Ngo Quyen District, Hai Phong, Vietnam',
    20.844900, 106.688100,
    'Quang Huy (Mr)',
    'Branch Manager',
    '+84 90-222-3344',
    'haiphong.branch@seatrans.com.vn',
    FALSE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- Da Nang Branch
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    43, -- Da Nang
    'SEATRANS Da Nang Branch',
    '88 Bach Dang Street, Hai Chau District, Da Nang, Vietnam',
    16.054400, 108.202200,
    'Thao Nguyen (Ms)',
    'Branch Manager',
    '+84 90-333-4455',
    'danang.branch@seatrans.com.vn',
    FALSE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- Can Tho Branch
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    63, -- Can Tho
    'SEATRANS Can Tho Branch',
    '45 Hoa Binh Avenue, Ninh Kieu District, Can Tho, Vietnam',
    10.045200, 105.746900,
    'Thanh Dat (Mr)',
    'Branch Manager',
    '+84 90-444-5566',
    'cantho.branch@seatrans.com.vn',
    FALSE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- Ba Ria - Vung Tau Branch
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    28, -- Ba Ria - Vung Tau (correct province ID)
    'SEATRANS Vung Tau Branch',
    '23 Thuy Van Street, Thang Tam Ward, Vung Tau City, Ba Ria - Vung Tau, Vietnam',
    10.346100, 107.084200,
    'Hoang Long (Mr)',
    'Branch Manager',
    '+84 90-555-6677',
    'vungtau.branch@seatrans.com.vn',
    FALSE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- Quang Ninh Branch
INSERT INTO offices (
    province_id, name, address, latitude, longitude,
    manager_name, manager_title, manager_mobile, manager_email,
    is_headquarter, is_active
) VALUES (
    25, -- Quang Ninh
    'SEATRANS Quang Ninh Branch',
    '15 Ha Long Street, Hong Gai Ward, Ha Long City, Quang Ninh, Vietnam',
    20.957800, 107.084700,
    'Van Hai (Mr)',
    'Branch Manager',
    '+84 90-666-7788',
    'quangninh.branch@seatrans.com.vn',
    FALSE,
    TRUE
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    address = VALUES(address),
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    manager_name = VALUES(manager_name),
    updated_at = NOW();

-- ============================================
-- 6. Sample Special Request inquiry data (optional - for testing)
-- ============================================
-- First, ensure there's a test service_type entry for special-request if needed
-- This assumes service_types table exists with the special-request entry from step 1

-- Note: Actual inquiries will be created by users through the contact form
-- This is just sample data for development/testing

-- Sample inquiry (if you want test data)
/*
INSERT INTO service_inquiries (
    service_type_id, 
    full_name, 
    contact_info, 
    phone, 
    company, 
    status, 
    notes,
    submitted_at,
    updated_at
) VALUES (
    5, -- special-request service type
    'Test User',
    'test@example.com',
    '+84 90 123 4567',
    'Test Company Ltd',
    'PROCESSING',
    'This is a test special request inquiry',
    NOW(),
    NOW()
);

-- Get the last inserted inquiry ID and create special request detail
SET @inquiry_id = LAST_INSERT_ID();

INSERT INTO special_request_inquiries (
    inquiry_id,
    subject,
    preferred_office_id,
    preferred_office_name,
    related_department_id,
    related_department_name,
    message,
    other_info
) VALUES (
    @inquiry_id,
    'Request for quote on warehouse services',
    29, -- Ho Chi Minh City
    'Ho Chi Minh City',
    4, -- Total Logistics
    'Total Logistics',
    'We need warehousing services for 500 pallets of electronics for 3 months. Please provide a quotation.',
    NULL
);
*/

-- ============================================
-- 7. Verification Queries (comment out in production)
-- ============================================
-- Check offices with coordinates
-- SELECT 
--     o.id, 
--     o.name, 
--     p.name as province_name,
--     o.address,
--     o.latitude,
--     o.longitude,
--     o.manager_name,
--     o.manager_mobile,
--     o.is_headquarter
-- FROM offices o
-- INNER JOIN provinces p ON o.province_id = p.id
-- WHERE o.is_active = TRUE
-- ORDER BY o.is_headquarter DESC, o.name;

-- ============================================
-- Original Verification Queries
-- ============================================
-- Check provinces with ports
-- SELECT p.id, p.name, COUNT(pt.id) as port_count
-- FROM provinces p
-- LEFT JOIN ports pt ON p.id = pt.province_id
-- WHERE p.is_active = TRUE
-- GROUP BY p.id, p.name
-- HAVING port_count > 0
-- ORDER BY p.name;

-- Check service types including special-request
-- SELECT * FROM service_types WHERE is_active = TRUE ORDER BY id;

-- Check special request inquiries
-- SELECT 
--     si.id,
--     si.full_name,
--     si.company,
--     sri.subject,
--     sri.preferred_office_name,
--     sri.related_department_name,
--     si.status,
--     si.submitted_at
-- FROM service_inquiries si
-- INNER JOIN special_request_inquiries sri ON si.id = sri.inquiry_id
-- ORDER BY si.submitted_at DESC;
