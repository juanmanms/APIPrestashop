const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Configuración de multer para guardar temporalmente la imagen subida
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../../uploads/');
        fs.mkdirSync(dir, { recursive: true }); // Crea la carpeta si no existe
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        // Guardar con nombre temporal único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Ruta para subir/sustituir imagen de categoría usando el Webservice de PrestaShop
router.post('/upload-image', upload.single('image'), async (req, res) => {
    const { id_category } = req.body;
    if (!id_category || !req.file) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Faltan datos o imagen' });
    }
    try {
        await uploadCategoryImage(id_category, req.file.path);
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Imagen de categoría actualizada correctamente' });
    } catch (error) {
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
        return res.status(500).json({
            error: 'Error al subir la imagen a PrestaShop',
            detalle: error.message || error,
            prestashop: error
        });
    }
});

async function uploadCategoryImage(categoryId, imagePath) {
    const url = `https://botiga.${process.env.Server}/api/images/categories/${categoryId}/?ps_method=PUT`;
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
        const response = await axios.post(url, form, {
            headers: {
                ...form.getHeaders()
            },
            auth: {
                username: process.env.WebServiceKey,
                password: ''
            }
        });
        return response.data;
    } catch (error) {
        // Mostrar el error detallado de PrestaShop si existe
        throw error.response?.data || error;
    }
}

module.exports = router;