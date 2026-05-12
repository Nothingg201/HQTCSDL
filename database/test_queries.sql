-- =====================================================
-- TEST QUERIES FOR MICROSERVICES DATABASE
-- =====================================================

USE microservices_db;

-- =====================================================
-- TEST 1: JOIN USERS AND ORDERS
-- =====================================================
SELECT 'TEST 1: Users joined with Orders' AS test_name;
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    u.email,
    u.phone,
    o.id AS order_id,
    o.total_price,
    o.status,
    o.created_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
ORDER BY u.id, o.id;

-- =====================================================
-- TEST 2: ORDERS WITH ORDER ITEMS
-- =====================================================
SELECT 'TEST 2: Orders with Order Items' AS test_name;
SELECT 
    o.id AS order_id,
    u.name AS user_name,
    o.total_price,
    o.status,
    oi.product_name,
    oi.price,
    oi.quantity,
    (oi.price * oi.quantity) AS item_total
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
ORDER BY o.id;

-- =====================================================
-- TEST 3: PRODUCTS WITH CATEGORIES
-- =====================================================
SELECT 'TEST 3: Products with Categories' AS test_name;
SELECT 
    p.id,
    c.name AS category_name,
    p.name AS product_name,
    p.price,
    p.stock,
    p.status
FROM products p
JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;

-- =====================================================
-- TEST 4: COMPLETE ORDER DETAILS
-- =====================================================
SELECT 'TEST 4: Complete Order Details' AS test_name;
SELECT 
    o.id AS order_id,
    u.name AS customer_name,
    u.email,
    o.total_price,
    o.status AS order_status,
    COUNT(oi.id) AS total_items,
    py.payment_method,
    py.status AS payment_status
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN payments py ON o.id = py.order_id
GROUP BY o.id, u.id, u.name, u.email, o.total_price, o.status, py.payment_method, py.status;

-- =====================================================
-- TEST 5: VERIFY DATA COUNTS
-- =====================================================
SELECT 'TEST 5: Data Verification' AS test_name;
SELECT 
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM order_items) AS total_order_items,
    (SELECT SUM(total_price) FROM orders) AS total_revenue;
