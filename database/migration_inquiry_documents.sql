-- Migration: Add InquiryDocument table for managing inquiry attachments (invoices, quotations, etc.)
-- Purpose: Enable admin to upload and manage PDF documents for customer inquiries
-- Date: 2025-12-27
-- Version: 1.0

CREATE TABLE IF NOT EXISTS inquiry_documents (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    uploaded_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    checksum VARCHAR(64),
    
    -- Foreign Keys
    CONSTRAINT fk_inquiry_documents_inquiry FOREIGN KEY (inquiry_id) 
        REFERENCES service_inquiries(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inquiry_documents_user FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    KEY idx_inquiry_id (inquiry_id),
    KEY idx_document_type (document_type),
    KEY idx_uploaded_at (uploaded_at),
    KEY idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit trigger for document uploads
CREATE TRIGGER inquiry_documents_audit_insert
AFTER INSERT ON inquiry_documents
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (entity_name, entity_id, action, created_at)
    VALUES ('InquiryDocument', NEW.id, 'CREATED', NOW());
END;

CREATE TRIGGER inquiry_documents_audit_update
AFTER UPDATE ON inquiry_documents
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (entity_name, entity_id, action, created_at)
    VALUES ('InquiryDocument', NEW.id, 'UPDATED', NOW());
END;

CREATE TRIGGER inquiry_documents_audit_delete
AFTER DELETE ON inquiry_documents
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (entity_name, entity_id, action, created_at)
    VALUES ('InquiryDocument', OLD.id, 'DELETED', NOW());
END;
