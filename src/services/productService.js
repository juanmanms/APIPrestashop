//usar connect de prestashopConector.js
const { query } = require('express');
const { connect } = require('../controllers/prestashopConector');




exports.getProductsBySeller = async (id) => {
    const query = `
    SELECT 
    p.id_product,
    pl.name AS product_name,
    p.price,
    p.price * (1 + (t.rate / 100)) AS "precio_IVA", 
    p.quantity,
    p.active,
    p.id_tax_rules_group,
    t.rate AS tax_rate,
    p.state
FROM 
    ps_product p
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN 
    ps_seller_product sp ON p.id_product = sp.id_product
INNER JOIN 
    ps_seller s ON sp.id_seller = s.id_seller
LEFT JOIN 
    ps_tax t ON p.id_tax_rules_group = t.id_tax
WHERE 
    s.id_customer = ?
    AND pl.id_lang = 2 
ORDER BY 
    p.id_product;
    `;
    return await connect(query, id);
};

// consulta para actualizar el precio de un producto pasando un id de producto y un precio
exports.updateProductPrice = async (id, price) => {
    const query = `
    UPDATE 
    ps_product 
SET
    price = ?
WHERE
    id_product = ?
    `;

    const queryShop = `
    UPDATE 
    ps_product_shop 
SET
    price = ?
WHERE
    id_product = ?
    `;
    await connect(queryShop, [price, id]);
    return await connect(query, [price, id]);
};

exports.updateProductIVA = async (id, iva) => {
    const query = `
    UPDATE 
    ps_product
SET
    id_tax_rules_group = ?
WHERE
    id_product = ?
    `;
    return await connect(query, [iva, id]);
}

exports.getCombinations = async (id) => {
    const query = `
    SELECT DISTINCT p.id_product,
                pl.name AS product_name,
                a.id_attribute,
                al.name AS attribute_names,
                pa.price AS combination_price,
                t.rate AS tax_rate,
                (pa.price * (1 + t.rate / 100)) AS price_with_tax,
                p.active
FROM ps_product p
INNER JOIN ps_product_attribute pa ON p.id_product = pa.id_product
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN ps_product_attribute_combination pac ON pa.id_product_attribute = pac.id_product_attribute
INNER JOIN ps_attribute a ON pac.id_attribute = a.id_attribute
INNER JOIN ps_attribute_lang al ON a.id_attribute = al.id_attribute
INNER JOIN ps_seller_product sp ON p.id_product = sp.id_product
INNER JOIN ps_seller s ON sp.id_seller = s.id_seller
INNER JOIN ps_product_shop ps ON p.id_product = ps.id_product
INNER JOIN ps_tax_rule tr ON ps.id_tax_rules_group = tr.id_tax_rules_group
INNER JOIN ps_tax t ON tr.id_tax = t.id_tax
WHERE pl.id_lang = 2
  AND s.id_customer = ?
ORDER BY p.id_product
    `;
    return await connect(query, [id]);
}

exports.activeProduct = async (id, active) => {
    const query = `
    UPDATE 
    ps_product
SET
    active = ?
WHERE
    id_product = ?
    `;
    const queryShop = `
    UPDATE
    ps_product_shop
SET
    active = ?
WHERE
    id_product = ?
    `;
    await connect(queryShop, [active, id]);
    return await connect(query, [active, id]);
}

exports.updateProductName = async (id, name) => {
    const query = `
    UPDATE 
    ps_product_lang
SET
    name = ?
WHERE
    id_product = ?
    `;
    return await connect(query, [name, id]);
}

exports.getProductsNoCombinations = async (id) => {
    const query = `
    SELECT 
    p.id_product,
    pl.name AS product_name,
    p.price,
    p.price * (1 + (t.rate / 100)) AS "precio_IVA", 
    p.quantity,
    p.active,
    p.id_tax_rules_group,
    t.rate AS tax_rate,
    p.state
FROM 
    ps_product p
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN 
    ps_seller_product sp ON p.id_product = sp.id_product
INNER JOIN 
    ps_seller s ON sp.id_seller = s.id_seller
LEFT JOIN 
    ps_tax t ON p.id_tax_rules_group = t.id_tax
WHERE 
    s.id_customer = ?
    AND pl.id_lang = 2
    AND p.id_product NOT IN (
        SELECT DISTINCT p.id_product
        FROM ps_product p
        INNER JOIN ps_product_attribute pa ON p.id_product = pa.id_product
        INNER JOIN ps_seller_product sp ON p.id_product = sp.id_product
        INNER JOIN ps_seller s ON sp.id_seller = s.id_seller
        WHERE s.id_customer = ?
    )
ORDER BY 
    p.id_product;

    `;
    return await connect(query, [id, id]);
}




