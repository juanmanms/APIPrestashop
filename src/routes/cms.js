const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
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
    console.log('Tipo', req.tipo)
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
router.post('/images', upload.single('image'), async (req, res) => {
    console.log('Añadiendo imagen a CMS');
    console.log('Request URL:', req.originalUrl);
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { filename } = req.body;
        // Opcional: puedes mover/renombrar el archivo usando fs si lo necesitas
        // fs.renameSync(req.file.path, `uploads/${filename}`);
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

// Actualizar imagen
router.put('/images', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.body.filename) {
            return res.status(400).json({ error: 'No file or filename provided' });
        }
        const result = await updateImage(req.file, req.body.filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la imagen', details: error.message });
    }
});

router.delete('/images/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const result = await deleteImage(filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la imagen', details: error.message });
    }
}
);


module.exports = router;