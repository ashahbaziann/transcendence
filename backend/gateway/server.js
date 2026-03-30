const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3005;

// Health
app.get('/health', (req, res) => {
  res.json({ status: "Gateway OK" });
});

// ✅ IMPORTANT: paths MUST be defined

app.use('/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '',   // 🔥 THIS IS THE FIX
  },
}));

app.use('/user', createProxyMiddleware({
  target: 'http://user-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/user': '' },
}));

app.use('/game', createProxyMiddleware({
  target: 'http://game-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/game': '' },
}));

app.use('/chat', createProxyMiddleware({
  target: 'http://chat-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/chat': '' },
}));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway running on port ${PORT}`);
});