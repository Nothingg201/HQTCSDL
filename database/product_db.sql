-- Product Service Database (Production)
DROP DATABASE IF EXISTS product_db;
CREATE DATABASE product_db;
USE product_db;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  cost DECIMAL(12,2),
  stock INT NOT NULL DEFAULT 0,
  min_stock INT DEFAULT 10,
  sku VARCHAR(100) UNIQUE,
  image_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  quantity_change INT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

INSERT INTO categories (name, description) VALUES
('Laptop', 'Máy tính xách tay'),
('Phụ kiện', 'Phụ kiện máy tính'),
('Màn hình', 'Thiết bị hiển thị'),
('Lưu trữ', 'Thiết bị lưu trữ dữ liệu'),
('Gaming', 'Thiết bị gaming');

INSERT INTO products (category_id, name, description, price, cost, stock, sku, status) VALUES
(1, 'Laptop Acer Aspire 5', 'Intel Core i5, 8GB RAM, 512GB SSD', 15990000, 12000000, 12, 'ACER-AS5-001', 'active'),
(2, 'Mouse Logitech M331', 'Chuột wireless 2.4GHz', 350000, 200000, 50, 'LOG-M331-001', 'active'),
(2, 'Keyboard Keychron K2', 'Bàn phím cơ wireless', 2190000, 1500000, 20, 'KEY-K2-001', 'active'),
(3, 'Monitor Dell 24 inch', 'Full HD 1920x1080, 60Hz', 3890000, 2500000, 15, 'DELL-24-001', 'active'),
(2, 'USB-C Hub 7 in 1', 'Hub mở rộng cổng', 690000, 400000, 30, 'HUB-USB-001', 'active'),
(1, 'Laptop Dell XPS 13', 'Intel Core i7, 16GB RAM, 512GB SSD', 25990000, 20000000, 8, 'DELL-XPS13-001', 'active'),
(3, 'Monitor ASUS 27 inch', '4K 3840x2160, 60Hz', 8990000, 6000000, 5, 'ASUS-27-001', 'active'),
(5, 'Gaming Mouse Razer DeathAdder', 'RGB, 16000 DPI', 1290000, 800000, 25, 'RAZ-DA-001', 'active');

INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES
(1, 1, 5, 'Sản phẩm rất tốt, giao hàng nhanh'),
(1, 2, 4, 'Chất lượng tốt, giá hợp lý'),
(2, 3, 5, 'Chuột rất nhạy, rất hài lòng'),
(3, 1, 4, 'Bàn phím gõ rất thoải mái'),
(4, 2, 5, 'Màn hình sắc nét, giá cả hợp lý');
