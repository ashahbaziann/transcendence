require('dotenv').config();
const buildApp = require('./src/app');

const PORT = process.env.PORT || 3000;

const app = buildApp();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Auth-service running on port ${PORT}`);
});