-- Order Service Database (Production)
DROP DATABASE IF EXISTS order_db;
CREATE DATABASE order_db;
USE order_db;

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
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  payment_method VARCHAR(50),
  amount DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

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

INSERT INTO payments (order_id, payment_method, amount, status) VALUES
(1, 'credit_card', 16340000, 'completed'),
(2, 'bank_transfer', 4580000, 'pending'),
(3, 'e_wallet', 2190000, 'completed');
