const express = require('express');
const router = express.Router();
const {
    addImage,
    getImages,
    updateImage,
    deleteImage,
} = require('../services/cmsService');



// Obtener todos las imagenes de CMS

router.get('/images', async (req, res) => {
    console.log('Obteniendo imágenes de CMS');
    console.log('Request URL:', req.originalUrl);
    try {
        const images = await getImages();
        res.json(images);
    } catch (error) {
        console.error('Error al obtener las imágenes:', error);
        res.status(500).json({
            error: 'Error al obtener las imágenes',
            details: error.message,
            stack: error.stack
        });
    }
});

//añadir imagen
router.post('/images', async (req, res) => {
    console.log('Añadiendo imagen a CMS');
    console.log('Request URL:', req.originalUrl);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { filename } = req.body;
        const result = await addImage(req.file, filename);
        res.json(result);
    } catch (error) {
        console.error('Error al añadir la imagen:', error);
        res.status(500).json({
            error: 'Error al añadir la imagen',
            details: error.message,
            stack: error.stack
        });
    }
});


module.exports = router;