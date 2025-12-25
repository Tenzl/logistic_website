-- Fee Configuration Initialization Script for Shipping Agency Service
-- 13 fee types with formulas based on actual port disbursement calculations

-- Clear existing data (if needed)
-- DELETE FROM fee_configurations WHERE service_type = 'SHIPPING_AGENCY';

-- 1. Tonnage Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Tonnage Fee',
    'TONNAGE_FEE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"baseRateHaiphong": 0.025, "baseRateHochiminh": 0.028, "multiplier": "GRT", "daysMultiplier": true}',
    'GRT × rate × stay days. Haiphong: $0.025/GRT/day, Ho Chi Minh: $0.028/GRT/day',
    1,
    'ACTIVE',
    NULL,
    NULL,
    'Port-specific rates apply',
    NOW()
);

-- 2. Navigation Due
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Navigation Due',
    'NAVIGATION_DUE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"baseRateHaiphong": 0.12, "baseRateHochiminh": 0.15, "multiplier": "GRT"}',
    'GRT × rate. Haiphong: $0.12/GRT, Ho Chi Minh: $0.15/GRT',
    2,
    'ACTIVE',
    NULL,
    NULL,
    'One-time charge per port call',
    NOW()
);

-- 3. Pilotage
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Pilotage',
    'PILOTAGE',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 400, "baseHochiminh": 500, "grtRate": 0.05, "distanceRate": 50, "averageDistance": 15}',
    'Base + (GRT × $0.05) + (Distance × $50). Base: Haiphong $400, HCMC $500',
    3,
    'ACTIVE',
    NULL,
    NULL,
    'Includes pilot boarding and navigation assistance',
    NOW()
);

-- 4. Tug Assistance
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Tug Assistance Charge',
    'TUG_ASSISTANCE',
    'SHIPPING_AGENCY',
    'COMPLEX_FORMULA',
    '{"ratePerTugHaiphong": 350, "ratePerTugHochiminh": 450, "hoursPerOperation": 2.5, "operations": 2, "tugRules": [{"maxLOA": 150, "maxDWT": 20000, "tugs": 2}, {"maxLOA": 200, "maxDWT": 50000, "tugs": 3}, {"maxLOA": 999, "maxDWT": 999999, "tugs": 4}]}',
    'Number of tugs × rate × 2.5 hours × 2 operations. Tugs based on LOA/DWT',
    4,
    'ACTIVE',
    NULL,
    '{"tugsBySize": "LOA<150m & DWT<20k: 2 tugs, LOA<200m & DWT<50k: 3 tugs, else: 4 tugs"}',
    'Includes arrival and departure tug assistance',
    NOW()
);

-- 5. Moor/Unmoor
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Moor/Unmooring Charge',
    'MOOR_UNMOOR',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 150, "baseHochiminh": 200, "loaRate": 1.5, "operations": 2}',
    '(Base + LOA × $1.5) × 2 operations. Base: Haiphong $150, HCMC $200',
    5,
    'ACTIVE',
    NULL,
    NULL,
    'Mooring and unmooring services',
    NOW()
);

-- 6. Berth Due
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Berth Due',
    'BERTH_DUE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"rateHaiphong": 0.018, "rateHochiminh": 0.022, "multiplier": "DWT", "hoursMultiplier": true}',
    'DWT × rate × hours. Haiphong: $0.018/DWT/hr, HCMC: $0.022/DWT/hr',
    6,
    'ACTIVE',
    NULL,
    NULL,
    'Berth occupation charges',
    NOW()
);

-- 7. Anchorage Fees
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Anchorage Fees',
    'ANCHORAGE_FEES',
    'SHIPPING_AGENCY',
    'CONDITIONAL',
    '{"rateHaiphong": 0.008, "rateHochiminh": 0.01, "multiplier": "DWT", "condition": "waitingDays > 0"}',
    'DWT × rate × waiting days (if applicable). Default: $0 if no waiting',
    7,
    'ACTIVE',
    NULL,
    '{"applicableIf": "vessel waits at anchorage before berthing"}',
    'Optional charge - only if vessel waits',
    NOW()
);

-- 8. Quarantine Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Quarantine Fee',
    'QUARANTINE_FEE',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 100, "baseHochiminh": 120, "crewRate": 5, "defaultCrew": 25}',
    'Base + (crew × $5). Base: Haiphong $100, HCMC $120. Default 25 crew',
    8,
    'ACTIVE',
    NULL,
    NULL,
    'Health inspection and quarantine clearance',
    NOW()
);

-- 9. Ocean Freight Tax
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Ocean Freight Tax (5%)',
    'OCEAN_FREIGHT_TAX',
    'SHIPPING_AGENCY',
    'PERCENTAGE',
    '{"percentage": 5, "appliedTo": ["TONNAGE_FEE", "NAVIGATION_DUE", "BERTH_DUE"]}',
    '5% of (Tonnage Fee + Navigation Due + Berth Due)',
    9,
    'ACTIVE',
    NULL,
    NULL,
    'Government tax on freight-related charges',
    NOW()
);

-- 10. Transport Quarantine
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Transport Quarantine',
    'TRANSPORT_QUARANTINE',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 150, "fixedAmountHochiminh": 200}',
    'Fixed fee. Haiphong: $150, Ho Chi Minh: $200',
    10,
    'ACTIVE',
    NULL,
    NULL,
    'Transportation for quarantine officials',
    NOW()
);

-- 11. Berthing B.4 Application
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Berthing B.4 Application',
    'BERTHING_B4',
    'SHIPPING_AGENCY',
    'CONDITIONAL',
    '{"fixedBase": 300, "dwtThreshold": 30000, "excessRate": 0.01, "condition": "DWT > threshold"}',
    'If DWT > 30,000: $300 + (excess DWT × $0.01), else $0',
    11,
    'ACTIVE',
    NULL,
    '{"applicableIf": "DWT > 30,000"}',
    'Special berth application for larger vessels',
    NOW()
);

-- 12. Clearance Fees
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Clearance Fees',
    'CLEARANCE_FEES',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 530, "fixedAmountHochiminh": 650, "breakdown": {"customs": 200, "immigration": 150, "portAuthority": 180, "certificates": 120}}',
    'Fixed fee. Haiphong: $530, Ho Chi Minh: $650',
    12,
    'ACTIVE',
    NULL,
    NULL,
    'Customs, immigration, port clearance, certificates',
    NOW()
);

-- 13. Garbage Removal Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, 
    formula_description, display_order, status, applicable_port, conditions, notes, created_at
) VALUES (
    'Garbage Removal Fee',
    'GARBAGE_REMOVAL',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 80, "baseHochiminh": 100, "dailyRate": 20}',
    'Base + (stay days × $20). Base: Haiphong $80, HCMC $100',
    13,
    'ACTIVE',
    NULL,
    NULL,
    'Ship waste collection and disposal',
    NOW()
);

-- Verification query
SELECT 
    id,
    display_order,
    fee_name,
    fee_code,
    formula_type,
    status
FROM fee_configurations
WHERE service_type = 'SHIPPING_AGENCY'
ORDER BY display_order;
