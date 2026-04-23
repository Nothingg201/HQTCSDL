DROP DATABASE IF EXISTS microservices_db;
CREATE DATABASE microservices_db;
USE microservices_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_name VARCHAR(255),
  price DECIMAL(10,2),
  quantity INT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_method VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, phone, address, city, country) VALUES
('Nguyễn Văn An', 'an.nguyen@example.com', '0901000001', '123 Tran Hung Dao', 'Ha Noi', 'Vietnam'),
('Trần Thị Bình', 'binh.tran@example.com', '0901000002', '456 Nguyen Hue', 'Ho Chi Minh', 'Vietnam'),
('Lê Quang Cường', 'cuong.le@example.com', '0901000003', '789 Chu Van An', 'Da Nang', 'Vietnam'),
('Nguyễn Đình Vinh Lộc', 'loc@gmail.com', '0902000001', '321 Le Loi', 'Ha Noi', 'Vietnam'),
('Bùi Thái Sơn', 'son@gmail.com', '0902000002', '654 Ly Tu Trong', 'Ho Chi Minh', 'Vietnam'),
('Lê Hoài Nam', 'nam@gmail.com', '0902000003', '987 Dinh Tien Hoang', 'Can Tho', 'Vietnam');

INSERT INTO user_profiles (user_id, bio, status) VALUES
(1, 'Software Developer', 'active'),
(2, 'Product Manager', 'active'),
(3, 'Designer', 'active'),
(4, 'Data Analyst', 'active'),
(5, 'DevOps Engineer', 'active'),
(6, 'QA Engineer', 'active');

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

INSERT INTO orders (user_id, total_price, status) VALUES
(1, 16340000, 'paid'),
(2, 4580000, 'pending'),
(3, 2190000, 'shipped');

INSERT INTO order_items (order_id, product_name, price, quantity) VALUES
(1, 'Laptop Acer Aspire 5', 15990000, 1),
(1, 'Mouse Logitech M331', 350000, 1),
(2, 'Monitor Dell 24 inch', 3890000, 1),
(2, 'USB-C Hub 7 in 1', 690000, 1),
(3, 'Keyboard Keychron K2', 2190000, 1);

INSERT INTO payments (order_id, payment_method, amount, status) VALUES
(1, 'credit_card', 16340000, 'completed'),
(2, 'bank_transfer', 4580000, 'pending'),
(3, 'e_wallet', 2190000, 'completed');
