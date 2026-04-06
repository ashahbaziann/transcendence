const express = require('express');
const { Client } = require('pg');
const clientProm = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = 'user-service';

// Middleware to parse JSON
app.use(express.json());

// Prometheus setup
const register = new clientProm.Registry();
clientProm.collectDefaultMetrics({ register });

// PostgreSQL client
const client = new Client({
  host: 'postgres',
  user: 'user',
  password: 'pass',
  database: 'transcendence',
  port: 5432
});

client.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB connection error:", err));

// Create users table if not exists
client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT
  )
`).catch(err => console.error(err));


// Routes

// Health
app.get('/health', (req, res) => {
  res.json({ status: `${SERVICE_NAME} running` });
});

// Root
app.get('/', (req, res) => {
  res.send(`${SERVICE_NAME} is working!`);
});

// Metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// POST /users
app.post('/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, password]
    );

    res.json({ message: "User added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users
app.get('/users', async (req, res) => {
  try {
    const result = await client.query(
      'SELECT * FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send();
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
});