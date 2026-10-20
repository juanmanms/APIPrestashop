const express = require('express');
const router = express.Router();

const { getRepartos, updateActiveDay, getCarrier, updateEndTime, updateStartTime } = require('../services/repartoService');

router.get('/', async (req, res) => {
    console.log("Obteniendo días derepartos");
    try {
        const orders = await getRepartos();
        res.json(orders);
    } catch (error) {
        if (error && error.code === 'ER_NO_SUCH_TABLE') {
            console.warn('No existe la tabla de días de reparto; se devuelve una lista vacía.');
            return res.json([]);
        }

        console.error('Error obteniendo días de reparto:', error);
        return res.status(500).json({ message: 'No se pudieron obtener los días de reparto.' });
    }
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
