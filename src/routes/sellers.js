// routes/products.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getSellers, getSellerById, getSellerProducts, getSellerActiveProducts, getFamilysSeller, updateParadaInfo } = require('../services/sellersService');
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

router.get('/all', async (req, res) => {
    const sellers = await getSellers();
    res.json(sellers);
});

router.get('/familys', async (req, res) => {
    console.log("obteniendo familias")
    const id = getIdFromToken(req);
    const familys = await getFamilysSeller(id);
    res.json(familys);
});

router.put('/category-info', async (req, res) => {
    const { id, description, keywords, telefono, whatsapp, facebook, instagram } = req.body;
    console.log("Actualizando info de la categoria: ", id);
    await updateParadaInfo(id, description, keywords, telefono, whatsapp, facebook, instagram);
    res.json(
        {
            message: "Información de la categoría actualizada correctamente",
            status: "success"
        }
    )
});



module.exports = router;