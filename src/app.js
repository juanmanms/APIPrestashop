const express = require('express');
const app = express();
const cors = require('cors');

const productRoutes = require('./routes/products');
const sellerRoutes = require('./routes/sellers');
const authRoutes = require('./routes/auth');
const attributeRoutes = require('./routes/attributes');

app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:5173', [/^https:\/\/torreblanca-front\.vercel\.app/], [/^https:\/\/fontetes-front\.vercel\.app/]],
    optionsSuccessStatus: 200
};

//autorizar cors
app.use(cors(corsOptions));

// const categoryRoutes = require('./routes/categories');

app.use('/products', productRoutes);
app.use('/attributes', attributeRoutes);
app.use('/sellers', sellerRoutes);
app.use('/auth', authRoutes);
// app.use('/categories', categoryRoutes);

//un mensaje de bienvenida en la ruta /
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});