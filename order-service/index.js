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

function isValidId(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

function isValidNumber(value) {
    return Number.isFinite(Number(value));
}

function validateItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return { ok: false, message: "items must be a non-empty array" };
    }
    for (let i = 0; i < items.length; i += 1) {
        const item = items[i] || {};
        if (
            item.product_name === undefined ||
            item.price === undefined ||
            item.quantity === undefined
        ) {
            return {
                ok: false,
                message: `items[${i}] must include product_name, price, quantity`
            };
        }
        const price = Number(item.price);
        const quantity = Number(item.quantity);
        if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
            return {
                ok: false,
                message: `items[${i}] price and quantity must be numbers`
            };
        }
    }
    return { ok: true };
}

function calculateTotal(items) {
    return items.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
    }, 0);
}

async function ensureUserExists(userId) {
    const baseUrl = process.env.USER_SERVICE_URL;
    if (!baseUrl) {
        return { ok: false, error: "User service URL is not configured" };
    }
    try {
        await axios.get(`${baseUrl}/users/${userId}`);
        return { ok: true };
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return { ok: false, notFound: true };
        }
        return { ok: false, error: "User service unavailable" };
    }
}

async function ensureOrderExists(orderId) {
    const [orders] = await db.query("SELECT id FROM orders WHERE id = ?", [orderId]);
    if (orders.length === 0) {
        return { ok: false, notFound: true };
    }
    return { ok: true };
}

function buildPaymentUpdateFields(body) {
    const fields = [];
    const values = [];
    if (body.order_id !== undefined) {
        fields.push("order_id = ?");
        values.push(body.order_id);
    }
    if (body.payment_method !== undefined) {
        fields.push("payment_method = ?");
        values.push(body.payment_method);
    }
    if (body.amount !== undefined) {
        fields.push("amount = ?");
        values.push(body.amount);
    }
    if (body.status !== undefined) {
        fields.push("status = ?");
        values.push(body.status);
    }
    return { fields, values };
}

async function updateOrderById(id, body) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(
            "SELECT id FROM orders WHERE id = ?",
            [id]
        );

        if (orders.length === 0) {
            await connection.rollback();
            return { notFound: true };
        }

        if (body.user_id === null) {
            await connection.rollback();
            return { badRequest: "user_id cannot be null" };
        }

        const fields = [];
        const values = [];

        if (body.user_id !== undefined) {
            fields.push("user_id = ?");
            values.push(body.user_id);
        }

        if (body.status !== undefined) {
            fields.push("status = ?");
            values.push(body.status);
        }

        const itemsProvided = body.items !== undefined;
        if (itemsProvided) {
            const itemsCheck = validateItems(body.items);
            if (!itemsCheck.ok) {
                await connection.rollback();
                return { badRequest: itemsCheck.message };
            }
            const total = calculateTotal(body.items);
            fields.push("total_price = ?");
            values.push(total);
        }

        if (fields.length === 0) {
            await connection.rollback();
            return { badRequest: "No fields to update" };
        }

        const [updateResult] = await connection.query(
            `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            return { notFound: true };
        }

        if (itemsProvided) {
            await connection.query(
                "DELETE FROM order_items WHERE order_id = ?",
                [id]
            );

            for (let item of body.items) {
                await connection.query(
                    "INSERT INTO order_items (order_id, product_name, price, quantity) VALUES (?, ?, ?, ?)",
                    [id, item.product_name, item.price, item.quantity]
                );
            }
        }

        await connection.commit();

        return { ok: true };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}


app.get('/', (req, res) => {
  res.json({ message: 'Order service is running' });
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
        const { id, user_id, items, status } = req.body;

        if (isValidId(id)) {
            if (user_id !== undefined && user_id !== null) {
                const userCheck = await ensureUserExists(user_id);
                if (!userCheck.ok) {
                    if (userCheck.notFound) {
                        return res.status(400).json({ error: "User not found" });
                    }
                    return res.status(502).json({ error: userCheck.error });
                }
            }
            const result = await updateOrderById(id, { user_id, items, status });
            if (result.badRequest) {
                return res.status(400).json({ error: result.badRequest });
            }
            if (result.notFound) {
                return res.status(404).json({ message: "Order not found" });
            }
            return res.json({
                message: "Order updated",
                order_id: id
            });
        }

        if (user_id === undefined || user_id === null) {
            return res.status(400).json({ error: "Missing required field: user_id" });
        }

        const userCheck = await ensureUserExists(user_id);
        if (!userCheck.ok) {
            if (userCheck.notFound) {
                return res.status(400).json({ error: "User not found" });
            }
            return res.status(502).json({ error: userCheck.error });
        }

        const itemsCheck = validateItems(items);
        if (!itemsCheck.ok) {
            return res.status(400).json({ error: itemsCheck.message });
        }

        const total = calculateTotal(items);

        // tạo order
        const [result] = await db.query(
            "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
            [user_id, total, status ?? null]
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
// UPDATE ORDER
// =============================
app.put("/orders/:id", async (req, res) => {
    const { id } = req.params;
    const { user_id, items, status } = req.body;

    try {
        if (user_id !== undefined && user_id !== null) {
            const userCheck = await ensureUserExists(user_id);
            if (!userCheck.ok) {
                if (userCheck.notFound) {
                    return res.status(400).json({ error: "User not found" });
                }
                return res.status(502).json({ error: userCheck.error });
            }
        }
        const result = await updateOrderById(id, { user_id, items, status });
        if (result.badRequest) {
            return res.status(400).json({ error: result.badRequest });
        }
        if (result.notFound) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============================
// DELETE ORDER
// =============================
app.delete("/orders/:id", async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            "DELETE FROM order_items WHERE order_id = ?",
            [id]
        );

        const [result] = await connection.query(
            "DELETE FROM orders WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Order not found" });
        }

        await connection.commit();

        res.json({ message: "Order deleted" });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// =============================
// PAYMENTS
// =============================
app.get("/payments", async (req, res) => {
    try {
        const [payments] = await db.query("SELECT * FROM payments");
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/payments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [payments] = await db.query("SELECT * FROM payments WHERE id = ?", [id]);
        if (payments.length === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json(payments[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/payments", async (req, res) => {
    try {
        const { id, order_id, payment_method, amount, status } = req.body;

        if (isValidId(id)) {
            if (order_id === null) {
                return res.status(400).json({ error: "order_id cannot be null" });
            }
            if (amount !== undefined && !isValidNumber(amount)) {
                return res.status(400).json({ error: "amount must be a number" });
            }
            if (order_id !== undefined) {
                const orderCheck = await ensureOrderExists(order_id);
                if (!orderCheck.ok) {
                    return res.status(400).json({ error: "Order not found" });
                }
            }
            const { fields, values } = buildPaymentUpdateFields(req.body);
            if (fields.length === 0) {
                return res.status(400).json({ error: "No fields to update" });
            }
            const [result] = await db.query(
                `UPDATE payments SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Payment not found" });
            }
            return res.json({ message: "Payment updated", payment_id: id });
        }

        if (order_id === undefined || order_id === null) {
            return res.status(400).json({ error: "Missing required field: order_id" });
        }
        if (amount !== undefined && !isValidNumber(amount)) {
            return res.status(400).json({ error: "amount must be a number" });
        }

        const orderCheck = await ensureOrderExists(order_id);
        if (!orderCheck.ok) {
            return res.status(400).json({ error: "Order not found" });
        }

        const [result] = await db.query(
            "INSERT INTO payments (order_id, payment_method, amount, status) VALUES (?, ?, ?, ?)",
            [order_id, payment_method ?? null, amount ?? null, status ?? null]
        );

        res.status(201).json({ message: "Payment created", payment_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/payments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { order_id, amount } = req.body;

        if (order_id === null) {
            return res.status(400).json({ error: "order_id cannot be null" });
        }
        if (amount !== undefined && !isValidNumber(amount)) {
            return res.status(400).json({ error: "amount must be a number" });
        }
        if (order_id !== undefined) {
            const orderCheck = await ensureOrderExists(order_id);
            if (!orderCheck.ok) {
                return res.status(400).json({ error: "Order not found" });
            }
        }

        const { fields, values } = buildPaymentUpdateFields(req.body);
        if (fields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }
        const [result] = await db.query(
            `UPDATE payments SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({ message: "Payment updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/payments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM payments WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.json({ message: "Payment deleted" });
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