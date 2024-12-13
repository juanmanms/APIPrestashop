const express = require('express');
const router = express.Router();

const { getRepartos, updateActiveDay, getCarrier, updateEndTime, updateStartTime } = require('../services/repartoService');

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



router.get('/carrier', async (req, res) => {
    console.log("Obteniendo transportistas");
    const orders = await getCarrier();
    res.json(orders);
});

router.put('/update-time', async (req, res) => {
    const { id, tipo, hora } = req.body;
    console.log("Actualizando hora del dia: ", id, "para el tipo: ", tipo, "que sea la hora: ", hora);
    if (tipo === "start_time") {
        try {
            await updateStartTime(id, hora);
            res.json("Hora de inicio actualizada");
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        try {
            await updateEndTime(id, hora);
            res.json("Hora de fin actualizada");
        } catch (error) {
            res.status(500).json(error);
        }
    }
});




module.exports = router;
