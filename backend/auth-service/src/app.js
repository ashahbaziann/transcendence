const express = require('express');
const client = require('prom-client');
const authRoutes = require('./routes/auth.routes');
const passport = require('./config/passport');

function buildApp() {
  const app = express();

  // === Метрики (Prometheus) ===
  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  // === Middleware ===
  app.use(express.json());
   app.use(passport.initialize());

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
  app.use('/', authRoutes);

  // === 404 ===
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

module.exports = buildApp;