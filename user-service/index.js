// index.js - User Service (Express + MySQL)

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'microservices_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối DB lúc khởi động
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Route healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'User service is running' });
});

// Lấy danh sách users
app.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email FROM users';

  pool.query(sql, (err, results) => {
    if (err) {
      console.error('DB ERROR:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Lấy user theo id (optional, tiện sau này)
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, name, email FROM users WHERE id = ?';

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB ERROR:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Cấu hình port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User service running at http://localhost:${PORT}`);
});