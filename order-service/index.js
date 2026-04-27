require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối DB
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// =============================
// GET ALL ORDERS + USER INFO
// =============================
app.get("/orders", async (req, res) => {
    try {
        const [orders] = await db.query("SELECT * FROM orders");

        const result = await Promise.all(
            orders.map(async (order) => {
                try {
          const url = `${process.env.USER_SERVICE_URL}/users/${order.user_id}`;
          const userRes = await axios.get(url);
                    return {
                        ...order,
                        user: userRes.data
                    };
                }
                 catch (err) {
          console.log(
            "Lỗi gọi user-service cho order",
            order.id,
            "user_id:",
            order.user_id,
            "=>",
            err.message
          );
    return {
        ...order,
        user: null
    };
 }
})
);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================
// GET ORDER DETAIL
// =============================
app.get("/orders/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id = ?",
            [id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = orders[0];

        // lấy items
        const [items] = await db.query(
            "SELECT * FROM order_items WHERE order_id = ?",
            [id]
        );

        // gọi user-service
        let user = null;
        try {
            const userRes = await axios.get(
                `${process.env.USER_SERVICE_URL}/users/${order.user_id}`
            );
            user = userRes.data;
        } catch {}

        res.json({
            ...order,
            items,
            user
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================
// CREATE ORDER
// =============================
app.post("/orders", async (req, res) => {
    try {
        const { user_id, items } = req.body;

        let total = 0;
        items.forEach(item => {
            total += item.price * item.quantity;
        });

        // tạo order
        const [result] = await db.query(
            "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
            [user_id, total]
        );

        const orderId = result.insertId;

        // insert items
        for (let item of items) {
            await db.query(
                "INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)",
                [orderId, item.product_name, item.price, item.quantity]
            );
        }

        res.json({
            message: "Order created",
            order_id: orderId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================
// START SERVER
// =============================
app.listen(process.env.PORT, () => {
    console.log(`Order Service running on port ${process.env.PORT}`);
});