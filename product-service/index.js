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

function buildProductUpdateFields(body) {
    const fields = [];
    const values = [];
    if (body.category_id !== undefined) {
        fields.push("category_id = ?");
        values.push(body.category_id);
    }
    if (body.name !== undefined) {
        fields.push("name = ?");
        values.push(body.name);
    }
    if (body.description !== undefined) {
        fields.push("description = ?");
        values.push(body.description);
    }
    if (body.price !== undefined) {
        fields.push("price = ?");
        values.push(body.price);
    }
    if (body.cost !== undefined) {
        fields.push("cost = ?");
        values.push(body.cost);
    }
    if (body.stock !== undefined) {
        fields.push("stock = ?");
        values.push(body.stock);
    }
    if (body.min_stock !== undefined) {
        fields.push("min_stock = ?");
        values.push(body.min_stock);
    }
    if (body.sku !== undefined) {
        fields.push("sku = ?");
        values.push(body.sku);
    }
    if (body.image_url !== undefined) {
        fields.push("image_url = ?");
        values.push(body.image_url);
    }
    if (body.status !== undefined) {
        fields.push("status = ?");
        values.push(body.status);
    }
    return { fields, values };
}

function findNullField(body, fields) {
    return fields.find((field) => Object.prototype.hasOwnProperty.call(body, field) && body[field] === null);
}

function isValidId(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

function isValidNumber(value) {
    return Number.isFinite(Number(value));
}

function isValidRating(value) {
    const rating = Number(value);
    return Number.isFinite(rating) && rating >= 1 && rating <= 5;
}

function buildCategoryUpdateFields(body) {
    const fields = [];
    const values = [];
    if (body.name !== undefined) {
        fields.push("name = ?");
        values.push(body.name);
    }
    if (body.description !== undefined) {
        fields.push("description = ?");
        values.push(body.description);
    }
    return { fields, values };
}

function buildReviewUpdateFields(body) {
    const fields = [];
    const values = [];
    if (body.product_id !== undefined) {
        fields.push("product_id = ?");
        values.push(body.product_id);
    }
    if (body.user_id !== undefined) {
        fields.push("user_id = ?");
        values.push(body.user_id);
    }
    if (body.rating !== undefined) {
        fields.push("rating = ?");
        values.push(body.rating);
    }
    if (body.comment !== undefined) {
        fields.push("comment = ?");
        values.push(body.comment);
    }
    return { fields, values };
}

function buildInventoryUpdateFields(body) {
    const fields = [];
    const values = [];
    if (body.product_id !== undefined) {
        fields.push("product_id = ?");
        values.push(body.product_id);
    }
    if (body.quantity_change !== undefined) {
        fields.push("quantity_change = ?");
        values.push(body.quantity_change);
    }
    if (body.transaction_type !== undefined) {
        fields.push("transaction_type = ?");
        values.push(body.transaction_type);
    }
    if (body.notes !== undefined) {
        fields.push("notes = ?");
        values.push(body.notes);
    }
    return { fields, values };
}

function handleDbError(res, err, duplicateMessage = "Duplicate entry") {
    if (err && err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: duplicateMessage });
    }
    if (err && (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW")) {
        return res.status(400).json({ error: "Related record not found" });
    }
    return res.status(500).json({ error: err.message });
}

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
        return handleDbError(res, err, "SKU already exists");
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
        return handleDbError(res, err, "SKU already exists");
    }
});

// Thêm sản phẩm mới vào kho
app.post("/products", async (req, res) => {
    try {
        const {
            id,
            category_id,
            name,
            description,
            price,
            cost,
            stock,
            min_stock,
            sku,
            image_url,
            status
        } = req.body;

        const nullField = findNullField(req.body, ["category_id", "name", "price", "stock"]);
        if (nullField) {
            return res.status(400).json({
                message: `${nullField} cannot be null`
            });
        }

        if (id !== undefined && id !== null && String(id).trim() !== "") {
            const { fields, values } = buildProductUpdateFields(req.body);
            if (fields.length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }

            const [result] = await db.query(
                `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Product not found" });
            }

            return res.json({ message: "Product updated successfully" });
        }

        if (category_id === undefined || category_id === null || name === undefined || name === null || price === undefined || price === null) {
            return res.status(400).json({
                message: "Missing required fields: category_id, name, price"
            });
        }

        const stockValue = stock === undefined || stock === null ? 0 : stock;

        const [result] = await db.query(
            "INSERT INTO products (category_id, name, description, price, cost, stock, min_stock, sku, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                category_id,
                name,
                description ?? null,
                price,
                cost ?? null,
                stockValue,
                min_stock ?? null,
                sku ?? null,
                image_url ?? null,
                status ?? null
            ]
        );

        res.status(201).json({
            message: "Product created successfully",
            product_id: result.insertId
        });
    } catch (err) {
        return handleDbError(res, err);
    }
});

// Cập nhật thông tin sản phẩm
app.put("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const nullField = findNullField(req.body, ["category_id", "name", "price", "stock"]);
        if (nullField) {
            return res.status(400).json({
                message: `${nullField} cannot be null`
            });
        }
        const { fields, values } = buildProductUpdateFields(req.body);

        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const [result] = await db.query(
            `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

// Xóa sản phẩm
app.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

// Categories
app.get("/categories", async (req, res) => {
    try {
        const [categories] = await db.query("SELECT * FROM categories");
        res.json(categories);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.get("/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
        if (categories.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(categories[0]);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.post("/categories", async (req, res) => {
    try {
        const { id, name, description } = req.body;

        if (isValidId(id)) {
            if (name === null) {
                return res.status(400).json({ message: "name cannot be null" });
            }
            const { fields, values } = buildCategoryUpdateFields(req.body);
            if (fields.length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }
            const [result] = await db.query(
                `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Category not found" });
            }
            return res.json({ message: "Category updated" });
        }

        if (name === undefined || name === null) {
            return res.status(400).json({ message: "Missing required field: name" });
        }

        const [result] = await db.query(
            "INSERT INTO categories (name, description) VALUES (?, ?)",
            [name, description ?? null]
        );

        res.status(201).json({ message: "Category created", category_id: result.insertId });
    } catch (err) {
        return handleDbError(res, err, "Category already exists");
    }
});

app.put("/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.name === null) {
            return res.status(400).json({ message: "name cannot be null" });
        }
        const { fields, values } = buildCategoryUpdateFields(req.body);
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const [result] = await db.query(
            `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category updated" });
    } catch (err) {
        return handleDbError(res, err, "Category already exists");
    }
});

app.delete("/categories/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json({ message: "Category deleted" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

// Product reviews
app.get("/product-reviews", async (req, res) => {
    try {
        const [reviews] = await db.query("SELECT * FROM product_reviews");
        res.json(reviews);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.get("/product-reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [reviews] = await db.query("SELECT * FROM product_reviews WHERE id = ?", [id]);
        if (reviews.length === 0) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json(reviews[0]);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.post("/product-reviews", async (req, res) => {
    try {
        const { id, product_id, user_id, rating, comment } = req.body;

        if (isValidId(id)) {
            if (product_id === null || user_id === null) {
                return res.status(400).json({ message: "product_id and user_id cannot be null" });
            }
            if (rating !== undefined && !isValidRating(rating)) {
                return res.status(400).json({ message: "rating must be between 1 and 5" });
            }
            const { fields, values } = buildReviewUpdateFields(req.body);
            if (fields.length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }
            const [result] = await db.query(
                `UPDATE product_reviews SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Review not found" });
            }
            return res.json({ message: "Review updated" });
        }

        if (product_id === undefined || product_id === null || user_id === undefined || user_id === null || rating === undefined || rating === null) {
            return res.status(400).json({ message: "Missing required fields: product_id, user_id, rating" });
        }
        if (!isValidRating(rating)) {
            return res.status(400).json({ message: "rating must be between 1 and 5" });
        }

        const [result] = await db.query(
            "INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
            [product_id, user_id, rating, comment ?? null]
        );

        res.status(201).json({ message: "Review created", review_id: result.insertId });
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.put("/product-reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.product_id === null || req.body.user_id === null) {
            return res.status(400).json({ message: "product_id and user_id cannot be null" });
        }
        if (req.body.rating !== undefined && !isValidRating(req.body.rating)) {
            return res.status(400).json({ message: "rating must be between 1 and 5" });
        }
        const { fields, values } = buildReviewUpdateFields(req.body);
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const [result] = await db.query(
            `UPDATE product_reviews SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json({ message: "Review updated" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.delete("/product-reviews/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM product_reviews WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json({ message: "Review deleted" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

// Product inventory
app.get("/product-inventory", async (req, res) => {
    try {
        const [inventory] = await db.query("SELECT * FROM product_inventory");
        res.json(inventory);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.get("/product-inventory/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [inventory] = await db.query("SELECT * FROM product_inventory WHERE id = ?", [id]);
        if (inventory.length === 0) {
            return res.status(404).json({ message: "Inventory record not found" });
        }
        res.json(inventory[0]);
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.post("/product-inventory", async (req, res) => {
    try {
        const { id, product_id, quantity_change, transaction_type, notes } = req.body;

        if (isValidId(id)) {
            if (product_id === null || quantity_change === null || transaction_type === null) {
                return res.status(400).json({ message: "product_id, quantity_change, transaction_type cannot be null" });
            }
            if (quantity_change !== undefined && !isValidNumber(quantity_change)) {
                return res.status(400).json({ message: "quantity_change must be a number" });
            }
            const { fields, values } = buildInventoryUpdateFields(req.body);
            if (fields.length === 0) {
                return res.status(400).json({ message: "No fields to update" });
            }
            const [result] = await db.query(
                `UPDATE product_inventory SET ${fields.join(", ")} WHERE id = ?`,
                [...values, id]
            );
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Inventory record not found" });
            }
            return res.json({ message: "Inventory updated" });
        }

        if (product_id === undefined || product_id === null || quantity_change === undefined || quantity_change === null || transaction_type === undefined || transaction_type === null) {
            return res.status(400).json({ message: "Missing required fields: product_id, quantity_change, transaction_type" });
        }
        if (!isValidNumber(quantity_change)) {
            return res.status(400).json({ message: "quantity_change must be a number" });
        }

        const [result] = await db.query(
            "INSERT INTO product_inventory (product_id, quantity_change, transaction_type, notes) VALUES (?, ?, ?, ?)",
            [product_id, quantity_change, transaction_type, notes ?? null]
        );

        res.status(201).json({ message: "Inventory created", inventory_id: result.insertId });
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.put("/product-inventory/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (req.body.product_id === null || req.body.quantity_change === null || req.body.transaction_type === null) {
            return res.status(400).json({ message: "product_id, quantity_change, transaction_type cannot be null" });
        }
        if (req.body.quantity_change !== undefined && !isValidNumber(req.body.quantity_change)) {
            return res.status(400).json({ message: "quantity_change must be a number" });
        }
        const { fields, values } = buildInventoryUpdateFields(req.body);
        if (fields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        const [result] = await db.query(
            `UPDATE product_inventory SET ${fields.join(", ")} WHERE id = ?`,
            [...values, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Inventory record not found" });
        }
        res.json({ message: "Inventory updated" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

app.delete("/product-inventory/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM product_inventory WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Inventory record not found" });
        }
        res.json({ message: "Inventory deleted" });
    } catch (err) {
        return handleDbError(res, err);
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
