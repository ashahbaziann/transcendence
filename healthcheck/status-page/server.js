const express = require('express');
const axios = require('axios');
const app = express();

const PORT = 3000;
const SERVICE_CHECKER_URL = 'http://service-checker:4000'; 

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(SERVICE_CHECKER_URL);
    const services = response.data;

    let html = `<h1>Service Status</h1><ul>`;
    for (const [name, status] of Object.entries(services)) {
      const color = status === 'ok' ? 'green' : 'red';
      html += `<li><b>${name}:</b> <span style="color:${color}">${status}</span></li>`;
    }
    html += `</ul>`;
    res.send(html);
  } catch (err) {
    res.status(500).send('<h1>Cannot reach service-checker</h1>');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Status page running on port ${PORT}`);
});