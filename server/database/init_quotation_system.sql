-- Quotation System Database Schema
-- Created: December 4, 2025
-- Purpose: Service requests, quotations, orders management with confidential pricing

-- ============================================================================
-- 1. Service Requests Table (Customer Input Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    request_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    request_status VARCHAR(20) DEFAULT 'DRAFT',
    
    full_name VARCHAR(200) NOT NULL,
    contact_info VARCHAR(500) NOT NULL,
    other_information TEXT,
    
    service_data JSON NOT NULL,
    
    submitted_at TIMESTAMP NULL,
    quoted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (request_status),
    INDEX idx_service (service_type),
    INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Quotations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quote_code VARCHAR(50) UNIQUE NOT NULL,
    request_id BIGINT NULL,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT NULL,
    service_type VARCHAR(50) NOT NULL,
    
    quote_status VARCHAR(20) DEFAULT 'DRAFT',
    
    base_price DECIMAL(12,2) NOT NULL,
    total_surcharges DECIMAL(12,2) DEFAULT 0,
    total_discounts DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    is_price_overridden BOOLEAN DEFAULT FALSE,
    override_reason TEXT NULL,
    original_calculated_price DECIMAL(12,2) NULL,
    
    quote_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    
    service_input_data JSON NOT NULL,
    
    customer_response VARCHAR(20) NULL,
    customer_response_date TIMESTAMP NULL,
    customer_notes TEXT NULL,
    
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (request_id) REFERENCES service_requests(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_customer (customer_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (quote_status),
    INDEX idx_valid (valid_until),
    INDEX idx_quote_date (quote_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. Quotation Items Table (INTERNAL USE ONLY - Price Breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS quotation_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quotation_id BIGINT NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NULL,
    total_price DECIMAL(12,2) NOT NULL,
    calculation_note TEXT NULL,
    display_order INTEGER DEFAULT 0,
    
    is_internal_only BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id),
    INDEX idx_category (item_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. Price Calculations Table (CONFIDENTIAL AUDIT TRAIL)
-- ============================================================================
CREATE TABLE IF NOT EXISTS price_calculations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quotation_id BIGINT NOT NULL,
    calculation_step VARCHAR(100) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    
    formula_used TEXT NULL,
    input_values JSON NULL,
    base_value DECIMAL(12,2) NULL,
    rate_applied DECIMAL(10,4) NULL,
    multiplier DECIMAL(10,4) NULL,
    calculated_value DECIMAL(12,2) NOT NULL,
    
    currency VARCHAR(3) DEFAULT 'USD',
    calculation_notes TEXT NULL,
    step_order INTEGER DEFAULT 0,
    
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    INDEX idx_quotation (quotation_id),
    INDEX idx_step (calculation_step)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. Orders Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    quotation_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    employee_id BIGINT NULL,
    service_type VARCHAR(50) NOT NULL,
    
    order_status VARCHAR(20) DEFAULT 'PENDING',
    
    base_price DECIMAL(12,2) NOT NULL,
    total_surcharges DECIMAL(12,2) DEFAULT 0,
    total_discounts DECIMAL(12,2) DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    payment_status VARCHAR(20) DEFAULT 'UNPAID',
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(50) NULL,
    
    service_data JSON NOT NULL,
    
    order_date DATE NOT NULL,
    confirmed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    customer_notes TEXT NULL,
    internal_notes TEXT NULL,
    cancellation_reason TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quotation_id) REFERENCES quotations(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    INDEX idx_customer (customer_id),
    INDEX idx_employee (employee_id),
    INDEX idx_status (order_status),
    INDEX idx_payment (payment_status),
    INDEX idx_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. Order Items Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NULL,
    total_price DECIMAL(12,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. Saved Estimates Table (Guest Users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_estimates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    estimate_code VARCHAR(50) UNIQUE NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    
    session_id VARCHAR(100) NULL,
    email VARCHAR(255) NULL,
    
    service_input_data JSON NOT NULL,
    
    estimated_price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    converted_to_request_id BIGINT NULL,
    
    INDEX idx_session (session_id),
    INDEX idx_email (email),
    INDEX idx_service (service_type),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. Rate Tables (For Price Calculation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_tables (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(50) NOT NULL,
    rate_category VARCHAR(100) NOT NULL,
    rate_name VARCHAR(200) NOT NULL,
    
    from_location VARCHAR(200) NULL,
    to_location VARCHAR(200) NULL,
    
    base_rate DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    unit VARCHAR(50) NULL,
    
    valid_from DATE NOT NULL,
    valid_to DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service (service_type),
    INDEX idx_category (rate_category),
    INDEX idx_route (from_location, to_location),
    INDEX idx_valid (valid_from, valid_to),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. Surcharge Rules Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS surcharge_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(50) NOT NULL,
    surcharge_name VARCHAR(200) NOT NULL,
    surcharge_type VARCHAR(50) NOT NULL,
    
    calculation_method VARCHAR(50) NOT NULL,
    rate_value DECIMAL(10,4) NOT NULL,
    
    applicable_conditions JSON NULL,
    
    valid_from DATE NOT NULL,
    valid_to DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service (service_type),
    INDEX idx_type (surcharge_type),
    INDEX idx_valid (valid_from, valid_to),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. Discount Rules Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS discount_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(50) NOT NULL,
    discount_name VARCHAR(200) NOT NULL,
    discount_type VARCHAR(50) NOT NULL,
    
    calculation_method VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10,4) NOT NULL,
    
    applicable_conditions JSON NULL,
    
    valid_from DATE NOT NULL,
    valid_to DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service (service_type),
    INDEX idx_type (discount_type),
    INDEX idx_valid (valid_from, valid_to),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Sample Data - Rate Tables
-- ============================================================================

-- Freight Forwarding Rates
INSERT INTO rate_tables (service_type, rate_category, rate_name, from_location, to_location, base_rate, unit, valid_from) VALUES
('FREIGHT_FORWARDING', 'OCEAN_FREIGHT', 'Container 20ft', 'Haiphong', 'Singapore', 300.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'OCEAN_FREIGHT', 'Container 40ft', 'Haiphong', 'Singapore', 500.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'THC', 'THC Origin 20ft', 'Haiphong', NULL, 80.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'THC', 'THC Origin 40ft', 'Haiphong', NULL, 120.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'THC', 'THC Destination 20ft', 'Singapore', NULL, 100.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'THC', 'THC Destination 40ft', 'Singapore', NULL, 180.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'DOCUMENTATION', 'Documentation Fee', NULL, NULL, 230.00, 'per shipment', '2025-01-01'),
('FREIGHT_FORWARDING', 'INLAND_TRANSPORT', 'Inland Origin 20ft', 'Haiphong', NULL, 80.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'INLAND_TRANSPORT', 'Inland Origin 40ft', 'Haiphong', NULL, 100.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'INLAND_TRANSPORT', 'Inland Destination 20ft', 'Singapore', NULL, 120.00, 'per container', '2025-01-01'),
('FREIGHT_FORWARDING', 'INLAND_TRANSPORT', 'Inland Destination 40ft', 'Singapore', NULL, 150.00, 'per container', '2025-01-01');

-- Shipping Agency Rates
INSERT INTO rate_tables (service_type, rate_category, rate_name, from_location, to_location, base_rate, unit, valid_from) VALUES
('SHIPPING_AGENCY', 'PORT_DUES', 'Port Dues Base', NULL, NULL, 500.00, 'per call', '2025-01-01'),
('SHIPPING_AGENCY', 'AGENCY_FEE', 'Agency Fee', NULL, NULL, 800.00, 'per call', '2025-01-01'),
('SHIPPING_AGENCY', 'PILOTAGE', 'Pilotage Service', NULL, NULL, 300.00, 'per call', '2025-01-01');

-- Chartering Rates
INSERT INTO rate_tables (service_type, rate_category, rate_name, from_location, to_location, base_rate, unit, valid_from) VALUES
('CHARTERING', 'VOYAGE_CHARTER', 'Voyage Charter Base', 'Haiphong', 'Japan', 15000.00, 'per voyage', '2025-01-01'),
('CHARTERING', 'BROKERAGE', 'Brokerage Fee', NULL, NULL, 2.5, 'percent', '2025-01-01');

-- ============================================================================
-- Sample Data - Surcharge Rules
-- ============================================================================
INSERT INTO surcharge_rules (service_type, surcharge_name, surcharge_type, calculation_method, rate_value, valid_from) VALUES
('FREIGHT_FORWARDING', 'BAF (Bunker Adjustment Factor)', 'BAF', 'PERCENTAGE', 0.10, '2025-01-01'),
('FREIGHT_FORWARDING', 'CAF (Currency Adjustment Factor)', 'CAF', 'PERCENTAGE', 0.05, '2025-01-01'),
('FREIGHT_FORWARDING', 'Peak Season Surcharge', 'PSS', 'PERCENTAGE', 0.15, '2025-06-01'),
('SHIPPING_AGENCY', 'Night Shift Surcharge', 'NIGHT_SHIFT', 'FIXED', 200.00, '2025-01-01'),
('CHARTERING', 'War Risk Premium', 'WAR_RISK', 'PERCENTAGE', 0.02, '2025-01-01');

-- ============================================================================
-- Sample Data - Discount Rules
-- ============================================================================
INSERT INTO discount_rules (service_type, discount_name, discount_type, calculation_method, discount_value, valid_from) VALUES
('FREIGHT_FORWARDING', 'Volume Discount (5+ containers)', 'VOLUME', 'PERCENTAGE', 0.05, '2025-01-01'),
('FREIGHT_FORWARDING', 'Long-term Customer Discount', 'LOYALTY', 'PERCENTAGE', 0.10, '2025-01-01'),
('SHIPPING_AGENCY', 'Regular Customer Discount', 'LOYALTY', 'PERCENTAGE', 0.08, '2025-01-01'),
('CHARTERING', 'Multiple Voyage Discount', 'VOLUME', 'PERCENTAGE', 0.07, '2025-01-01');
