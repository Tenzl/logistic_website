-- Keep FK checks off for full rebuild to avoid cross-schema FK interference
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS rate_tables;
DROP TABLE IF EXISTS conditional_rules;
DROP TABLE IF EXISTS conditional_tiers;
DROP TABLE IF EXISTS select_values;
DROP TABLE IF EXISTS admin_inputs;
DROP TABLE IF EXISTS formula_lines;
DROP TABLE IF EXISTS rate_table_configs;
DROP TABLE IF EXISTS pricing_group_ports;
DROP TABLE IF EXISTS pricing_groups;

-- Create pricing_groups table
CREATE TABLE pricing_groups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_type (service_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bridge table for many-to-many relation between pricing_groups and ports
CREATE TABLE pricing_group_ports (
    pricing_group_id BIGINT UNSIGNED NOT NULL,
    port_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pricing_group_id, port_id),
    INDEX idx_port_id (port_id),
    FOREIGN KEY (pricing_group_id) REFERENCES pricing_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Create admin_inputs table
CREATE TABLE admin_inputs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pricing_group_id BIGINT UNSIGNED NOT NULL,
    variable_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    input_type VARCHAR(50) NOT NULL DEFAULT 'NUMBER',
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    unit VARCHAR(50),
    min_value DECIMAL(15,2),
    max_value DECIMAL(15,2),
    default_value DECIMAL(15,2),
    help_text TEXT,
    order_no INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (pricing_group_id) REFERENCES pricing_groups(id) ON DELETE CASCADE,
    INDEX idx_pricing_group_id (pricing_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create select_values table
CREATE TABLE select_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_input_id BIGINT NOT NULL,
    label VARCHAR(200) NOT NULL,
    value VARCHAR(100) NOT NULL,
    order_no INT NOT NULL DEFAULT 0,
    FOREIGN KEY (admin_input_id) REFERENCES admin_inputs(id) ON DELETE CASCADE,
    INDEX idx_admin_input_id (admin_input_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create formula_lines table
CREATE TABLE formula_lines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pricing_group_id BIGINT UNSIGNED NOT NULL,
    line_type VARCHAR(50) NOT NULL,
    label VARCHAR(200) NOT NULL,
    formula TEXT,
    is_bold BOOLEAN NOT NULL DEFAULT FALSE,
    is_subtotal BOOLEAN NOT NULL DEFAULT FALSE,
    order_no INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (pricing_group_id) REFERENCES pricing_groups(id) ON DELETE CASCADE,
    INDEX idx_pricing_group_formula (pricing_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create conditional_tiers table
CREATE TABLE conditional_tiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    formula_line_id BIGINT NOT NULL,
    tier_name VARCHAR(100) NOT NULL,
    condition_formula TEXT NOT NULL,
    value_formula TEXT NOT NULL,
    order_no INT NOT NULL DEFAULT 0,
    FOREIGN KEY (formula_line_id) REFERENCES formula_lines(id) ON DELETE CASCADE,
    INDEX idx_formula_line_tier (formula_line_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create conditional_rules table
CREATE TABLE conditional_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    formula_line_id BIGINT NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    condition_formula TEXT NOT NULL,
    value_formula TEXT NOT NULL,
    order_no INT NOT NULL DEFAULT 0,
    FOREIGN KEY (formula_line_id) REFERENCES formula_lines(id) ON DELETE CASCADE,
    INDEX idx_formula_line_rule (formula_line_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create rate_table_configs table
CREATE TABLE rate_table_configs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pricing_group_id BIGINT UNSIGNED NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    description TEXT,
    lookup_key VARCHAR(100) NOT NULL,
    value_column VARCHAR(100) NOT NULL,
    flat_amount DECIMAL(15,2),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (pricing_group_id) REFERENCES pricing_groups(id) ON DELETE CASCADE,
    INDEX idx_pricing_group_rate (pricing_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
