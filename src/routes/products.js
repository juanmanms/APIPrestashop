// routes/products.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { updateProductPrice, getProductsBySeller, updateProductIVA, getCombinations, activeProduct, updateProductName, getProductsNoCombinations, createCombination, updateCombinationPrice, deleteCombination } = require('../services/productService');

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
    console.log("vendedor", id);
    const sellerProducts = await getProductsNoCombinations(id);
    res.json(sellerProducts);
});

router.put('/', async (req, res) => {
    const { id, price } = req.body;
    console.log("Producto ", id, "precio ", price);
    await updateProductPrice(id, price);
    res.json({ message: 'Product price updated' });
});

router.put('/iva', async (req, res) => {
    const { id, iva } = req.body;
    console.log("Producto ", id, "IVA ", iva);
    await updateProductIVA(id, iva);
    res.json({ message: 'IVA updated' });
});

router.get('/combinations', async (req, res) => {
    const id = getIdFromToken(req);
    console.log("combinaciones", id);
    const sellerProducts = await getCombinations(id);
    res.json(sellerProducts);
});

router.put('/active', async (req, res) => {
    const { id, active } = req.body;
    console.log("Producto ", id, "activo ", active);
    await activeProduct(id, active);
    res.json({ message: 'Product active updated' });
});

router.put('/name', async (req, res) => {
    const { id, name } = req.body;
    console.log("Producto ", id, "nombre ", name);
    await updateProductName(id, name);
    res.json({ message: 'Product name updated' });
});

router.post('/combinations/create', async (req, res) => {
    const { id, atributo } = req.body;
    try {
        const combination = await createCombination(id, atributo);
        console.log("combinacion", combination);
        res.json({ message: 'Combination created', combination });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'Duplicate entry for key product_default' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

router.put('/combinations/price', async (req, res) => {
    const { id, price } = req.body;
    console.log("Combinacion ", id, "precio ", price);
    try {
        await updateCombinationPrice(id, price);
        res.json({ message: 'Combination price updated' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/combinations/active', async (req, res) => {
    const { id, active } = req.body;
    console.log("Combinacion ", id, "activo ", active);
});

router.delete('/combinations', async (req, res) => {
    const { id } = req.body;
    try {
        await deleteCombination(id);
        res.json({ message: 'Combination deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }

});


module.exports = router;