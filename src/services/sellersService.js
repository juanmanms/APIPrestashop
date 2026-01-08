const { connect } = require('../controllers/prestashopConector');

const getSellers = async () => {
    const query = `
    SELECT 
    s.id_seller,
    s.id_customer, 
    s.name AS seller_name, 
    s.email AS seller_email, 
    s.phone AS seller_phone, 
    s.active AS is_active
FROM
    ps_seller s
WHERE
    s.active = 1
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
    AND pl.id_lang = 2
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
    AND pl.id_lang = 2
    AND p.active = ?
ORDER BY
    p.id_product;
`;
    return await connect(query, [id, active]);
}

const getFamilysSeller = async (id) => {
    const query = `
        SELECT 
    s.id_seller AS "ID Vendedor",
    s.name AS "Nombre Vendedor",
    cl.id_category AS "ID Categoría",
    cl.name AS "Nombre Categoría",
    GROUP_CONCAT(clh.name, ' * ', clh.id_category ORDER BY clh.name ASC SEPARATOR ', ') AS "Subcategorías"
FROM 
    ps_seller s
LEFT JOIN 
    ps_category_lang cl ON s.name = cl.name
LEFT JOIN 
    ps_category c ON cl.id_category = c.id_category
LEFT JOIN 
    ps_category ch ON c.id_category = ch.id_parent
LEFT JOIN 
    ps_category_lang clh ON ch.id_category = clh.id_category
WHERE
	s.id_customer = ?
	and s.active = 1 -- Solo vendedores activos
    and cl.id_lang = 2
    and clh.id_lang = 2
GROUP BY 
    s.id_seller, cl.id_category
ORDER BY 
    s.name ASC;
    `
    return await connect(query, id);
}

const updateSellerInfo = async (id, name, email, phone) => {
    const query = `
    UPDATE ps_seller
    SET name = ?, email = ?, phone = ?
    WHERE id_customer = ?
    `;
    return await connect(query, [name, email, phone, id]);
}

const updateParadaInfo = async (id, description, keywords, telefono, whatsapp, facebook, instagram, web, nparada) => {
    const query = `
    UPDATE ps_category_lang
    SET description = ?, meta_keywords = ?
    WHERE id_category = ?
    `;

    const query2 = `
    UPDATE ps_category
    SET fijo = ?, whatsapp = ?, facebook = ?, instagram = ?, web = ?, nparada = ?
    WHERE id_category = ?
    `;

    await connect(query2, [telefono, whatsapp, facebook, instagram, web, nparada, id]);

    return await connect(query, [description, keywords, id]);
}





module.exports = {
    getSellers,
    getSellerById,
    getSellerProducts,
    getSellerActiveProducts,
    getFamilysSeller,
    updateParadaInfo
};
