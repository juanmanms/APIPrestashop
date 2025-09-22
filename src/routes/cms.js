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

router.get('/images/:tipo/:id', async (req, res) => {
    const { tipo, id } = req.params;
    const fullTipo = `${tipo}/${id}`;
    const images = await getImages(fullTipo);
    res.json(images);
});

router.get('/images/:tipo', async (req, res) => {
    const { tipo } = req.params;
    const images = await getImages(tipo);
    res.json(images);
});

//añadir imagen
router.post('/images/:tipo', upload.single('image'), async (req, res) => {
    const { tipo } = req.params;
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { filename } = req.body;
        // Opcional: puedes mover/renombrar el archivo usando fs si lo necesitas
        // fs.renameSync(req.file.path, `uploads/${filename}`);
        const result = await addImage(tipo, req.file, filename);
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
router.delete('/images/:tipo/:filename', async (req, res) => {
    try {
        const { tipo, filename } = req.params;
        const result = await deleteImage(tipo, filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la imagen', details: error.message });
    }
});


module.exports = router;