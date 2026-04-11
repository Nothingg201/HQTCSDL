DROP DATABASE IF EXISTS microservices_db;
CREATE DATABASE microservices_db;
USE microservices_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

INSERT INTO users (name, email, phone) VALUES
('Nguyen Van An', 'an.nguyen@example.com', '0901000001'),
('Tran Thi Binh', 'binh.tran@example.com', '0901000002'),
('Le Quang Cuong', 'cuong.le@example.com', '0901000003');

INSERT INTO products (name, price, stock) VALUES
('Laptop Acer Aspire 5', 15990000, 12),
('Mouse Logitech M331', 350000, 50),
('Keyboard Keychron K2', 2190000, 20),
('Monitor Dell 24 inch', 3890000, 15),
('USB-C Hub', 690000, 30);

INSERT INTO orders (user_id, status, total) VALUES
(1, 'paid', 16340000),
(2, 'pending', 4580000),
(3, 'shipped', 2190000);

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 1, 15990000),
(1, 2, 1, 350000),
(2, 4, 1, 3890000),
(2, 5, 1, 690000),
(3, 3, 1, 2190000);
