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

//consulta para saber que clientes tienen más de una dirección
const getClientesAddress = async () => {
    const query = `
    SELECT 
        a.id_customer,
        CONCAT(c.firstname, ' ', c.lastname) AS customer_name,
        COUNT(a.id_address) AS address_count
    FROM 
        ps_address a
    INNER JOIN 
        ps_customer c ON a.id_customer = c.id_customer
    WHERE 
        a.active = 1  -- Considerar solo las direcciones activas
        AND a.deleted = 0 
    GROUP BY 
        a.id_customer
    HAVING 
        COUNT(a.id_address) > 1 
    ORDER BY 
        address_count DESC;
    `;

    const results = await connect(query);

    // Convertir BigInt a String
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}

const getProductosSinFoto = async () => {
    const query = `
    SELECT 
    p.id_product, 
    pl.name AS product_name,
    s.id_seller,
    s.name AS seller_name
FROM 
    ps_product p
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
LEFT JOIN 
    ps_seller_product sp ON p.id_product = sp.id_product
LEFT JOIN 
    ps_seller s ON sp.id_seller = s.id_seller
LEFT JOIN 
    ps_image i ON p.id_product = i.id_product
WHERE 
    i.id_image IS NULL
And
   pl.id_lang = 2
And
    p.active = 1
GROUP BY 
    p.id_product, pl.name, s.id_seller, s.name
ORDER BY 
    p.id_product;
    `;
    const result = await connect(query);
    return result;

}

const getProductsSinCategoria = async () => {
    const query = `
    SELECT 
    p.id_product,
    pl.name,
    p.id_category_default 
FROM 
    ps_product p
LEFT JOIN 
    ps_category_product cp ON p.id_product = cp.id_product
LEFT JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 2 -- Ajusta el ID del idioma si es necesario
WHERE 
    p.active = 1
    AND cp.id_category in (1,2, 20)
ORDER BY 
    p.id_product ASC;
    `;

    const result = await connect(query);
    return result;
}

const getInfoSeller = async () => {
    const query = `
    SELECT 
    c.id_category AS "ID_Categoria", 
    c.name AS "Categoría", 
    s.id_seller AS "ID_Vendedor",
    s.name AS "Vendedor",
    sup.id_supplier AS "ID_Proveedor",
    c.description,
    s.email,
    s.phone,
    c.meta_keywords as "keyword",
    COUNT(p.id_product) AS "activos",
    CONCAT('https://botiga.mercattorreblanca.cat/img/c/', c.id_category, '.jpg') AS "Imagen_Categoria"
FROM ps_category_lang c
INNER JOIN ps_seller s ON c.name = s.name
LEFT JOIN ps_supplier sup ON sup.name = s.name
LEFT JOIN ps_seller_product sp ON s.id_seller = sp.id_seller
LEFT JOIN ps_product p ON sp.id_product = p.id_product AND p.active = 1
WHERE c.id_lang =2
and s.active = 1
GROUP BY c.id_category, c.name, s.id_seller, s.name, c.meta_keywords, sup.id_supplier
`;

    const results = await connect(query);
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}

const getTotales = async (year) => {
    const query = `
    SELECT LPAD(MONTH(ord.ddw_order_date), 2, '0') AS mes, 
        COUNT(*) AS orders_total,
        ROUND(SUM(ord.total_paid), 2) AS pedidos_euros,
        COUNT(DISTINCT CONCAT(ord.id_customer, DATE(ord.ddw_order_date))) AS entregues,
        ROUND(SUM(ord.total_shipping) - SUM(ord.total_discounts), 2) AS entregues_euros
        FROM ps_orders ord
        WHERE ord.current_state in (5, 26, 27, 30) AND YEAR(ord.ddw_order_date) = ?
        GROUP BY mes
        ORDER BY mes ASC
    `;

    const results = await connect(query, [year]);
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}




module.exports = {
    getPaymentMethods,
    updatePaymentMethod,
    getReportResumenGenerico,
    getClientesAddress,
    getProductosSinFoto,
    getProductsSinCategoria,
    getInfoSeller,
    getTotales
}