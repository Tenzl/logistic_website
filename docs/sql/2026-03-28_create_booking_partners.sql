-- Create table for booking partners management
CREATE TABLE IF NOT EXISTS booking_partners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(32) NOT NULL,
    country VARCHAR(128) NULL,
    city VARCHAR(128) NULL,
    contact_email VARCHAR(255) NULL,
    phone VARCHAR(64) NULL,
    fax VARCHAR(64) NULL,
    tracking_url VARCHAR(512) NULL,
    address TEXT NULL,
    customer_status VARCHAR(32) NULL,
    customer_type VARCHAR(32) NULL,
    tax_number VARCHAR(128) NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_by VARCHAR(255) NOT NULL,
    updated_at DATETIME NOT NULL,
    deleted_at DATETIME NULL,
    CONSTRAINT uk_booking_partners_customer_id UNIQUE (customer_id)
);

CREATE INDEX idx_booking_partners_customer_status ON booking_partners(customer_status);
CREATE INDEX idx_booking_partners_customer_type ON booking_partners(customer_type);
CREATE INDEX idx_booking_partners_deleted_at ON booking_partners(deleted_at);

-- Join table for additional types (normalized design)
CREATE TABLE IF NOT EXISTS booking_partner_addition_types (
    partner_id BIGINT NOT NULL,
    addition_type VARCHAR(32) NOT NULL,
    PRIMARY KEY (partner_id, addition_type),
    CONSTRAINT fk_booking_partner_addition_types_partner
      FOREIGN KEY (partner_id) REFERENCES booking_partners(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_booking_partner_addition_types_type_partner
  ON booking_partner_addition_types(addition_type, partner_id);

-- Sequence table for concurrency-safe customer id generation by date (yyMMdd)
CREATE TABLE IF NOT EXISTS customer_id_sequences (
    sequence_date CHAR(6) PRIMARY KEY,
    current_value BIGINT NOT NULL
);
