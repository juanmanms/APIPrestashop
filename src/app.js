const express = require('express');
const app = express();
const cors = require('cors');

const productRoutes = require('./routes/products');
const sellerRoutes = require('./routes/sellers');
const authRoutes = require('./routes/auth');
const attributeRoutes = require('./routes/attributes');
const ordersRoutes = require('./routes/orders');
const clientRoutes = require('./routes/clients')
const repartoRoutes = require('./routes/repartos');
const utilidadesRoutes = require('./routes/utilidades');
const categoryRoutes = require('./routes/categories');
const zipCodeZoneRoutes = require('./routes/zipCodeZone');
const cmsRoutes = require('./routes/cms');

app.use(express.json());

const allowedOrigins = [
    'http://localhost:5173',
    'https://torreblanca-front.vercel.app',
    'https://fontetes-front.vercel.app',
    'https://serraparera-front.vercel.app',
    'https://serraperera-front.vercel.app',
    'https://santjordi-front.vercel.app',
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};

//autorizar cors
app.use(cors(corsOptions));

// const categoryRoutes = require('./routes/categories');

app.use('/products', productRoutes);
app.use('/attributes', attributeRoutes);
app.use('/sellers', sellerRoutes);
app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);
app.use('/clients', clientRoutes);
app.use('/repartos', repartoRoutes);
app.use('/utiles', utilidadesRoutes);
app.use('/categories', categoryRoutes);
app.use('/cp', zipCodeZoneRoutes);
app.use('/cms', cmsRoutes);
//app.use('/img/c', express.static('https://botiga.' + process.env.Server + '/img/c/')); // Servir imágenes de categorías


//un mensaje de bienvenida en la ruta /
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});