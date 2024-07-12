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
            res.json(error);
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
            res.json(error);
        });
});



module.exports = router;