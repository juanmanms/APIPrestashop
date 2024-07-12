// routes/products.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getSellers, getSellerById, getSellerProducts, getSellerActiveProducts } = require('../services/sellersService');
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
    const seller = await getSellerById(id);
    res.json(seller);
});

router.get('/products', async (req, res) => {
    const id = getIdFromToken(req);
    const sellerProducts = await getSellerProducts(id);
    res.json(sellerProducts);
});


router.get('/products/:active', async (req, res) => {
    const { active } = req.params;
    const id = getIdFromToken(req);
    const sellerProducts = await getSellerActiveProducts(id, active);
    res.json(sellerProducts);
});



module.exports = router;