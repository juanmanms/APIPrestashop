const express = require('express');
const router = express.Router();

const {
    getPaymentMethods,
    updatePaymentMethod
} = require('../services/utilidadesService');

router.get('/payment-methods', async (req, res) => {
    //console.log("Obteniendo métodos de pago");
    const paymentMethods = await getPaymentMethods();
    res.json(paymentMethods);
}
);

router.put('/payment-methods', async (req, res) => {
    const { active, id } = req.body;
    //console.log("Actualizando método de pago con id: ", id, "a ", active);
    await updatePaymentMethod(id, active);
    res.json("Método de pago actualizado");
}
);

module.exports = router
