================================================================================
DATABASE FILES - MICROSERVICES PROJECT
================================================================================

Thư mục này chứa các file SQL cần thiết để khởi tạo database cho project microservices.
Hỗ trợ cả Development và Production environment.

================================================================================
CẤU TRÚC FILE SQL
================================================================================

DEVELOPMENT ENVIRONMENT (💻)
-----------------------------

microservices_full.sql
  - Mục đích: Database tổng hợp cho dev/testing local
  - Dùng khi: Chạy local với 1 database duy nhất
  - Database name: microservices_db
  - Bảng chứa: Tất cả 11 bảng (users, products, orders, etc.)
  - Dữ liệu mẫu: 6 users, 5 categories, 8 products, 5 reviews, 3 orders


PRODUCTION ENVIRONMENT (🚀)
---------------------------

user_db.sql (👤 User Service)
  - Mục đích: Database cho User Service
  - Database name: user_db
  - Bảng chứa:
    * users - Thông tin người dùng
    * user_profiles - Profile mở rộng
  - Dữ liệu mẫu: 6 users + 6 profiles

product_db.sql (📦 Product Service)
  - Mục đích: Database cho Product Service
  - Database name: product_db
  - Bảng chứa:
    * categories - Danh mục sản phẩm
    * products - Thông tin sản phẩm
    * product_reviews - Đánh giá sản phẩm
    * product_inventory - Lịch sử tồn kho
  - Dữ liệu mẫu: 5 categories, 8 products, 5 reviews

order_db.sql (📋 Order Service)
  - Mục đích: Database cho Order Service
  - Database name: order_db
  - Bảng chứa:
    * orders - Đơn hàng
    * order_items - Chi tiết đơn hàng
    * payments - Thông tin thanh toán
  - Dữ liệu mẫu: 3 orders, 5 order items, 3 payments

================================================================================
CÁCH SỬ DỤNG
================================================================================

DEVELOPMENT SETUP (💻)
----------------------

Command Line:
  # Import database tổng hợp cho dev
  mysql -u root -p < microservices_full.sql

MySQL Workbench:
  1. Mở MySQL Workbench
  2. File → Open SQL Script → microservices_full.sql
  3. Execute (Ctrl + Shift + Enter)

phpMyAdmin:
  1. Truy cập phpMyAdmin
  2. Tab Import → Chọn microservices_full.sql → Go


PRODUCTION SETUP (🚀)
---------------------

Command Line:
  # Import từng service database riêng
  mysql -u root -p < user_db.sql
  mysql -u root -p < product_db.sql
  mysql -u root -p < order_db.sql

MySQL Workbench:
  1. Mở MySQL Workbench
  2. File → Open SQL Script → Chọn từng file lần lượt
  3. Execute mỗi file (Ctrl + Shift + Enter)

================================================================================
DANH SÁCH BẢNG CHI TIẾT
================================================================================

USER SERVICE (user_db.sql)
--------------------------
  • users
    - id, name, email, phone, address, city, country, created_at, updated_at
  
  • user_profiles
    - id, user_id, bio, avatar_url, status, created_at, updated_at


PRODUCT SERVICE (product_db.sql)
---------------------------------
  • categories
    - id, name, description, created_at
  
  • products
    - id, category_id, name, description, price, cost, stock, sku, image_url, status, created_at, updated_at
  
  • product_reviews
    - id, product_id, user_id, rating, comment, created_at
  
  • product_inventory
    - id, product_id, quantity_change, transaction_type, notes, created_at


ORDER SERVICE (order_db.sql)
----------------------------
  • orders
    - id, user_id, order_date, status, total, created_at
  
  • order_items
    - id, order_id, product_id, quantity, unit_price
  
  • payments
    - id, order_id, payment_method, amount, status, created_at

================================================================================
KIẾN TRÚC MICROSERVICES
================================================================================

Development (1 Database)
────────────────────────
   microservices_db
   ├─ users, user_profiles
   ├─ categories, products, reviews, inventory
   └─ orders, order_items, payments


Production (3 Independent Databases)
─────────────────────────────────────
   user_db        product_db        order_db
   ├─users        ├─categories      ├─orders
   └─profiles     ├─products        ├─items
                  ├─reviews         └─payments
                  └─inventory

   Note: Order Service gọi User Service API (không cần foreign key)

================================================================================
CẤU HÌNH ENVIRONMENT
================================================================================

DEVELOPMENT (microservices_full.sql)
------------------------------------

user-service/.env
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=root
  DB_PASS=
  DB_NAME=microservices_db

product-service/.env
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=root
  DB_PASS=
  DB_NAME=microservices_db

order-service/.env
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=root
  DB_PASS=
  DB_NAME=microservices_db
  USER_SERVICE_URL=http://localhost:3001


PRODUCTION (user_db, product_db, order_db)
------------------------------------------

user-service/.env
  DB_HOST=user-db-server.example.com
  DB_PORT=3306
  DB_USER=user_service
  DB_PASS=secure_password
  DB_NAME=user_db

product-service/.env
  DB_HOST=product-db-server.example.com
  DB_PORT=3306
  DB_USER=product_service
  DB_PASS=secure_password
  DB_NAME=product_db

order-service/.env
  DB_HOST=order-db-server.example.com
  DB_PORT=3306
  DB_USER=order_service
  DB_PASS=secure_password
  DB_NAME=order_db
  USER_SERVICE_URL=https://user-service.example.com

================================================================================
DỮ LIỆU MẪU
================================================================================

Mỗi file SQL đã chứa dữ liệu mẫu hoàn chỉnh:
  • user_db.sql: 6 users + 6 profiles
  • product_db.sql: 5 categories + 8 products + 5 reviews
  • order_db.sql: 3 orders + 5 order items + 3 payments

================================================================================
LƯU Ý QUAN TRỌNG
================================================================================

1. Đảm bảo MySQL/MariaDB đang chạy trước khi import
2. Nếu database đã tồn tại, script sẽ xóa và tạo lại (DROP DATABASE)
3. Các Foreign Keys được cấu hình với ON DELETE CASCADE
4. Timestamps tự động cập nhật khi record được sửa

================================================================================
TROUBLESHOOTING
================================================================================

Lỗi: "Access denied for user 'root'@'localhost'"
  - Kiểm tra MySQL password trong command
  - Sử dụng: mysql -u root -p rồi nhập password

Lỗi: "Can't find file"
  - Đảm bảo terminal directory ở folder database
  - Dùng đường dẫn tuyệt đối: mysql -u root -p < C:\path\to\user_db.sql

Database không xuất hiện sau import
  - Kiểm tra output có "Query OK" không
  - Refresh database list trong MySQL Workbench (F5)

================================================================================
Last Updated: 2026-04-24
================================================================================
