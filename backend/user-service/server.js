const express = require('express');
const { Pool } = require('pg');
const clientProm = require('prom-client');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = 'user-service';
const JWT_SECRET = process.env.JWT_SECRET;

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
    avatar TEXT DEFAULT NULL,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log("DB connected and table ready"))
  .catch(err => console.error("DB error:", err));

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

// 404
app.use((req, res) => res.status(404).send());

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
});
