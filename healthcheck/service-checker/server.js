const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 4000; 


const services = {
  "auth-service": "http://auth-service:3000/health",
  "user-service": "http://user-service:3000/health",
  "game-service": "http://game-service:3000/health",
  "gateway": "http://gateway:3005/health"
};

app.get('/', async (req, res) => {
  const status = {};

  await Promise.all(
    Object.entries(services).map(async ([name, url]) => {
      try {
        await axios.get(url);
        status[name] = "ok";
      } catch (err) {
        status[name] = "down";
      }
    })
  );

  res.json(status);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Service checker running on port ${PORT}`);
});