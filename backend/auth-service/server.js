const http = require('http');
const PORT = 3000;


const client = require('prom-client');

// Create a default registry
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    // Change the message here:
    res.end(JSON.stringify({status: 'auth service running'}));
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Auth service is working!');
  return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, '0.0.0.0', () => console.log(`Auth service running on ${PORT}`));