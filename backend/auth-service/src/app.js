const express = require('express');
const client = require('prom-client');
const authRoutes = require('./routes/auth.routes');

function buildApp() {
  const app = express();

  // === Метрики (Prometheus) ===
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  // === Middleware ===
  app.use(express.json());

  // === Health check ===
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // === Метрики endpoint ===
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  // === Маршруты авторизации ===
  app.use('/auth', authRoutes);

  // === 404 ===
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

module.exports = buildApp;