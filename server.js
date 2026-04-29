const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3005;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`[GATEWAY] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.end('Gateway is running'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' }
}));

app.use('/api/user', createProxyMiddleware({
  target: 'http://user-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/api/user': '' }
}));

app.use('/api/game', createProxyMiddleware({
  target: 'http://game-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/api/game': '' }
}));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, '0.0.0.0', () => console.log(`Gateway running on port ${PORT}`));
