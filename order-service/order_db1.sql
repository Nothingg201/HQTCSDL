CREATE DATABASE order_db;
USE order_db;

drop table if exists orders;
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_name VARCHAR(255),
    price DECIMAL(10,2),
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    payment_method VARCHAR(50),
    amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255)
);
INSERT INTO users (name, email) VALUES
('Nguyễn Đình Vinh Lộc', 'loc@gmail.com'),
('Bùi Thái Sơn', 'son@gmail.com'),
('Lê Hoài Nam', 'nam@gmail.com'),
('Trần Thị Phương Thảo', 'thao@gmail.com'),
('Nguyễn Phú Lâm', 'lam@gmail.com'),
('Phạm Quang Nhật', 'nhat@gmail.com');
INSERT INTO orders (user_id, total_price, status) VALUES
(1, 1500000, 'pending'),
(2, 800000, 'completed'),
(3, 1200000, 'pending'),
(4, 500000, 'cancelled'),
(5, 950000, 'completed'),
(6, 300000, 'pending');
INSERT INTO order_items (order_id, product_name, price, quantity) VALUES
(1, 'Laptop', 1200000, 1),
(1, 'Mouse', 300000, 1),

(2, 'Keyboard', 500000, 1),
(2, 'Headset', 300000, 1),

(3, 'Monitor', 1000000, 1),
(3, 'Cable', 200000, 1),

(4, 'USB', 500000, 1),

(5, 'SSD', 700000, 1),
(5, 'RAM', 250000, 1),

(6, 'Mouse Pad', 300000, 1);

INSERT INTO payments (order_id, payment_method, amount, status) VALUES
(1, 'cash', 1500000, 'pending'),
(2, 'bank', 800000, 'paid'),
(3, 'cash', 1200000, 'pending'),
(4, 'bank', 500000, 'failed'),
(5, 'cash', 950000, 'paid'),
(6, 'cash', 300000, 'pending');

SELECT * 
FROM orders o
JOIN order_items oi ON o.id = oi.order_id;

SELECT * FROM users WHERE id = 4;