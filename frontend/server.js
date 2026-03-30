const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Frontend running!</h1><p>Welcome to Transcendence!</p>');
});

app.listen(PORT, '0.0.0.0', () => console.log(`Frontend running on ${PORT}`));