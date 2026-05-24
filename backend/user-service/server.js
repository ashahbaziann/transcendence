const express = require('express');
const { Pool } = require('pg');
const clientProm = require('prom-client');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = 'user-service';
const JWT_SECRET = process.env.JWT_SECRET;

const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:8443', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());


// Prometheus setup
const register = new clientProm.Registry();
clientProm.collectDefaultMetrics({ register });

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create users table if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/identicon/svg?seed=default',
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    online BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log("DB connected and table ready"))
  .catch(err => console.error("DB error:", err));



pool.query(`
  CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
  )
`).catch(err => console.error("Friends table error:", err));


// JWT Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}



const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = '/app/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only images allowed'));
  }
});

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/identicon/svg?seed=default';

// Routes

// Health
app.get('/health', (req, res) => {
  res.json({ status: `${SERVICE_NAME} running` });
});

// Metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// POST /users - create user profile (called by auth-service after register)
app.post('/users', async (req, res) => {
  try {
    const { user_id, username, email } = req.body;
    if (!user_id || !username || !email)
      return res.status(400).json({ error: 'Missing fields' });
    const result = await pool.query(
      'INSERT INTO users (user_id, username, email) VALUES ($1, $2, $3) RETURNING *',
      [user_id, username, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users - get all users (protected)
app.get('/users', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, user_id, username, email, avatar, wins, losses, draws, created_at FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id - get user by user_id (protected)
app.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, user_id, username, email, avatar, wins, losses, draws, created_at FROM users WHERE user_id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /users/status - update online status (internal only)
app.put('/users/status', async (req, res) => {
  try {
    const { user_id, online } = req.body;
    await pool.query(
      'UPDATE users SET online = $1 WHERE user_id = $2',
      [online, user_id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /users/:id - update profile (protected, own profile only)
app.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== parseInt(req.params.id))
      return res.status(403).json({ error: 'Forbidden' });
    const { username, avatar } = req.body;
    const result = await pool.query(
      'UPDATE users SET username = COALESCE($1, username), avatar = COALESCE($2, avatar) WHERE user_id = $3 RETURNING *',
      [username, avatar, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id/stats - get game stats (protected)
app.get('/users/:id/stats', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT username, wins, losses, draws FROM users WHERE user_id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users/:id/avatar - upload avatar
app.post('/users/:id/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.userId !== parseInt(req.params.id))
      return res.status(403).json({ error: 'Forbidden' });
    if (!req.file)
      return res.status(400).json({ error: 'No file uploaded' });
    const avatarUrl = `/avatars/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE users SET avatar = $1 WHERE user_id = $2 RETURNING *',
      [avatarUrl, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded avatars
app.use('/avatars', express.static('/app/uploads'));



// POST /users/:id/friends/:friendId - add friend
app.post('/users/:id/friends/:friendId', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== parseInt(req.params.id))
      return res.status(403).json({ error: 'Forbidden' });
    if (req.params.id === req.params.friendId)
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    const friend = await pool.query('SELECT * FROM users WHERE user_id = $1', [req.params.friendId]);
    if (friend.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    await pool.query(
      'INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)',
      [req.params.id, req.params.friendId]
    );
    res.status(201).json({ message: 'Friend added' });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'Already friends' });
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:id/friends - get friend list
app.get('/users/:id/friends', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.username, u.avatar, u.online
      FROM friends f
      JOIN users u ON u.user_id = f.friend_id
      WHERE f.user_id = $1
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:id/friends/:friendId - remove friend
app.delete('/users/:id/friends/:friendId', authMiddleware, async (req, res) => {
  try {
    if (req.user.userId !== parseInt(req.params.id))
      return res.status(403).json({ error: 'Forbidden' });
    await pool.query(
      'DELETE FROM friends WHERE user_id = $1 AND friend_id = $2',
      [req.params.id, req.params.friendId]
    );
    res.json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /users/stats/internal - called by game-service after match
app.put('/users/stats/internal', async (req, res) => {
  try {
    const { user_id, column } = req.body;
    if (!['wins', 'losses', 'draws'].includes(column))
      return res.status(400).json({ error: 'Invalid column' });
    await pool.query(
      `UPDATE users SET ${column} = ${column} + 1 WHERE user_id = $1`,
      [user_id]
    );
    res.json({ message: 'Stats updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => res.status(404).send());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
});
