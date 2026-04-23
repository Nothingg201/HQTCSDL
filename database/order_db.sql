DROP DATABASE IF EXISTS order_db;
CREATE DATABASE order_db;
USE order_db;

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
