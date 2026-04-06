const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3005;

// Root
app.get(['/', '/index.html'], (req, res) => {
  res.send('Gateway is running. Use /auth, /user, /game');
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy routes

app.use('/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }
}));

app.use('/user', createProxyMiddleware({
  target: 'http://user-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/user': '' }
}));

app.use('/game', createProxyMiddleware({
  target: 'http://game-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/game': '' }
}));

app.use('/status', createProxyMiddleware({
  target: 'http://status-page:3000',
  changeOrigin: true
}));

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Gateway running on port 3005');
});