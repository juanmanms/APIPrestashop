const express = require('express');
const router = express.Router();

const { getRepartos, updateActiveDay } = require('../services/repartoService');

router.get('/', async (req, res) => {
    console.log("Obteniendo días derepartos");
    const orders = await getRepartos();
    res.json(orders);
});

router.put('/activo/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Actualizando día de reparto");
    await updateActiveDay(id);
    res.json("Día de reparto actualizado");
});




module.exports = router;
