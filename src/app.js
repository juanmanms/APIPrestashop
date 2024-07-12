const express = require('express');
const app = express();
const cors = require('cors');

const productRoutes = require('./routes/products');
const sellerRoutes = require('./routes/sellers');
const authRoutes = require('./routes/auth');

app.use(express.json());

//autorizar cors
app.use(cors());

// const categoryRoutes = require('./routes/categories');

app.use('/products', productRoutes);
app.use('/sellers', sellerRoutes);
app.use('/auth', authRoutes);
// app.use('/categories', categoryRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});