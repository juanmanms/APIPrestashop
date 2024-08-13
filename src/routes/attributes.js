const express = require('express');
const router = express.Router();

const { getAttributes } = require('../services/attributeService');

router.get('/', async (req, res) => {
    console.log("Obteniendo atributos");
    const attributes = await getAttributes();
    res.json(attributes);
});

module.exports = router;
