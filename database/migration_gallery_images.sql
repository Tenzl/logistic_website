-- Migration script for gallery_images system
-- Complete schema with validation for image count requirements

-- Drop existing tables
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS service_type_image_types;
DROP TABLE IF EXISTS image_types;
DROP TABLE IF EXISTS ports;
DROP TABLE IF EXISTS provinces;
DROP TABLE IF EXISTS service_types;
SET FOREIGN_KEY_CHECKS=1;

-- Table for managing service types
CREATE TABLE service_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for managing provinces
CREATE TABLE provinces (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for managing ports
CREATE TABLE ports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_province (province_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY uk_name_province (name, province_id),
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for managing image types
CREATE TABLE image_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_type_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    required_image_count INT DEFAULT 18,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_service_type (service_type_id),
    INDEX idx_is_active (is_active),
    UNIQUE KEY uk_service_image_name (service_type_id, name),
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main gallery_images table
CREATE TABLE gallery_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url LONGTEXT NOT NULL,
    province_id BIGINT NOT NULL,
    port_id BIGINT NOT NULL,
    service_type_id BIGINT NOT NULL,
    image_type_id BIGINT NOT NULL,
    uploaded_by_id BIGINT NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_province (province_id),
    INDEX idx_port (port_id),
    INDEX idx_service_type (service_type_id),
    INDEX idx_image_type (image_type_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE RESTRICT,
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (image_type_id) REFERENCES image_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default service types
INSERT INTO service_types (name, display_name, description) VALUES
('SHIPPING_AGENCY', 'Shipping Agency', 'Shipping agency services'),
('FREIGHT_FORWARDING', 'Freight Forwarding', 'Freight forwarding and logistics'),
('CHARTERING', 'Chartering & Broking', 'Chartering and ship broking services'),
('LOGISTICS', 'Logistics', 'General logistics services');

-- Insert all 63 provinces sorted by name (alphabetically) using ID from vn.json
INSERT INTO provinces (id, name) VALUES
(9, 'An Giang'),
(28, 'Bà Rịa - Vũng Tàu'),
(32, 'Bạc Liêu'),
(57, 'Bắc Giang'),
(56, 'Bắc Ninh'),
(36, 'Bến Tre'),
(41, 'Bình Định'),
(61, 'Bình Dương'),
(5, 'Bình Phước'),
(38, 'Bình Thuận'),
(31, 'Cà Mau'),
(63, 'Cần Thơ'),
(21, 'Cao Bằng'),
(43, 'Đà Nẵng'),
(3, 'Đắk Lắk'),
(2, 'Đắk Nông'),
(11, 'Điện Biên'),
(54, 'Đông Bắc'),
(55, 'Đồng Bằng Sông Hồng'),
(37, 'Đông Nam Bộ'),
(8, 'Ðong Tháp'),
(4, 'Gia Lai'),
(20, 'Hà Giang'),
(60, 'Hà Nam'),
(53, 'Hà Nội'),
(15, 'Hà Tĩnh'),
(59, 'Hải Dương'),
(47, 'Hải Phòng'),
(33, 'Hậu Giang'),
(48, 'Hòa Bình'),
(29, 'Hồ Chí Minh city'),
(30, 'Khánh Hòa'),
(10, 'Kiên Giang'),
(1, 'Kon Tum'),
(23, 'Lai Châu'),
(62, 'Lâm Đồng'),
(24, 'Lạng Sơn'),
(22, 'Lào Cai'),
(7, 'Long An'),
(45, 'Nam Định'),
(14, 'Nghệ An'),
(44, 'Ninh Bình'),
(39, 'Ninh Thuận'),
(52, 'Phú Thọ'),
(40, 'Phú Yên'),
(16, 'Quảng Bình'),
(19, 'Quảng Nam'),
(42, 'Quảng Ngãi'),
(25, 'Quảng Ninh'),
(17, 'Quảng Trị'),
(26, 'Sóc Trăng'),
(12, 'Sơn La'),
(6, 'Tây Ninh'),
(13, 'Thanh Hóa'),
(46, 'Thái Bình'),
(58, 'Thái Nguyên'),
(18, 'Thừa Thiên - Huế'),
(27, 'Tiền Giang'),
(35, 'Trà Vinh'),
(49, 'Tuyên Quang'),
(51, 'Vĩnh Phúc'),
(34, 'Vĩnh Long'),
(50, 'Yên Bái');

-- Insert sample ports for provinces with known ports
INSERT INTO ports (name, province_id) VALUES
('Cái Lân (Cai Lan Port)', 25),
('Nghi Sơn Port', 13),
('Cửa Lò Port', 14),
('Vũng Áng Port', 15),
('Chân Mây Port', 18),
('Chu Lai Port', 19),
('Dung Quất Port', 42),
('Quy Nhơn Port', 41),
('Phú Mỹ (Phu My Port)', 28),
('ODA Thị Vải', 28),
('SP-PSA', 28),
('SP-ITC', 29),
('Nhà Bè Port', 29);

-- Insert default image types with required count of 18
-- Shipping Agency image types
INSERT INTO image_types (service_type_id, name, display_name, description, required_image_count) 
SELECT id, 'HERO', 'Hero Image', 'Main hero/banner image', 18 FROM service_types WHERE name = 'SHIPPING_AGENCY'
UNION ALL
SELECT id, 'GALLERY', 'Gallery', 'Gallery images', 18 FROM service_types WHERE name = 'SHIPPING_AGENCY'
UNION ALL
SELECT id, 'BANNER', 'Banner', 'Banner images', 18 FROM service_types WHERE name = 'SHIPPING_AGENCY'
UNION ALL
SELECT id, 'BULK', 'Bulk Images', 'Bulk upload images', 18 FROM service_types WHERE name = 'SHIPPING_AGENCY'
UNION ALL
-- Freight Forwarding image types
SELECT id, 'HERO', 'Hero Image', 'Main hero/banner image', 18 FROM service_types WHERE name = 'FREIGHT_FORWARDING'
UNION ALL
SELECT id, 'GALLERY', 'Gallery', 'Gallery images', 18 FROM service_types WHERE name = 'FREIGHT_FORWARDING'
UNION ALL
SELECT id, 'THUMBNAIL', 'Thumbnail', 'Thumbnail images', 18 FROM service_types WHERE name = 'FREIGHT_FORWARDING'
UNION ALL
SELECT id, 'BULK', 'Bulk Images', 'Bulk upload images', 18 FROM service_types WHERE name = 'FREIGHT_FORWARDING'
UNION ALL
-- Chartering & Broking image types
SELECT id, 'HERO', 'Hero Image', 'Main hero/banner image', 18 FROM service_types WHERE name = 'CHARTERING'
UNION ALL
SELECT id, 'GALLERY', 'Gallery', 'Gallery images', 18 FROM service_types WHERE name = 'CHARTERING'
UNION ALL
SELECT id, 'BANNER', 'Banner', 'Banner images', 18 FROM service_types WHERE name = 'CHARTERING'
UNION ALL
SELECT id, 'BULK', 'Bulk Images', 'Bulk upload images', 18 FROM service_types WHERE name = 'CHARTERING'
UNION ALL
-- Logistics image types
SELECT id, 'GALLERY', 'Gallery', 'Gallery images', 18 FROM service_types WHERE name = 'LOGISTICS'
UNION ALL
SELECT id, 'THUMBNAIL', 'Thumbnail', 'Thumbnail images', 18 FROM service_types WHERE name = 'LOGISTICS'
UNION ALL
SELECT id, 'BULK', 'Bulk Images', 'Bulk upload images', 18 FROM service_types WHERE name = 'LOGISTICS';
