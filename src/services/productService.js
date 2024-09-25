//usar connect de prestashopConector.js
const { connect } = require("../controllers/prestashopConector");

exports.getProductsBySeller = async (id) => {
    const query = `
    SELECT 
    p.id_product,
    pl.name AS product_name,
    FORMAT(p.price, 2) AS price,
    FORMAT(p.price * (1 + (t.rate / 100)), 2) AS precio_IVA,  
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

    const queryShop = `
    UPDATE
    ps_product_shop
SET
    id_tax_rules_group = ?
WHERE
    id_product = ?
    `;
    await connect(queryShop, [iva, id]);
    return await connect(query, [iva, id]);
};

exports.getCombinations = async (id) => {
    const query = `
    SELECT DISTINCT p.id_product,
                pl.name AS product_name,
                a.id_attribute,
                al.name AS attribute_names,
                pa.price AS combination_price,
                t.rate AS tax_rate,
                (pa.price * (1 + t.rate / 100)) AS price_with_tax,
                p.active,
                pa.id_product_attribute
FROM ps_product p
INNER JOIN ps_product_attribute pa ON p.id_product = pa.id_product
INNER JOIN ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN ps_product_attribute_combination pac ON pa.id_product_attribute = pac.id_product_attribute
INNER JOIN ps_attribute a ON pac.id_attribute = a.id_attribute
INNER JOIN ps_attribute_lang al ON a.id_attribute = al.id_attribute
INNER JOIN ps_seller_product sp ON p.id_product = sp.id_product
INNER JOIN ps_seller s ON sp.id_seller = s.id_seller
INNER JOIN ps_product_shop ps ON p.id_product = ps.id_product
LEFT JOIN ps_tax_rule tr ON ps.id_tax_rules_group = tr.id_tax_rules_group
LEFT JOIN ps_tax t ON tr.id_tax = t.id_tax
WHERE pl.id_lang = 2
  AND s.id_customer = ?
ORDER BY p.id_product
    `;
    return await connect(query, [id]);
};

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
};

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
};

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
};

exports.createCombination = async (id, atributo) => {
    const insertQuery = `
    INSERT INTO ps_product_attribute (
        id_product, 
        price, 
        weight, 
        available_date, 
        reference, 
        ean13, 
        upc, 
        wholesale_price
    ) VALUES (
        ?, 0.00, 0.00, '0000-00-00', '', '', '', 0.00
    );
    `;

    const selectQuery = `SELECT LAST_INSERT_ID() AS id_product_attribute;`;

    try {
        // Iniciar una transacción
        await connect("START TRANSACTION");
        console.log("Transaction started");

        // Ejecutar la inserción
        const insertResult = await connect(insertQuery, [id]);
        console.log("Insert result:", insertResult);

        // Obtener el ID del atributo del producto recién insertado
        const result = await connect(selectQuery);
        console.log("Select result:", result);

        // Confirmar la transacción
        await connect("COMMIT");
        console.log("Transaction committed");

        // Asegurarse de que el valor devuelto sea un número entero
        const idProductAttribute = insertResult.insertId;
        console.log("ID Product Attribute:", idProductAttribute);

        createCombinationAtrribute(idProductAttribute, atributo);
        createCombinationShop(idProductAttribute, id);
        updateProductPriceCombination(id);

        return Number(idProductAttribute);
    } catch (error) {
        // Revertir la transacción en caso de error
        await connect("ROLLBACK");
        console.error("Transaction rolled back due to error:", error);
        throw error;
    }
};

createCombinationAtrribute = async (idProductAttribute, idAttribute) => {
    const query = `
    INSERT INTO ps_product_attribute_combination (
        id_product_attribute, 
        id_attribute
    ) VALUES (
        ?, ?
    );
    `;
    return await connect(query, [idProductAttribute, idAttribute]);
};

createCombinationShop = async (idProductAttribute, idProduct) => {
    const query = `
    INSERT INTO ps_product_attribute_shop
(id_product, id_product_attribute, id_shop, wholesale_price, price, ecotax, weight, unit_price_impact, default_on, minimal_quantity, low_stock_threshold, low_stock_alert, available_date)
VALUES(?, ?, 1, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, NULL, 1, NULL, 0, NULL);`;

    return await connect(query, [idProduct, idProductAttribute]);
};

updateProductPriceCombination = async (id) => {
    const query = `
    UPDATE 
    ps_product 
SET
    price = 0.00
WHERE
    id_product = ?
    `;

    const queryShop = `
    UPDATE 
    ps_product_shop 
SET
    price = 0.00
WHERE
    id_product = ?
    `;
    await connect(queryShop, [id]);
    return await connect(query, [id]);
};

exports.updateCombinationPrice = async (id, price) => {
    const query = `
    UPDATE 
    ps_product_attribute 
SET
    price = ?
WHERE
    id_product_attribute = ?
    `;

    const queryShop = `
    UPDATE 
    ps_product_attribute_shop 
SET
    price = ?
WHERE
    id_product_attribute = ?
    `;
    await connect(queryShop, [price, id]);
    return await connect(query, [price, id]);
};

exports.deleteCombination = async (id) => {
    const query = `
    DELETE FROM 
    ps_product_attribute 
WHERE
    id_product_attribute = ?
    `;

    const queryShop = `
    DELETE FROM 
    ps_product_attribute_shop 
WHERE
    id_product_attribute = ?
    `;
    await connect(queryShop, [id]);
    return await connect(query, [id]);
};

exports.getImagenes = async (id) => {
    const query = `
SELECT 
    p.id_product,
    pl.name AS product_name,
    i.id_image,
    CASE 
        WHEN LENGTH(i.id_image) = 1 THEN CONCAT('img/p/', SUBSTRING(i.id_image, 1, 1), '/', i.id_image, '.jpg')
        WHEN LENGTH(i.id_image) = 2 THEN CONCAT('img/p/', SUBSTRING(i.id_image, 1, 1), '/', SUBSTRING(i.id_image, 2, 1), '/', i.id_image, '.jpg')
        WHEN LENGTH(i.id_image) = 3 THEN CONCAT('img/p/', SUBSTRING(i.id_image, 1, 1), '/', SUBSTRING(i.id_image, 2, 1), '/', SUBSTRING(i.id_image, 3, 1), '/', i.id_image, '.jpg')
        WHEN LENGTH(i.id_image) = 4 THEN CONCAT('img/p/', SUBSTRING(i.id_image, 1, 1), '/', SUBSTRING(i.id_image, 2, 1), '/', SUBSTRING(i.id_image, 3, 1), '/', SUBSTRING(i.id_image, 4, 1), '/', i.id_image, '.jpg')
        ELSE CONCAT('img/p/', SUBSTRING(i.id_image, 1, 1), '/', SUBSTRING(i.id_image, 2, 1), '/', SUBSTRING(i.id_image, 3, 1), '/', SUBSTRING(i.id_image, 4, 1), '/', SUBSTRING(i.id_image, 5, 1), '/', i.id_image, '.jpg')
    END AS image_url
FROM 
    ps_product p
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN 
    ps_image i ON p.id_product = i.id_product
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
    p.id_product   `;
    return await connect(query, [id]);
}

exports.deleteImage = async (id_product, id_image) => {
    const query = `
    DELETE FROM 
    ps_image 
WHERE
    id_product = ?
    AND id_image = ?
    `;
    return await connect(query, [id_product, id_image]);
};


