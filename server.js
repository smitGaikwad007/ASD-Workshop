const express = require('express');
const app = express();
const port = 3000;
const productRoutes = require('./routes/product.routes');

app.use(express.json());

app.use('/products', productRoutes);

app.listen(port, '127.0.0.1', () => {
  console.log(`Example app listening on 127.0.0.1:${port}`);
});
