-- Migration: Create special_request_inquiries table
-- Date: 2025-12-27
-- Description: Add support for special requests from contact page

CREATE TABLE IF NOT EXISTS special_request_inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT NOT NULL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    preferred_office_id BIGINT,
    preferred_office_name VARCHAR(255),
    related_department_id BIGINT,
    related_department_name VARCHAR(255),
    message TEXT NOT NULL,
    other_info TEXT,
    
    CONSTRAINT fk_special_request_inquiry 
        FOREIGN KEY (inquiry_id) 
        REFERENCES service_inquiries(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_special_request_office 
        FOREIGN KEY (preferred_office_id) 
        REFERENCES provinces(id) 
        ON DELETE SET NULL,
        
    CONSTRAINT fk_special_request_department 
        FOREIGN KEY (related_department_id) 
        REFERENCES service_types(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better query performance
CREATE INDEX idx_special_request_office ON special_request_inquiries(preferred_office_id);
CREATE INDEX idx_special_request_department ON special_request_inquiries(related_department_id);
