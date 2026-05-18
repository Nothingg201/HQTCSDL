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
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'user_db',
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

function buildUserUpdateFields(body) {
  const fields = [];
  const values = [];
  if (body.name !== undefined) {
    fields.push('name = ?');
    values.push(body.name);
  }
  if (body.email !== undefined) {
    fields.push('email = ?');
    values.push(body.email);
  }
  if (body.phone !== undefined) {
    fields.push('phone = ?');
    values.push(body.phone);
  }
  if (body.address !== undefined) {
    fields.push('address = ?');
    values.push(body.address);
  }
  if (body.city !== undefined) {
    fields.push('city = ?');
    values.push(body.city);
  }
  if (body.country !== undefined) {
    fields.push('country = ?');
    values.push(body.country);
  }
  return { fields, values };
}

function handleDbError(res, err, duplicateMessage = 'Duplicate entry') {
  if (err && err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: duplicateMessage });
  }
  if (err && (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW')) {
    return res.status(400).json({ error: 'Related record not found' });
  }
  console.error('DB ERROR:', err);
  return res.status(500).json({ error: 'Database error' });
}

function buildUserProfileUpdateFields(body) {
  const fields = [];
  const values = [];
  if (body.user_id !== undefined) {
    fields.push('user_id = ?');
    values.push(body.user_id);
  }
  if (body.bio !== undefined) {
    fields.push('bio = ?');
    values.push(body.bio);
  }
  if (body.avatar_url !== undefined) {
    fields.push('avatar_url = ?');
    values.push(body.avatar_url);
  }
  if (body.status !== undefined) {
    fields.push('status = ?');
    values.push(body.status);
  }
  return { fields, values };
}

// Route healthcheck
app.get('/', (req, res) => {
  res.json({ message: 'User service is running' });
});

// Lấy danh sách users
app.get('/users', (req, res) => {
  const sql = 'SELECT id, name, email, phone, address, city, country, created_at, updated_at FROM users';

  pool.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err);
    }
    res.json(results);
  });
});

// Lấy user theo id (optional, tiện sau này)
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT id, name, email, phone, address, city, country, created_at, updated_at FROM users WHERE id = ?';

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      return handleDbError(res, err);
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Tạo user mới
app.post('/users', (req, res) => {
  const { id, name, email, phone, address, city, country } = req.body;

  if (id !== undefined && id !== null && String(id).trim() !== '') {
    if (req.body.name === null || req.body.email === null) {
      return res.status(400).json({ error: 'name and email cannot be null' });
    }
    const { fields, values } = buildUserUpdateFields(req.body);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    pool.query(sql, values, (err, result) => {
      if (err) {
        return handleDbError(res, err, 'Email already exists');
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User updated' });
    });
    return;
  }

  if (name === undefined || name === null || email === undefined || email === null) {
    return res.status(400).json({ error: 'Missing required fields: name, email' });
  }

  const sql = 'INSERT INTO users (name, email, phone, address, city, country) VALUES (?, ?, ?, ?, ?, ?)';

  pool.query(sql, [name, email, phone ?? null, address ?? null, city ?? null, country ?? null], (err, result) => {
    if (err) {
      return handleDbError(res, err, 'Email already exists');
    }
    res.status(201).json({ message: 'User created', user_id: result.insertId });
  });
});

// Cập nhật user
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  if (req.body.name === null || req.body.email === null) {
    return res.status(400).json({ error: 'name and email cannot be null' });
  }
  const { fields, values } = buildUserUpdateFields(req.body);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  values.push(userId);

  pool.query(sql, values, (err, result) => {
    if (err) {
      return handleDbError(res, err, 'Email already exists');
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated' });
  });
});

// Xóa user
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE id = ?';

  pool.query(sql, [userId], (err, result) => {
    if (err) {
      return handleDbError(res, err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

// User profiles
app.get('/user-profiles', (req, res) => {
  const sql = 'SELECT * FROM user_profiles';

  pool.query(sql, (err, results) => {
    if (err) {
      return handleDbError(res, err);
    }
    res.json(results);
  });
});

app.get('/user-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const sql = 'SELECT * FROM user_profiles WHERE id = ?';

  pool.query(sql, [profileId], (err, results) => {
    if (err) {
      return handleDbError(res, err);
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(results[0]);
  });
});

app.get('/users/:id/profile', (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM user_profiles WHERE user_id = ?';

  pool.query(sql, [userId], (err, results) => {
    if (err) {
      return handleDbError(res, err);
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(results[0]);
  });
});

app.post('/user-profiles', (req, res) => {
  const { id, user_id, bio, avatar_url, status } = req.body;

  if (id !== undefined && id !== null && String(id).trim() !== '') {
    if (user_id === null) {
      return res.status(400).json({ error: 'user_id cannot be null' });
    }
    const { fields, values } = buildUserProfileUpdateFields(req.body);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const sql = `UPDATE user_profiles SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    pool.query(sql, values, (err, result) => {
      if (err) {
        return handleDbError(res, err, 'Profile already exists for user');
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json({ message: 'Profile updated' });
    });
    return;
  }

  if (user_id === undefined || user_id === null) {
    return res.status(400).json({ error: 'Missing required field: user_id' });
  }

  const statusValue = status === undefined ? 'active' : status;
  const sql = 'INSERT INTO user_profiles (user_id, bio, avatar_url, status) VALUES (?, ?, ?, ?)';

  pool.query(sql, [user_id, bio ?? null, avatar_url ?? null, statusValue ?? null], (err, result) => {
    if (err) {
      return handleDbError(res, err, 'Profile already exists for user');
    }
    res.status(201).json({ message: 'Profile created', profile_id: result.insertId });
  });
});

app.put('/user-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  if (req.body.user_id === null) {
    return res.status(400).json({ error: 'user_id cannot be null' });
  }
  const { fields, values } = buildUserProfileUpdateFields(req.body);
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const sql = `UPDATE user_profiles SET ${fields.join(', ')} WHERE id = ?`;
  values.push(profileId);

  pool.query(sql, values, (err, result) => {
    if (err) {
      return handleDbError(res, err, 'Profile already exists for user');
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile updated' });
  });
});

app.delete('/user-profiles/:id', (req, res) => {
  const profileId = req.params.id;
  const sql = 'DELETE FROM user_profiles WHERE id = ?';

  pool.query(sql, [profileId], (err, result) => {
    if (err) {
      return handleDbError(res, err);
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ message: 'Profile deleted' });
  });
});

// Cấu hình port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User service running at http://localhost:${PORT}`);
});