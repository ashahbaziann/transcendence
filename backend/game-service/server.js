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
  CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      player1 VARCHAR(50),
      player2 VARCHAR(50),
      status VARCHAR(20)
    );
`).catch(err => console.error(err));

// Add user endpoint
app.post('/games', async (req, res) => {
  const { player1, player2, status } = req.body;
  if (!player1 || !player2 || !status) return res.status(400).json({ error: "Missing fields" });

  try {
    await client.query(
      'INSERT INTO games (player1, player2, status) VALUES ($1, $2, $3)',
      [player1, player2, status]
    );
    res.json({ message: "Games added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET all games
app.get('/games', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM games ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simple health check
app.get('/health', (req, res) => res.json({ status: "running" }));

app.listen(PORT, '0.0.0.0', () => console.log(`Game service running on port ${PORT}`));