-- ============================================================================
-- Sample Fee Configurations for SeaTrans Logistics
-- Created: December 5, 2025
-- Purpose: Insert sample fee configurations for testing admin panel
-- ============================================================================

-- Clear existing data (optional - comment out if you want to keep existing fees)
-- TRUNCATE TABLE fee_configurations;

-- ============================================================================
-- SHIPPING AGENCY SERVICE FEES
-- ============================================================================

-- 1. Tonnage Fee (Simple Multiplication)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Tonnage Fee',
    'TONNAGE_FEE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"multiplier": "GRT", "baseRateHaiphong": 0.025, "baseRateHochiminh": 0.028, "daysMultiplier": true}',
    'GRT × rate × stay days. Haiphong: $0.025/GRT/day, HCMC: $0.028/GRT/day',
    1,
    'ACTIVE',
    NULL,
    NULL,
    'Primary vessel tonnage charge based on gross registered tonnage',
    NOW(),
    NULL
);

-- 2. Navigation Due (Simple Multiplication)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Navigation Due',
    'NAVIGATION_DUE',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"multiplier": "GRT", "baseRateHaiphong": 0.015, "baseRateHochiminh": 0.018, "daysMultiplier": false}',
    'GRT × rate. Haiphong: $0.015/GRT, HCMC: $0.018/GRT',
    2,
    'ACTIVE',
    NULL,
    NULL,
    'Navigation aid maintenance fee',
    NOW(),
    NULL
);

-- 3. Pilotage (Base Plus Variable)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Pilotage',
    'PILOTAGE',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 500, "baseHochiminh": 600, "variableRate": 0.05, "multiplier": "GRT", "distanceFactor": 1.2}',
    'Base fee + (GRT × rate × distance). Haiphong: $500 base, HCMC: $600 base',
    3,
    'ACTIVE',
    NULL,
    '{"minGRT": 1000}',
    'Pilot service for vessel navigation',
    NOW(),
    NULL
);

-- 4. Tug Assistance (Complex Formula)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Tug Assistance',
    'TUG_ASSISTANCE',
    'SHIPPING_AGENCY',
    'COMPLEX_FORMULA',
    '{"formula": "tugs * hourlyRate * hours * surchargeMultiplier", "hourlyRate": 150, "surchargeMultiplier": 2}',
    'Number of tugs × hourly rate × hours × 2. Rate: $150/tug/hour',
    4,
    'ACTIVE',
    NULL,
    '{"minTugs": 1, "maxTugs": 4}',
    'Tugboat assistance for berthing/unberthing',
    NOW(),
    NULL
);

-- 5. Port Dues (Tiered Pricing)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Port Dues',
    'PORT_DUES',
    'SHIPPING_AGENCY',
    'TIERED_PRICING',
    '{"tiers": [{"min": 0, "max": 10000, "rate": 0.03}, {"min": 10000, "max": 50000, "rate": 0.02}, {"min": 50000, "max": 999999, "rate": 0.015}], "multiplier": "GRT"}',
    'Tiered pricing based on GRT: 0-10k: $0.03, 10k-50k: $0.02, 50k+: $0.015',
    5,
    'ACTIVE',
    NULL,
    NULL,
    'Port authority dues',
    NOW(),
    NULL
);

-- 6. Berth Occupancy Fee (Simple Multiplication)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Berth Occupancy Fee',
    'BERTH_OCCUPANCY',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"multiplier": "GRT", "baseRateHaiphong": 0.01, "baseRateHochiminh": 0.012, "daysMultiplier": true}',
    'GRT × rate × stay days. Haiphong: $0.01/GRT/day, HCMC: $0.012/GRT/day',
    6,
    'ACTIVE',
    NULL,
    NULL,
    'Charge for berth space utilization',
    NOW(),
    NULL
);

-- 7. Security Fee (Fixed Amount)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Security Fee',
    'SECURITY_FEE',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 300, "fixedAmountHochiminh": 350}',
    'Fixed amount per vessel. Haiphong: $300, HCMC: $350',
    7,
    'ACTIVE',
    NULL,
    NULL,
    'ISPS security compliance fee',
    NOW(),
    NULL
);

-- 8. Quarantine Inspection (Conditional)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Quarantine Inspection',
    'QUARANTINE',
    'SHIPPING_AGENCY',
    'CONDITIONAL',
    '{"conditions": [{"if": "GRT < 10000", "rate": 200}, {"if": "GRT >= 10000 && GRT < 50000", "rate": 400}, {"if": "GRT >= 50000", "rate": 600}], "multiplier": "fixed"}',
    'Conditional fee based on vessel size: <10k GRT: $200, 10k-50k: $400, 50k+: $600',
    8,
    'ACTIVE',
    NULL,
    '{"requiresInspection": true}',
    'Health and quarantine inspection',
    NOW(),
    NULL
);

-- 9. Customs Clearance (Base Plus Variable)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Customs Clearance',
    'CUSTOMS_CLEARANCE',
    'SHIPPING_AGENCY',
    'BASE_PLUS_VARIABLE',
    '{"baseHaiphong": 400, "baseHochiminh": 450, "variableRate": 0.002, "multiplier": "DWT"}',
    'Base fee + (DWT × rate). Haiphong: $400 base, HCMC: $450 base',
    9,
    'ACTIVE',
    NULL,
    NULL,
    'Customs documentation and clearance',
    NOW(),
    NULL
);

-- 10. Agency Fee (Percentage)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Agency Fee',
    'AGENCY_FEE',
    'SHIPPING_AGENCY',
    'PERCENTAGE',
    '{"percentage": 5, "baseCalculation": "sum_of_previous_fees"}',
    '5% of total previous fees',
    10,
    'ACTIVE',
    NULL,
    NULL,
    'Agency service commission',
    NOW(),
    NULL
);

-- 11. Documentation Fee (Fixed Amount)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Documentation Fee',
    'DOCUMENTATION',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 150, "fixedAmountHochiminh": 180}',
    'Fixed documentation processing fee. Haiphong: $150, HCMC: $180',
    11,
    'ACTIVE',
    NULL,
    NULL,
    'Document preparation and processing',
    NOW(),
    NULL
);

-- 12. Clearance Fees (Fixed Amount)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Clearance Fees',
    'CLEARANCE_FEES',
    'SHIPPING_AGENCY',
    'FIXED',
    '{"fixedAmountHaiphong": 250, "fixedAmountHochiminh": 300}',
    'Port clearance documentation. Haiphong: $250, HCMC: $300',
    12,
    'ACTIVE',
    NULL,
    NULL,
    'Immigration and port clearance',
    NOW(),
    NULL
);

-- 13. Garbage Removal (Conditional)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Garbage Removal',
    'GARBAGE_REMOVAL',
    'SHIPPING_AGENCY',
    'CONDITIONAL',
    '{"conditions": [{"if": "volume < 10", "rate": 100}, {"if": "volume >= 10 && volume < 50", "rate": 300}, {"if": "volume >= 50", "rate": 500}], "multiplier": "fixed"}',
    'Based on waste volume: <10m³: $100, 10-50m³: $300, 50m³+: $500',
    13,
    'ACTIVE',
    NULL,
    '{"environmentalCompliance": true}',
    'Waste collection and disposal',
    NOW(),
    NULL
);

-- ============================================================================
-- PORT-SPECIFIC FEES (Example: Haiphong only)
-- ============================================================================

-- 14. Haiphong Port Surcharge
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Haiphong Port Surcharge',
    'HAIPHONG_SURCHARGE',
    'SHIPPING_AGENCY',
    'PERCENTAGE',
    '{"percentage": 3, "baseCalculation": "sum_of_previous_fees"}',
    '3% surcharge on all fees (Haiphong port only)',
    14,
    'ACTIVE',
    'HAIPHONG',
    NULL,
    'Haiphong-specific infrastructure surcharge',
    NOW(),
    NULL
);

-- ============================================================================
-- CHARTERING SERVICE FEES (Examples)
-- ============================================================================

-- 15. Charter Brokerage Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Charter Brokerage Fee',
    'CHARTER_BROKERAGE',
    'CHARTERING',
    'PERCENTAGE',
    '{"percentage": 1.25, "baseCalculation": "charter_hire"}',
    '1.25% of charter hire amount',
    1,
    'ACTIVE',
    NULL,
    '{"minAmount": 1000}',
    'Brokerage commission for charter arrangements',
    NOW(),
    NULL
);

-- 16. Time Charter Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Time Charter Fee',
    'TIME_CHARTER',
    'CHARTERING',
    'SIMPLE_MULTIPLICATION',
    '{"multiplier": "days", "baseRateHaiphong": 5000, "baseRateHochiminh": 5500, "daysMultiplier": true}',
    'Daily charter rate × days. Haiphong: $5,000/day, HCMC: $5,500/day',
    2,
    'ACTIVE',
    NULL,
    '{"minDays": 1, "maxDays": 365}',
    'Time charter hire',
    NOW(),
    NULL
);

-- ============================================================================
-- FREIGHT FORWARDING SERVICE FEES (Examples)
-- ============================================================================

-- 17. Freight Forwarding Commission
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Freight Forwarding Commission',
    'FREIGHT_COMMISSION',
    'FREIGHT_FORWARDING',
    'PERCENTAGE',
    '{"percentage": 2.5, "baseCalculation": "freight_value"}',
    '2.5% of total freight value',
    1,
    'ACTIVE',
    NULL,
    '{"minAmount": 500}',
    'Freight forwarding service commission',
    NOW(),
    NULL
);

-- 18. Container Handling Fee
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Container Handling Fee',
    'CONTAINER_HANDLING',
    'FREIGHT_FORWARDING',
    'CONDITIONAL',
    '{"conditions": [{"if": "type == ''20ft''", "rate": 150}, {"if": "type == ''40ft''", "rate": 250}, {"if": "type == ''40ft-HC''", "rate": 300}], "multiplier": "container_count"}',
    'Per container: 20ft: $150, 40ft: $250, 40ft-HC: $300',
    2,
    'ACTIVE',
    NULL,
    NULL,
    'Container terminal handling charge',
    NOW(),
    NULL
);

-- ============================================================================
-- INACTIVE/ARCHIVED EXAMPLES
-- ============================================================================

-- 19. Old Tonnage Fee (Archived)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Old Tonnage Fee (2024)',
    'OLD_TONNAGE_FEE_2024',
    'SHIPPING_AGENCY',
    'SIMPLE_MULTIPLICATION',
    '{"multiplier": "GRT", "baseRateHaiphong": 0.020, "baseRateHochiminh": 0.023, "daysMultiplier": true}',
    'Deprecated: Old 2024 rates - GRT × rate × days',
    99,
    'ARCHIVED',
    NULL,
    NULL,
    'Replaced by new tonnage fee structure in 2025',
    NOW(),
    NULL
);

-- 20. Seasonal Surcharge (Inactive - off season)
INSERT INTO fee_configurations (
    fee_name, fee_code, service_type, formula_type, formula, formula_description,
    display_order, status, applicable_port, conditions, notes,
    created_at, updated_at
) VALUES (
    'Peak Season Surcharge',
    'PEAK_SEASON_SURCHARGE',
    'SHIPPING_AGENCY',
    'PERCENTAGE',
    '{"percentage": 10, "baseCalculation": "sum_of_previous_fees"}',
    '10% surcharge during peak season (Dec-Feb)',
    15,
    'INACTIVE',
    NULL,
    '{"seasonStart": "2025-12-01", "seasonEnd": "2026-02-28"}',
    'Currently off-season, will activate in December',
    NOW(),
    NULL
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count total fees inserted
SELECT 
    service_type,
    status,
    COUNT(*) as fee_count
FROM fee_configurations
GROUP BY service_type, status
ORDER BY service_type, status;

-- List all active Shipping Agency fees
SELECT 
    display_order,
    fee_name,
    fee_code,
    formula_type,
    status,
    applicable_port
FROM fee_configurations
WHERE service_type = 'SHIPPING_AGENCY'
  AND status = 'ACTIVE'
ORDER BY display_order;

-- ============================================================================
-- END OF SAMPLE DATA
-- ============================================================================
