const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('../configuration/db');
const productRoutes = require('./routes/ProductRoutes');

const app = express();
app.use(bodyParser.json());
app.use('/products', productRoutes);

sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
});