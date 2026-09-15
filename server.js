require('dotenv').config();
const app = require('./src/app');

if (require.main === module) {
  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Blog-backend listening on port ${PORT}`);
  });
}

module.exports = app;
