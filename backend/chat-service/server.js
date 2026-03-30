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
  CREATE TABLE IF NOT EXISTS chats (
      id SERIAL PRIMARY KEY,
      from_user VARCHAR(50),
      to_user VARCHAR(50),
      message TEXT
    );
`).catch(err => console.error(err));

// Add user endpoint
app.post('/chats', async (req, res) => {
  const { from_user, to_user, message } = req.body;
  if (!from_user || !to_user || !message) return res.status(400).json({ error: "Missing fields" });

  try {
    await client.query(
      'INSERT INTO chats (from_user, to_user, message) VALUES ($1, $2, $3)',
      [from_user, to_user, message]
    );
    res.json({ message: "chats added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET all chats
app.get('/chats', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM chats ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Simple health check
app.get('/health', (req, res) => res.json({ status: "running" }));

app.listen(PORT, '0.0.0.0', () => console.log(`Game service running on port ${PORT}`));