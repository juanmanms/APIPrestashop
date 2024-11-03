const express = require('express');
const router = express.Router();
const { sendMail } = require('../services/mailService');
// Ruta para enviar correo
router.post('/send', sendMail);
module.exports = router;