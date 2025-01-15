const { connect } = require("../controllers/prestashopConector");

const getPaymentMethods = async () => {
    const query = `
        SELECT *
        FROM payment_methods 
    `
    const result = await connect(query);
    return result;

}

const updatePaymentMethod = async (id, active) => {
    active = active ? 1 : 0;
    const query = `
        UPDATE payment_methods
        SET is_active = ?
        WHERE id_payment_method = ?
    `
    const result = await connect(query, [active, id]);
    return result;
}

const getReportResumenGenerico = async (from, to) => {
    const query = `
        SELECT 
    ord.id_order AS "ID", 
    ord.reference AS "Ref",
    ord.forma_pago as "Pago",
    DATE_FORMAT(DATE(ord.ddw_order_date), '%d/%m/%Y') AS "Data", 
    IF(
        ISNULL(pp.id_seller), 
        IF(ISNULL(so.id_seller), pps.name, so.name), 
        pp.name
    ) AS "Parada", 
    cus.id_customer,
    CONCAT(cus.firstname, ' ', cus.lastname) AS "Cliente", 
    ROUND(ord.total_paid, 2) AS "Total", 
    ROUND(ord.total_shipping_tax_incl - ord.total_discounts, 2) AS "Transport"
FROM 
    ps_orders ord
LEFT JOIN 
    ps_customer cus ON cus.id_customer = ord.id_customer
LEFT JOIN 
    ps_order_detail od ON od.id_order = ord.id_order
LEFT JOIN 
    (SELECT sso.id_order, sso.id_seller, ss.name 
     FROM ps_seller_order sso 
     LEFT JOIN ps_seller ss ON ss.id_seller = sso.id_seller) so ON so.id_order = ord.id_order
LEFT JOIN 
    (SELECT ap.id_order, ap.id_seller, name 
     FROM ps_a4pedidosparadas ap 
     LEFT JOIN ps_seller s ON s.id_seller = ap.id_seller) pp ON pp.id_order = ord.id_order
LEFT JOIN 
    (SELECT spp.id_product, spp.id_seller, name 
     FROM ps_seller_product spp 
     LEFT JOIN ps_seller ssp ON ssp.id_seller = spp.id_seller) pps ON pps.id_product = od.product_id
WHERE 
    ord.current_state in (26, 27, 30) -- Filtrar solo pedidos completados (ajusta según tu lógica de estados)
    AND ord.ddw_order_date >= ? -- Fecha de inicio
    AND ord.ddw_order_date <= ? -- Fecha final
ORDER BY 
    Cliente ASC;
    `
    const result = await connect(query, [from, to]);
    return result;
}


module.exports = {
    getPaymentMethods,
    updatePaymentMethod,
    getReportResumenGenerico
}