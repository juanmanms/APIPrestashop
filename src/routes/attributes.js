const express = require('express');
const router = express.Router();

const { getAttributes, getAttributesGrouop, getRepartos } = require('../services/attributeService');

router.get('/', async (req, res) => {
    console.log("Obteniendo atributos");
    const attributes = await getAttributes();
    res.json(attributes);
});

router.get('/group', async (req, res) => {
    console.log("Obteniendo atributos agrupados");
    const attributes = await getAttributesGrouop();
    res.json(attributes);
});

router.get('/prueba', async (req, res) => {
    console.log("prueba");
    //res.json({ message: 'prueba' });
    const orders = await getRepartos();
    res.json(orders);
});

module.exports = router;
