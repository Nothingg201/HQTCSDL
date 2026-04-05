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
