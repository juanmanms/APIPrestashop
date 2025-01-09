const express = require('express');
const router = express.Router();

const {
    getPaymentMethods,
    updatePaymentMethod,
    getReportResumenGenerico
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

router.post('/report-resumen-generico', async (req, res) => {
    console.log("Generando reporte resumen genérico 22");
    const { from, to } = req.body;
    const report = await getReportResumenGenerico(from, to);
    res.json(report);
}
);

module.exports = router
