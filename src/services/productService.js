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
LEFT JOIN 
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

exports.uploadImage = async (id_product, image) => {
    //obtener id y archivo de la imagen

    //subir a directorio del servidor
    const fs = require('fs');

}

exports.getCategories = async (id) => {
    const query = `
    SELECT 
    p.id_product AS "ID Producto",
    pl.name AS "Nombre Producto",
    p.id_category_default AS "ID Categoría",
    cl.name AS "Categoría por Defecto",
    s.name AS "Vendedor",
    GROUP_CONCAT(clh.name, ' * ', clh.id_category ORDER BY clh.name ASC SEPARATOR ', ') AS "Subcategorías"
FROM 
    ps_product p
LEFT JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = 2 -- Ajusta el ID del idioma si es necesario
LEFT JOIN 
    ps_category_lang cl ON p.id_category_default = cl.id_category AND cl.id_lang = 2 -- Ajusta el ID del idioma si es necesario
LEFT JOIN 
    ps_seller_product sp ON p.id_product = sp.id_product -- Relación entre producto y vendedor
LEFT JOIN 
    ps_seller s ON sp.id_seller = s.id_seller -- Relación entre vendedor y su información
LEFT JOIN 
    ps_category_product cp ON cp.id_product = p.id_product -- Relación entre producto y sus categorías
LEFT JOIN 
    ps_category_lang clh ON clh.id_category = cp.id_category AND clh.id_lang = 2 -- Ajusta el ID del idioma si es necesario
WHERE 
     s.id_customer = ?
GROUP BY 
    p.id_product
ORDER BY 
    p.id_product ASC;
    `;

    return await connect(query, [id]);
}

exports.addCategoryToProduct = async (id_product, id_category) => {
    const query = `
    INSERT INTO 
    ps_category_product 
    (id_category, id_product)
VALUES
    (?, ?);
    `;
    return await connect(query, [id_category, id_product]);

}

exports.deleteCategoryFromProduct = async (id_product, id_category) => {
    const query = `
    DELETE FROM 
    ps_category_product 
WHERE
    id_product = ?
    AND id_category = ?
    `;
    return await connect(query, [id_product, id_category]);
}

exports.createProductBySellet = async (id_category, price, id_tax, name, description, id_seller, supplier) => {
    console.log("llamada", id_category, price, id_tax, name, description, id_seller,);

    try {
        const productId = await createProduct(id_category, price, id_tax, supplier);
        //console.log("Producto creado:", Number(productId));
        await createProductShop(Number(productId), id_category, price, id_tax);
        await createProductLang(Number(productId), name, description);
        await createSellerProduct(id_seller, Number(productId));
        await addSupplierToProduct(Number(productId), supplier);
        await addCategory(Number(productId), id_category);
        return productId;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }

}
//obtener la categoria y el suplier v incula da al vendedor
exports.getCategoryBySeller = async (id) => {
    const query = `
    SELECT 
    c.id_category AS "categoria", 
    sup.id_supplier AS "proveedor",
    s.id_seller AS "vendedor"
FROM ps_category_lang c
INNER JOIN ps_seller s ON c.name = s.name
LEFT JOIN ps_supplier sup ON sup.name = s.name
WHERE s.id_customer = ?
and c.id_lang =2
    `
    return await connect(query, [id]);
}


const createProduct = async (id_category, price, id_tax, supplier) => {
    const query = `
    INSERT INTO 
    ps_product 
    (id_category_default, price, id_tax_rules_group, quantity, active, state, id_supplier)
VALUES
    (?, ?, ?, 0, 1, 1, ?);
    `;
    const result = await connect(query, [id_category, price, id_tax, supplier]);
    return result.insertId;
}

const createProductShop = async (id_product, id_category, price, id_tax) => {
    const query = `
    INSERT INTO
    ps_product_shop
    (id_product, id_shop, id_category_default, price, wholesale_price, active, id_tax_rules_group)
VALUES
    (?, 1, ?, ?, 0.00, 1, ?);
    `;
    return await connect(query, [id_product, id_category, price, id_tax]);
}

const createProductLang = async (id_product, name, description) => {
    const query = `
    INSERT INTO
    ps_product_lang
    (id_product, id_shop, id_lang, name, description)
VALUES
    (?, 1, 2, ?, ?);
    `;
    return await connect(query, [id_product, name, description]);
}

const createSellerProduct = async (id_seller, id_product) => {
    const query = `
    INSERT INTO
    ps_seller_product
    (id_seller, id_product)
VALUES
    (?, ?);
    `;
    return await connect(query, [id_seller, id_product]);
}

const addCategory = async (id_product, id_category) => {
    const query = `
    INSERT INTO
    ps_category_product
    (id_category, id_product)
VALUES
    (?, ?);
    `;
    return await connect(query, [id_category, id_product]);
}

const addSupplierToProduct = async (id_product, id_supplier) => {
    const query = `
    INSERT INTO
    ps_product_supplier
    (id_product, id_supplier)
VALUES
    (?, ?);
    `;
    return await connect(query, [id_product, id_supplier]);
}

exports.descatalogProduct = async (id_product) => {
    try {
        await deleteProductSeller(id_product);
        await deleteCategoryProduct(id_product);
        await descatalogCategoryProduct(id_product);
        console.log("Producto descatalogado");
        return true;
    } catch (error) {
        console.error("Error descatalogando producto:", error);
        throw error;
    }
}

const deleteProductSeller = async (id_product) => {
    const query = `
    DELETE FROM 
    ps_seller_product 
WHERE
    id_product = ?
    `;
    return await connect(query, [id_product]);
}

const descatalogCategoryProduct = async (id_product) => {
    const query = `
    update ps_product
    set active = 0, id_category_default = ?
    where id_product = ?
    `;

    const queryShop = `
    update ps_product_shop
    set active = 0, id_category_default = ?
    where id_product = ?
    `;
    await connect(query, [process.env.category_descart, id_product]);
    await connect(queryShop, [process.env.category_descart, id_product]);
    return true;
}

//quitar subcategorias
const deleteCategoryProduct = async (id_product) => {
    const query = `
    DELETE FROM 
    ps_category_product 
WHERE
    id_product = ?
    `;

    const queryShop = `
    insert into ps_category_product
    (id_category, id_product)
    values (?, ?)
    `;
    await connect(query, [id_product]);
    return await connect(queryShop, [process.env.category_descart, id_product]);
}







