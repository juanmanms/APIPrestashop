//usar connect de prestashopConector.js
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
    t.rate AS tax_rate
FROM 
    ps_product p
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN 
    ps_seller_product sp ON p.id_product = sp.id_product
LEFT JOIN 
    ps_tax t ON p.id_tax_rules_group = t.id_tax
WHERE 
    sp.id_seller = ?
    AND pl.id_lang = 1 
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

