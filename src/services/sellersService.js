const { connect } = require('../controllers/prestashopConector');

const getSellers = async () => {
    const query = `
    SELECT 
    s.id_seller, 
    s.name AS seller_name, 
    s.email AS seller_email, 
    s.phone AS seller_phone, 
    s.active AS is_active
FROM
    ps_seller s
    `;
    return await connect(query, null);
};

const getSellerById = async (id) => {
    const query = `
    SELECT *
    FROM ps_seller
    WHERE id_customer = ?
    `;
    return await connect(query, id);
}

//obtener productos de un vendedor
const getSellerProducts = async (id) => {
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
}

//obtener productos de un vendedor que esten activos
const getSellerActiveProducts = async (id, active) => {
    const query = `
    SELECT 
    p.id_product,
    pl.name AS product_name,
    p.price,
    p.quantity,
    p.active,
    p.id_tax_rules_group
FROM
    ps_product p
INNER JOIN
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN
    ps_seller_product sp ON p.id_product = sp.id_product
WHERE
    sp.id_seller = ?
    AND pl.id_lang = 1
    AND p.active = ?
ORDER BY
    p.id_product;
`;
    return await connect(query, [id, active]);
}




module.exports = {
    getSellers,
    getSellerById,
    getSellerProducts,
    getSellerActiveProducts
};
