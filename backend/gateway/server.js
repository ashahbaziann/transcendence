// const express = require('express');
// const { createProxyMiddleware } = require('http-proxy-middleware');

// const app = express();
// const PORT = 3005;

// const cors = require('cors');

// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));

// //app.options('*', cors());

// //---------------root--------------//

// app.get('/', (req, res) => {
//   res.end('Gateway is running')
// });

// // --------------------Health-----------------//

// app.get('/health', (req, res) => {
//   res.json({status: 'ok'});
// });

// // ----------------------Proxy routes-------------------//

// app.use('/api/auth', createProxyMiddleware({
//   target: 'http://auth-service:3000',
//   changeOrigin: true,
//   pathRewrite: { '^/api/auth': ''}
// }));

// app.use('/api/user', createProxyMiddleware({
//   target: 'http://user-service:3000',
//   changeOrigin: true,
//   pathRewrite: {'^/api/user': ''}
// }));


// app.use('/api/game', createProxyMiddleware({
//   target: 'http://game-service:3000',
//   changeOrigin: true,
//   pathRewrite: {'^/api/game': ''}
// }));

// //------------------------ Start server-----------------------//

// app.use((req, res) => 
// {
//   res.status(404).send('Not found');
// });

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Gateway running on port ${PORT}`);
// });


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

// Логирование всех запросов ← НОВАЯ СТРОКА!
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