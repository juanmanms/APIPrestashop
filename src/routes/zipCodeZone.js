const express = require('express');
const router = express.Router();
const service = require('../services/zipCodeZoneService');
const { createZipCodeZone } = require('../services/zipCodeZoneService');
const { serializeBigInt } = require('../utils'); // Usa el helper que te pasé antes

// Obtener todos
router.get('/', async (req, res) => {
    const data = await service.getAllZipCodeZones();
    res.json(data);
});

// Obtener uno
router.get('/:id', async (req, res) => {
    const data = await service.getZipCodeZoneById(req.params.id);
    if (data) res.json(data);
    else res.status(404).json({ error: 'Not found' });
});

// Crear
router.post('/', async (req, res) => {
    try {
        const { min } = req.body.cp;
        const result = await createZipCodeZone(min);
        res.status(201).json(serializeBigInt(result));
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', detalle: error.message });
    }
});

// // Actualizar
// router.put('/:id', async (req, res) => {
//     const data = await service.updateZipCodeZone(req.params.id, req.body);
//     res.json(data);
// });

// Eliminar
router.delete('/:id', async (req, res) => {
    await service.deleteZipCodeZone(req.params.id);
    res.json({ deleted: true });
});

module.exports = router;