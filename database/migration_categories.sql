-- Migration: Add Categories and update Posts structure
-- Date: December 12, 2025

-- Step 1: Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create post_categories junction table
CREATE TABLE IF NOT EXISTS post_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_category (post_id, category_id),
    INDEX idx_post (post_id),
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Migrate existing category data from posts to new structure
-- Create categories from existing unique category values
INSERT IGNORE INTO categories (name, description)
SELECT DISTINCT category, CONCAT('Category: ', category)
FROM posts
WHERE category IS NOT NULL AND category != '';

-- Link posts to their categories
INSERT INTO post_categories (post_id, category_id)
SELECT p.id, c.id
FROM posts p
JOIN categories c ON p.category = c.name
WHERE p.category IS NOT NULL AND p.category != '';

-- Step 4: Insert sample categories
INSERT IGNORE INTO categories (name, description) VALUES
('Industry News', 'Latest news and updates from the shipping industry'),
('Company Updates', 'Updates and announcements from our company'),
('Services', 'Information about our services'),
('Logistics', 'Logistics and supply chain related content'),
('Maritime', 'Maritime and shipping related topics'),
('Technology', 'Technology innovations in shipping'),
('Regulations', 'Industry regulations and compliance');

-- Step 5: Drop old category column from posts (after data migration)
ALTER TABLE posts DROP COLUMN category;

-- Step 6: Optional - Drop summary column from posts (uncomment when ready)
-- ALTER TABLE posts DROP COLUMN summary;

-- Note: Before dropping columns, ensure all data is migrated and application is updated
