const express = require('express');
const client = require('prom-client');
const authRoutes = require('./routes/auth.routes');
const passport = require('./config/passport');

function buildApp() {
  const app = express();

  const register = new client.Registry();
  client.collectDefaultMetrics({ register });

  app.use(express.json());
   app.use(passport.initialize());

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  });

  app.use('/', authRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}

module.exports = buildApp;