const { connect } = require('../controllers/prestashopConector');


exports.getAttributes = async () => {
    const query = `
    SELECT 
    a.id_attribute,
    al.name,
    a.position
FROM
    ps_attribute a
INNER JOIN  
    ps_attribute_lang al ON a.id_attribute = al.id_attribute
WHERE
    al.id_lang = 2
    and a.id_attribute > 136
    `;
    return await connect(query, null);
};

exports.getAttributesGrouop = async () => {
    const query = `
    SELECT 
    ag.id_attribute_group,
    agl.name AS attribute_group_name,
    a.id_attribute,
    al.name AS attribute_name
FROM 
    ps_attribute_group ag
INNER JOIN 
    ps_attribute_group_lang agl ON ag.id_attribute_group = agl.id_attribute_group
INNER JOIN 
    ps_attribute a ON ag.id_attribute_group = a.id_attribute_group
INNER JOIN 
    ps_attribute_lang al ON a.id_attribute = al.id_attribute
WHERE 
    agl.id_lang = 2
    AND al.id_lang = 2
    And ag.id_attribute_group > ?
ORDER BY 
    ag.id_attribute_group ASC,
    a.id_attribute ASC`;
    return await connect(query, process.env.group_atributos);
}

exports.getRepartos = async () => {
    const query = `
    SELECT 
    DATE_FORMAT(DATE(ord.ddw_order_date), '%d/%m/%Y') AS 'Fecha entrega',
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', d.address2) AS 'Dirección',  -- address1 y address2 concatenados
    d.postcode AS 'CP', 
    d.city AS 'Población', 
    d.phone AS 'Fijo',
    d.phone_mobile AS 'Móvil',
    COUNT(ord.id_order) AS 'Número de Pedidos',  -- Número total de pedidos por cliente
    ROUND(SUM(ord.total_products_wt), 2) AS 'Total COMPRA',
    IF(
        ROUND(SUM(ord.total_products_wt), 2) > 75.00, 
        "0,00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'Coste Transporte',
    ROUND(SUM(ord.total_products_wt), 2) + 
    IF(
        ROUND(SUM(ord.total_products_wt), 2) > 75.00, 
        "0,00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'Total a pagar Cliente'
FROM 
    ps_orders ord 	        
LEFT JOIN 
    ps_customer c ON (c.id_customer = ord.id_customer)
LEFT JOIN 
    ps_address d ON (d.id_address = ord.id_address_delivery)
LEFT JOIN 
    ps_state st ON (st.id_state = d.id_state)
WHERE 
    ord.payment <> 'Recollida en consigna'
    AND ord.id_shop = 1     
    AND ord.ddw_order_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 5 DAY) AND CURDATE()    
    AND ord.current_state = 24
GROUP BY 
    ord.id_customer
ORDER BY 
    ord.id_customer ASC;
    `

    return await connect(query)
}
