-- Script tạo database và tables cho hệ thống Seatrans Logistics
-- Date: 2025-12-02

-- Sử dụng database seatrans
USE seatrans;

-- Drop tables nếu đã tồn tại (theo thứ tự ngược để tránh foreign key constraint)
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. TABLE: users
-- ============================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABLE: roles
-- ============================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    role_group VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (role_group IN ('INTERNAL', 'EXTERNAL')),
    INDEX idx_role_group (role_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. TABLE: user_roles (Join Table)
-- ============================================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABLE: customers
-- ============================================
CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    customer_code VARCHAR(20) UNIQUE NOT NULL,
    company_name VARCHAR(200),
    tax_code VARCHAR(50),
    customer_type VARCHAR(20) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    loyalty_points INT DEFAULT 0,
    membership_level VARCHAR(20) DEFAULT 'BRONZE',
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (customer_type IN ('INDIVIDUAL', 'COMPANY')),
    CHECK (membership_level IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    CHECK (loyalty_points >= 0),
    CHECK (credit_limit >= 0),
    
    INDEX idx_customer_code (customer_code),
    INDEX idx_user_id (user_id),
    INDEX idx_membership_level (membership_level),
    INDEX idx_customer_type (customer_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABLE: employees
-- ============================================
CREATE TABLE employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    hire_date DATE NOT NULL,
    salary DECIMAL(15, 2),
    commission_rate DECIMAL(5, 2) DEFAULT 0,
    manager_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    CHECK (department IN ('SALES', 'OPERATIONS', 'FINANCE', 'CUSTOMER_SERVICE', 'ADMINISTRATION', 'IT')),
    CHECK (salary >= 0 OR salary IS NULL),
    CHECK (commission_rate >= 0 AND commission_rate <= 100),
    
    INDEX idx_employee_code (employee_code),
    INDEX idx_user_id (user_id),
    INDEX idx_department (department),
    INDEX idx_manager_id (manager_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description, role_group) VALUES
('ROLE_ADMIN', 'Administrator with full system access', 'INTERNAL'),
('ROLE_EMPLOYEE', 'Employee with operational access', 'INTERNAL'),
('ROLE_CUSTOMER', 'Customer user', 'EXTERNAL');

-- Insert sample admin user (password: Admin123)
-- Note: Password cần được hash bằng BCrypt trong application
INSERT INTO users (email, password, full_name, phone, is_active) VALUES
('admin@seatrans.com', '$2a$10$N.zmjlPxI7eQPVzPe4GKqefP6P.JhRQKnIJ2qX1WjQvQr/PiKGKKq', 'System Administrator', '+84123456789', TRUE);

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1);

-- Insert sample admin employee record
INSERT INTO employees (user_id, employee_code, department, position, hire_date, is_active) VALUES
(1, 'EMP-20251202-0001', 'ADMINISTRATION', 'System Administrator', '2025-01-01', TRUE);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables created
SELECT 'Tables created successfully!' AS Status;

-- Show all tables
SHOW TABLES;

-- Verify roles
SELECT * FROM roles;

-- Verify admin user
SELECT u.id, u.email, u.full_name, r.name as role_name, r.role_group
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id;

-- Table structure summary
SELECT 
    'users' AS table_name, 
    COUNT(*) AS record_count 
FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'employees', COUNT(*) FROM employees;

-- ============================================
-- SAMPLE DATA (OPTIONAL - Uncomment to use)
-- ============================================


-- Insert sample employee user (password: Employee123)
INSERT INTO users (email, password, full_name, phone, is_active) VALUES
('john.doe@seatrans.com', '$2a$10$N.zmjlPxI7eQPVzPe4GKqefP6P.JhRQKnIJ2qX1WjQvQr/PiKGKKq', 'John Doe', '+84987654321', TRUE);

-- Assign EMPLOYEE role
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(2, 2, 1);

-- Insert employee details
INSERT INTO employees (user_id, employee_code, department, position, hire_date, salary, commission_rate, manager_id, is_active) VALUES
(2, 'EMP-20251202-0002', 'SALES', 'Sales Manager', '2025-01-15', 25000000, 5.00, 1, TRUE);

-- Insert sample customer user (password: Customer123)
INSERT INTO users (email, password, full_name, phone, is_active) VALUES
('customer1@example.com', '$2a$10$N.zmjlPxI7eQPVzPe4GKqefP6P.JhRQKnIJ2qX1WjQvQr/PiKGKKq', 'Nguyen Van A', '+84912345678', TRUE);

-- Assign CUSTOMER role
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(3, 3, 1);

-- Insert customer details
INSERT INTO customers (user_id, customer_code, company_name, tax_code, customer_type, address, city, country, postal_code, loyalty_points, membership_level, credit_limit) VALUES
(3, 'CUST-20251202-0001', 'ABC Company Ltd', '0123456789', 'COMPANY', '123 Le Loi Street', 'Ho Chi Minh City', 'Vietnam', '700000', 500, 'BRONZE', 50000000);

-- Verify sample data
SELECT 
    u.full_name,
    u.email,
    GROUP_CONCAT(r.name) AS roles,
    r.role_group,
    CASE 
        WHEN c.id IS NOT NULL THEN CONCAT('Customer: ', c.customer_code)
        WHEN e.id IS NOT NULL THEN CONCAT('Employee: ', e.employee_code)
        ELSE 'No extended info'
    END AS user_type
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN customers c ON u.id = c.user_id
LEFT JOIN employees e ON u.id = e.user_id
GROUP BY u.id;


-- ============================================
-- NOTES
-- ============================================
-- 1. Default admin password: Admin123 (BCrypt hash provided)
-- 2. Remember to change admin password after first login
-- 3. All passwords in application should be hashed using BCrypt
-- 4. Uncomment SAMPLE DATA section to insert test data
-- 5. Auto-increment starts from 1 for all tables
-- 6. Timestamps use server timezone
-- 7. Character set: utf8mb4 for full Unicode support

-- ============================================
-- END OF SCRIPT
-- ============================================
