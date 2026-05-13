# HQTCSDL
# Microservices Project

Dự án môn học về **Database trong kiến trúc Microservices**.  
Project gồm 3 service chính: `user`, `product`, `order`; backend viết bằng NodeJS/Express, dùng MySQL và test bằng Postman.
Cài NodeJS.
Vào từng service và cài thư viện:
#
bash
npm install
Chạy service:
#
#
bash
npm start
#
Dùng Postman để test API.

## Công nghệ sử dụng
- NodeJS
- Express
- MySQL
- Postman
- GitHub
- VS Code

## Cấu trúc project
```bash
microservices-project/
├── user-service/
├── product-service/
├── order-service/
├── database/
│   └── microservices_full.sql
└── README.md

Mysql: Các bảng chính:
users
products
orders
order_items
Kết quả test thử database bằng postman
Sau khi đã khởi chạy cả 3 dịch vụ (user-service trên port 3001, product-service trên port 3002 và order-service trên port 3003), bạn có thể sử dụng file Collection đính kèm để test luồng nghiệp vụ.
1.Luồng kiểm thử
Để đảm bảo tính toàn vẹn dữ liệu, bạn nên thực hiện theo thứ tự sau:
Tạo User: Để lấy user_id.
Tạo Product: Để lấy product_id.
Tạo Order: Sử dụng user_id và product_id vừa tạo để đặt hàng.
2.Chi tiết các Endpoint
User Service (Port 3001)

<img width="767" height="417" alt="image" src="https://github.com/user-attachments/assets/01f00732-2fe9-4ec3-8ba6-84346e6fa9d6" />

Product Service (Port 3002)
Dùng để quản lý kho hàng và giá cả.

<img width="767" height="652" alt="image" src="https://github.com/user-attachments/assets/6b93bcdb-536c-4074-95e4-700c8eaee3e4" />

Order Service (Port 3003)
Dùng để xử lý quy trình đặt hàng và lưu trữ lịch sử giao dịch.

<img width="763" height="677" alt="image" src="https://github.com/user-attachments/assets/61871f74-0199-4325-96cf-5d1d3a5b9a1f" />




