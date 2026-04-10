console.log("MTASAAAAAV!");
const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;
const SERVICE_NAME = 'auth-service';

// Prometheus setup
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: `${SERVICE_NAME} running` });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send(`${SERVICE_NAME} is working!`);
});

//Inga's test
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({
    ok: true,
    service: "auth-service"
  });
});

app.post('/register', (req, res) => {
  res.json({
    ok: true,
    message: "registered (no DB yet)",
    data: req.body
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send();
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
});
