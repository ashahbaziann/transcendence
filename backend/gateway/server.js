const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const clientProm = require('prom-client');
const cors = require('cors');

const app = express();
const PORT = 3005;

const register = new clientProm.Registry();
clientProm.collectDefaultMetrics({ register });


app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:8443', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.end('Gateway is running');
});

app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});


app.use('/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[PROXY] ${req.method} ${req.url} → ${proxyReq.path}`);
    },
    error: (err, req, res) => {
      console.log(`[PROXY ERROR] ${err.message}`);
      res.status(502).json({ error: 'Proxy error' });
    }
  }
}));

app.use('/api/user', createProxyMiddleware({
  target: 'http://user-service:3000',
  changeOrigin: true,
  pathRewrite: {'^/api/user': ''}
}));

app.use('/api/game', createProxyMiddleware({
  target: 'http://game-service:3000',
  changeOrigin: true,
  pathRewrite: {'^/api/game': ''}
}));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway running on port ${PORT}`);
});