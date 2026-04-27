require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối với Database 
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "product_db",
    port: process.env.DB_PORT || 3306
});

// Route kiểm tra trạng thái
app.get("/", (req, res) => {
    res.json({ message: "Product service is running" });
});

// Lấy danh sách toàn bộ sản phẩm
app.get("/products", async (req, res) => {
    try {
        const [products] = await db.query("SELECT * FROM products");
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lấy thông tin chi tiết của 1 sản phẩm 
app.get("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
        
        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(products[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Thêm sản phẩm mới vào kho
app.post("/products", async (req, res) => {
    try {
        // Giả sử bảng products có các cột: name, price, stock
        const { name, price, stock } = req.body;
        
        const [result] = await db.query(
            "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", 
            [name, price, stock]
        );
        
        res.status(201).json({ 
            message: "Product created successfully", 
            product_id: result.insertId 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
