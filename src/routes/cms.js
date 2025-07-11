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

module.exports = router;