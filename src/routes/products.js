// routes/products.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { updateProductPrice, getProductsBySeller } = require('../services/productService');

const verifyToken = require('../middleware/middleware');

router.use(verifyToken);
const getIdFromToken = (req) => {
    const token = req.headers['authorization'];
    const decoded = jwt.verify(token, process.env.cookie_key);
    return decoded.id;
};

router.use((req, res, next) => {
    req.userId = getIdFromToken(req);
    next();
});

router.get('/', async (req, res) => {
    const id = getIdFromToken(req);
    console.log(id);
    const sellerProducts = await getProductsBySeller(id);
    res.json(sellerProducts);
});

router.put('/', async (req, res) => {
    const { id, price } = req.body;
    console.log(id, price);
    await updateProductPrice(id, price);
    res.json({ message: 'Product updated' });
});

module.exports = router;