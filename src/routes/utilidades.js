const express = require('express');
const router = express.Router();

const {
    getPaymentMethods,
    updatePaymentMethod,
    getReportResumenGenerico,
    getClientesAddress,
    getProductosSinFoto,
    getProductsSinCategoria,
    getInfoSeller,
    getTotales
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

router.get('/clientes-address', async (req, res) => {
    console.log("Obteniendo direcciones de clientes");
    try {
        const clientesAddress = await getClientesAddress();
        res.json(clientesAddress);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener direcciones de clientes" });
    }
}
);

router.get('/sin-foto', async (req, res) => {
    console.log("Obteniendo productos sin foto");
    try {
        const productosSinFoto = await getProductosSinFoto();
        res.json(productosSinFoto);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener productos sin foto" });
    }
});

router.get('/sin-categoria', async (req, res) => {
    console.log("Obteniendo productos sin categoría");
    try {
        const productosSinCategoria = await getProductsSinCategoria();
        res.json(productosSinCategoria);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener productos sin categoría" });
    }
});

router.get('/info-seller', async (req, res) => {
    console.log("Obteniendo información de vendedores");
    try {
        const infoSeller = await getInfoSeller();
        res.json(infoSeller);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener información de vendedores" });
    }
});

router.get('/totales-repartos/:year', async (req, res) => {
    const { year } = req.params;
    console.log("Obteniendo totales", year);
    try {
        const totales = await getTotales(year);
        res.json(totales);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al obtener totales" });
    }
});



module.exports = router
