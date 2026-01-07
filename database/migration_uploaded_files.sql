-- Migration: Create uploaded_files table for spreadsheet management
-- Date: 2025-12-26

CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(100),
    INDEX idx_service_name (service_name),
    INDEX idx_upload_date (upload_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (optional)
-- INSERT INTO uploaded_files (file_name, original_file_name, service_name, file_path, file_size, uploaded_by)
-- VALUES 
-- ('20251226_120000_abc123.xlsx', 'freight_rates.xlsx', 'Freight Forwarding', 'uploads/spreadsheets/Freight Forwarding/20251226_120000_abc123.xlsx', 524288, 'admin'),
-- ('20251226_120100_def456.xlsx', 'chartering_prices.xlsx', 'Chartering & Broking', 'uploads/spreadsheets/Chartering & Broking/20251226_120100_def456.xlsx', 425984, 'admin');
