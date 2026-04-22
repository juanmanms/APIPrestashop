const express = require('express');
const router = express.Router();
const { isSeller, login } = require('../services/auth');

router.get('/isSeller/', (req, res) => {
    const { email } = req.body;
    isSeller(email)
        .then((result) => {
            res.json(result);
        })
        .catch((error) => {
            if (error && error.code === 'ER_CONNECTION_TIMEOUT') {
                return res.status(503).json({
                    message: 'No se puede conectar a la base de datos en este momento.'
                });
            }

            return res.status(500).json({
                message: 'Error interno al validar el vendedor.'
            });
        });
});

router.post('/login/', (req, res) => {
    const { email, password } = req.body;
    login(email, password)
        .then((result) => {
            //añadir el token a los headers
            res.setHeader('Authorization', result);
            res.json(result);
        })
        .catch((error) => {
            if (error && error.code === 'ER_CONNECTION_TIMEOUT') {
                return res.status(503).json({
                    message: 'Servicio de autenticacion temporalmente no disponible (BD).'
                });
            }

            return res.status(500).json({
                message: 'Error interno en el proceso de login.'
            });
        });
});



module.exports = router;