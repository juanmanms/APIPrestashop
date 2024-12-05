const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { getProductComandaBySeller, createPsCart, getPedidos, cancelOrder, getRepartos, getPedidosReparto, getCienPedidosHistoria } = require('../services/ordersService');

const verifyToken = require('../middleware/middleware');

router.use(verifyToken);
const getIdFromToken = (req) => {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.cookie_key);
    return decoded.id;
};


router.use((req, res, next) => {
    //req.userId = getIdFromToken(req);
    const token = req.headers['authorization'];
    if (token.startsWith('eyJ')) {
        const decoded = jwt.verify(token, process.env.cookie_key);
        req.userId = decoded.id;
    } else {
        req.userId = null;
    }
    next();
});


router.get('/', (req, res) => {
    res.send('Welcome to the APIs');
});

router.get('/comanda', async (req, res) => {
    const id = getIdFromToken(req);
    const comanda = await getProductComandaBySeller(id);
    res.json(comanda[0].id_product);
});

router.post('/cart', async (req, res) => {
    const { id_customer, id_address, product, price, date, carrier } = req.body;
    try {
        const idOrder = await createPsCart(id_customer, carrier, id_address, product, price, date);
        console.log(idOrder)
        res.json({ idOrder });
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/cancel', async (req, res) => {
    const { id_order } = req.body
    await cancelOrder(id_order)
    res.json("Pedido cancelado")
});

router.get('/orders', async (req, res) => {
    const id = getIdFromToken(req);
    const orders = await getPedidos(id);
    res.json(orders);
})

router.get('/reparto', async (req, res) => {
    const orders = await getRepartos()
    res.json(orders);
})

router.post('/reparto/pedidos', async (req, res) => {
    const { customer } = req.body
    const orders = await getPedidosReparto(customer)
    res.json(orders);
})

router.get('/historico', async (req, res) => {
    const orders = await getCienPedidosHistoria();
    res.json(orders);
})



module.exports = router;