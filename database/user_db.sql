-- User Service Database (Production)
DROP DATABASE IF EXISTS user_db;
CREATE DATABASE user_db;
USE user_db;

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
