-- Create posts table for blog/news functionality
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id BIGINT NOT NULL,
    category VARCHAR(100),
    thumbnail_url VARCHAR(500),
    published_at DATETIME,
    is_published BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_published (is_published, published_at),
    INDEX idx_category (category),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data
INSERT INTO posts (title, content, summary, author_id, category, thumbnail_url, is_published, published_at) 
VALUES 
(
    'Dịch vụ vận tải biển chuyên nghiệp tại Việt Nam',
    '<h2>Giới thiệu dịch vụ</h2><p>Công ty chúng tôi cung cấp <strong>dịch vụ vận tải biển</strong> với hơn <em>10 năm kinh nghiệm</em> trong ngành.</p><h3>Các dịch vụ chính:</h3><ul><li>Shipping Agency</li><li>Freight Forwarding</li><li>Chartering & Broking</li><li>Total Logistics</li></ul><p style="text-align: center; color: #0066cc; font-size: 18px;">Liên hệ ngay để được tư vấn!</p>',
    'Công ty chúng tôi cung cấp dịch vụ vận tải biển với hơn 10 năm kinh nghiệm trong ngành.',
    1,
    'Services',
    '/uploads/posts/shipping-service.jpg',
    TRUE,
    NOW()
),
(
    'Tin tức ngành logistics tháng 12/2025',
    '<h2>Cập nhật mới nhất</h2><p>Thị trường logistics Việt Nam đang có những <strong>biến động tích cực</strong> trong quý 4 năm 2025.</p><p>Các chuyên gia dự đoán tăng trưởng <span style="color: green; font-weight: bold;">15-20%</span> trong năm tới.</p>',
    'Thị trường logistics Việt Nam đang có những biến động tích cực trong quý 4 năm 2025.',
    1,
    'News',
    '/uploads/posts/logistics-news.jpg',
    TRUE,
    NOW()
),
(
    'Bài viết draft - chưa publish',
    '<h2>Đây là bài draft</h2><p>Nội dung đang được soạn thảo...</p>',
    'Bài viết đang trong quá trình soạn thảo',
    1,
    'Draft',
    NULL,
    FALSE,
    NULL
);
