const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3005;

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

//app.options('*', cors());

//---------------root--------------//

app.get('/', (req, res) => {
  res.end('Gateway is running')
});

// --------------------Health-----------------//

app.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

// ----------------------Proxy routes-------------------//

app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:3000',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': ''}
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

//------------------------ Start server-----------------------//

app.use((req, res) => 
{
  res.status(404).send('Not found');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gateway running on port ${PORT}`);
});