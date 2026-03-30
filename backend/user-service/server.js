const express = require('express');
const { Client } = require('pg');

const app = express();
app.use(express.json());

const PORT = 3000;

const client = require('prom-client');

// Create a default registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Postgres client
const client = new Client({
  host: 'postgres',        // service name in docker-compose
  user: 'user',
  password: 'pass',
  database: 'transcendence',
  port: 5432
});

// Connect to DB (just once)
client.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB connection error:", err));

// Create users table if it doesn't exist
client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT
  )
`).catch(err => console.error(err));

// Add user endpoint
app.post('/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Missing fields" });

  try {
    await client.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)',
      [username, email, password]
    );
    res.json({ message: "User added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all users
app.get('/users', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple health check
app.get('/health', (req, res) => res.json({ status: "running" }));

app.listen(PORT, '0.0.0.0', () => console.log(`User service running on port ${PORT}`));