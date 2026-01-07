-- Verification Script for Port Migration
-- Run this after migration to verify all ports are correctly mapped

-- 1. Check total counts
SELECT '=== TOTAL COUNTS ===' AS '';
SELECT COUNT(*) AS total_provinces FROM provinces;
SELECT COUNT(*) AS active_provinces FROM provinces WHERE is_active = 1;
SELECT COUNT(*) AS total_ports FROM ports;
SELECT COUNT(*) AS active_ports FROM ports WHERE is_active = 1;

-- 2. List all ports with their provinces
SELECT '=== ALL PORTS BY PROVINCE ===' AS '';
SELECT 
    p.id AS port_id,
    p.name AS port_name,
    pr.id AS province_id,
    pr.name AS province_name,
    pr.is_active AS province_active,
    p.is_active AS port_active
FROM ports p
INNER JOIN provinces pr ON p.province_id = pr.id
ORDER BY pr.name, p.name;

-- 3. Provinces with ports count
SELECT '=== PROVINCES WITH PORTS ===' AS '';
SELECT 
    pr.id,
    pr.name AS province_name,
    COUNT(p.id) AS port_count,
    GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS ports
FROM provinces pr
LEFT JOIN ports p ON pr.id = p.province_id
GROUP BY pr.id, pr.name
HAVING port_count > 0
ORDER BY port_count DESC;

-- 4. Check for missing mappings (ports with invalid province_id)
SELECT '=== INVALID PORT MAPPINGS ===' AS '';
SELECT 
    p.id,
    p.name AS port_name,
    p.province_id,
    'Province not found' AS error
FROM ports p
LEFT JOIN provinces pr ON p.province_id = pr.id
WHERE pr.id IS NULL;

-- 5. Provinces without ports
SELECT '=== PROVINCES WITHOUT PORTS ===' AS '';
SELECT 
    pr.id,
    pr.name AS province_name
FROM provinces pr
LEFT JOIN ports p ON pr.id = p.province_id
WHERE p.id IS NULL
ORDER BY pr.name;

-- 6. Port distribution by region
SELECT '=== PORT DISTRIBUTION ===' AS '';
SELECT 
    CASE 
        WHEN pr.id IN (12, 14, 26, 30, 24, 16, 23, 33, 28, 18, 20, 19, 4, 8) THEN 'Miền Bắc'
        WHEN pr.id IN (31, 22, 13, 15, 6, 27, 25, 17, 11, 7, 21) THEN 'Miền Trung'
        WHEN pr.id IN (9, 32, 29, 1, 10, 3, 5, 34) THEN 'Miền Nam'
        ELSE 'Khác'
    END AS region,
    COUNT(p.id) AS port_count
FROM provinces pr
LEFT JOIN ports p ON pr.id = p.province_id
GROUP BY region
ORDER BY 
    CASE 
        WHEN region = 'Miền Bắc' THEN 1
        WHEN region = 'Miền Trung' THEN 2
        WHEN region = 'Miền Nam' THEN 3
        ELSE 4
    END;

-- 7. Specific port verifications (based on old database)
SELECT '=== SPECIFIC PORT VERIFICATION ===' AS '';
SELECT 
    'Cái Lân (Cai Lan Port)' AS expected_port,
    p.name AS actual_port,
    'Quảng Ninh' AS expected_province,
    pr.name AS actual_province,
    CASE WHEN pr.name = 'Quảng Ninh' THEN '✓' ELSE '✗' END AS status
FROM ports p
INNER JOIN provinces pr ON p.province_id = pr.id
WHERE p.name LIKE '%Cai Lan%'

UNION ALL

SELECT 
    'Nghi Sơn Port' AS expected_port,
    p.name AS actual_port,
    'Thanh Hóa' AS expected_province,
    pr.name AS actual_province,
    CASE WHEN pr.name = 'Thanh Hóa' THEN '✓' ELSE '✗' END AS status
FROM ports p
INNER JOIN provinces pr ON p.province_id = pr.id
WHERE p.name LIKE '%Nghi Sơn%'

UNION ALL

SELECT 
    'Phu My Port' AS expected_port,
    p.name AS actual_port,
    'Đồng Nai' AS expected_province,
    pr.name AS actual_province,
    CASE WHEN pr.name = 'Đồng Nai' THEN '✓ (mapped)' ELSE '✗' END AS status
FROM ports p
INNER JOIN provinces pr ON p.province_id = pr.id
WHERE p.name LIKE '%Phu My%'

UNION ALL

SELECT 
    'SP-ITC' AS expected_port,
    p.name AS actual_port,
    'TP. Hồ Chí Minh' AS expected_province,
    pr.name AS actual_province,
    CASE WHEN pr.name = 'TP. Hồ Chí Minh' THEN '✓' ELSE '✗' END AS status
FROM ports p
INNER JOIN provinces pr ON p.province_id = pr.id
WHERE p.name = 'SP-ITC';

-- 8. Summary
SELECT '=== MIGRATION SUMMARY ===' AS '';
SELECT 
    (SELECT COUNT(*) FROM provinces) AS total_provinces,
    (SELECT COUNT(*) FROM provinces WHERE is_active = 1) AS active_provinces,
    (SELECT COUNT(*) FROM ports) AS total_ports,
    (SELECT COUNT(*) FROM ports WHERE is_active = 1) AS active_ports,
    (SELECT COUNT(DISTINCT province_id) FROM ports) AS provinces_with_ports,
    CONCAT(
        ROUND((SELECT COUNT(DISTINCT province_id) FROM ports) * 100.0 / (SELECT COUNT(*) FROM provinces), 1),
        '%'
    ) AS coverage_percentage;

-- 9. Check is_active status
SELECT '=== ACTIVE STATUS CHECK ===' AS '';
SELECT 
    'Provinces' AS entity_type,
    COUNT(*) AS total,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive
FROM provinces

UNION ALL

SELECT 
    'Ports' AS entity_type,
    COUNT(*) AS total,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive
FROM ports;

-- Expected results:
-- - Total provinces: 34
-- - Active provinces: 34
-- - Total ports: 18
-- - Active ports: 18
-- - Provinces with ports: 13
-- - Coverage: ~38%

