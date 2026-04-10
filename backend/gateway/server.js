const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3005;

//for test endpoint
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// Root
app.get(['/', '/index.html'], (req, res) => {
  res.send('Gateway is running. Use /auth, /user, /game');
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy routes

// app.use('/auth', createProxyMiddleware({
//   target: 'http://auth-service:3000',
//   changeOrigin: true,
//   pathRewrite: { '^/auth': '' }
// }));

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


// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('Gateway running on port 3005');
});


/// Inga's test endpoint
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  }
  
}));

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Not Found');
});