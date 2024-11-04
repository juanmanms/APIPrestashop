const { connect } = require('../controllers/prestashopConector');

exports.getProductComandaBySeller = async (id) => {
    const query = `
    SELECT 
    p.id_product
FROM 
    ps_seller_product sp
INNER JOIN 
    ps_product p ON sp.id_product = p.id_product
INNER JOIN 
    ps_product_lang pl ON p.id_product = pl.id_product
INNER JOIN 
    ps_seller s ON sp.id_seller = s.id_seller
WHERE 
    s.id_customer = ?              
    AND pl.name LIKE 'comanda%'  
    AND pl.id_lang = 2`;
    return await connect(query, [id]);
}


exports.createPsCart = async (id_customer, id_carrier, id_address, product, price, date) => {
    const insertQuery = `
    INSERT INTO ps_cart (
        id_shop_group, 
        id_shop, 
        id_carrier, 
        delivery_option, 
        id_lang, 
        id_address_delivery, 
        id_address_invoice, 
        id_currency, 
        id_customer, 
        id_guest, 
        secure_key, 
        recyclable, 
        gift, 
        gift_message, 
        mobile_theme, 
        allow_seperated_package, 
        date_add, 
        date_upd, 
        checkout_session_data, 
        ddw_order_date, 
        ddw_order_time
    ) VALUES (
        0, 
        1, 
        ?, 
        '', 
        2, 
        ?, 
        ?, 
        1, 
        ?, 
        0, 
        0, 
        1, 
        0, 
        NULL, 
        0, 
        0, 
        NOW(), 
        NOW(), 
        NULL, 
        DATE_ADD(NOW(), INTERVAL 1 DAY), 
        ''
    )`;

    try {
        await connect("Start transaction");
        console.log("Transaction started");

        //ejecutar inserccion
        const insertResult = await connect(insertQuery, [id_carrier, id_address, id_address, id_customer]);
        console.log("Cart created", insertResult);
        console.log("Product", product);

        createPsCartProduct(insertResult.insertId, product);
        const idOrder = await createPsOrder(price, id_carrier, id_customer, insertResult.insertId, id_address, date);
        console.log("Order created", idOrder);
        createPsOrderDetail(idOrder, product, price);
        createOrderCarrier(idOrder, id_carrier);


        return Number(insertResult.insertId);
    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }

}

const createPsCartProduct = async (id_cart, id_product) => {
    const query = `
    INSERT INTO ps_cart_product (
        id_cart, 
        id_product, 
        id_product_attribute, 
        id_address_delivery, 
        id_shop, 
        id_customization, 
        quantity, 
        date_add
    ) VALUES (
        ?, 
        ?, 
        0, 
        0, 
        1, 
        0, 
        1, 
        NOW()
    )`;
    return await connect(query, [id_cart, id_product]);
}

const calc_env_tax = (transportista, price) => {
    return transportista != 27 ? 0 : price < 75 ? 4 : 0

}

const calc_env = (transportista, price) => {
    return transportista != 27 ? 0 : price < 75 ? 3.31 : 0

}

const createPsOrder = async (priced, id_carrier, id_customer, id_cart, id_address, date) => {
    const price = Number(priced);
    const reference = generateRandomCode();
    const envio_tax = calc_env_tax(id_carrier, price);
    const envio = calc_env(id_carrier, price);
    const total_tax = price + envio_tax;
    const total = price + envio;

    const insertQuery = `
    INSERT INTO ps_orders (
    reference,
    id_shop_group,
    id_shop,
    id_carrier,
    id_lang,
    id_customer,
    id_cart,
    id_currency,
    id_address_delivery,
    id_address_invoice,
    current_state,
    secure_key,
    payment,
    conversion_rate,
    module,
    recyclable,
    gift,
    gift_message,
    mobile_theme,
    shipping_number,
    total_discounts,
    total_discounts_tax_incl,
    total_discounts_tax_excl,
    total_paid,
    total_paid_tax_incl,
    total_paid_tax_excl,
    total_paid_real,
    total_products,
    total_products_wt,
    total_shipping,
    total_shipping_tax_incl,
    total_shipping_tax_excl,
    carrier_tax_rate,
    total_wrapping,
    total_wrapping_tax_incl,
    total_wrapping_tax_excl,
    payment_cost_amount,
    payment_cost_percent,
    round_mode,
    round_type,
    invoice_number,
    delivery_number,
    invoice_date,
    delivery_date,
    valid,
    date_add,
    date_upd,
    ddw_order_date,
    ddw_order_time
) VALUES (
    ?,
    1,
    1,
    ?,
    2,
    ?,
    ?,
    1,
    ?,
    ?,
    22,
    '249d5ebf23b3af8c42df428a4f03305c',
    'Contra reemborsament (COD)',
    1.000000,
    'ps_cashondelivery',
    0,
    0,
    NULL,
    0,
    NULL,
    0.000000,
    0.000000,
    0.000000,
    ?,
    ?,
    ?,
    0.000000,
    ?,
    ?,
    ?,
    ?,
    ?,
    21.000,
    0.000000,
    0.000000,
    0.000000,
    0,
    0,
    2,
    2,
    0,
    0,
    NOW(),
    NOW(),
    1,
    NOW(),
    NOW(),
    ?,
    NULL
);

    `;

    try {
        await connect("Start transaction");
        console.log("Transaction started");

        const insertResult = await connect(insertQuery, [reference, id_carrier, id_customer, Number(id_cart), id_address, id_address, total_tax, total_tax, total, price, price, envio_tax, envio_tax, envio, date]);

        console.log("Order created");

        return Number(insertResult.insertId);
    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }
}

const createPsOrderDetail = async (id_order, id_product, product_price) => {
    const product_name = await getProductName(id_product);
    console.log(product_name[0].name);

    const insertQuery = `
    INSERT INTO ps_order_detail (
    id_order,
    id_shop,
    product_id,
    product_name,
    product_quantity,
    product_price,
    product_weight,
    tax_name,
    tax_rate,
    total_price_tax_incl,
    total_price_tax_excl,
    unit_price_tax_incl,
    unit_price_tax_excl
) 
VALUES (
    ?,               -- id_order (ID del pedido al que pertenece este detalle)
    1,                  -- id_shop (ID de la tienda)
    ?,                -- product_id (ID del producto)
    ?,     -- product_name (Nombre del producto)
    1,                  -- product_quantity (Cantidad de productos)
    ?,              -- product_price (Precio unitario del producto, sin impuestos)
    0,              -- product_weight (Peso del producto)
    'IVA',              -- tax_name (Nombre del impuesto aplicado)
    0,             -- tax_rate (Tasa de impuesto en porcentaje)
    ?,              -- total_price_tax_incl (Precio total con impuestos)
    ?,              -- total_price_tax_excl (Precio total sin impuestos)
    ?,              -- unit_price_tax_incl (Precio unitario con impuestos)
    ?               -- unit_price_tax_excl (Precio unitario sin impuestos)
);
    `;

    try {
        await connect("Start transaction");
        console.log("Transaction started");

        await connect(insertQuery, [id_order, id_product, product_name[0].name, product_price, product_price, product_price, product_price, product_price]);

        console.log("Order detail created");

    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }


}

const getProductName = async (id_product) => {
    const query = `
    SELECT 
    pl.name
FROM
    ps_product_lang pl
WHERE
    pl.id_product = ?
AND
    pl.id_lang = 2
    `;
    return await connect(query, [id_product]);
}

const generateRandomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let code = '';

    // Generar las dos letras
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        code += letters[randomIndex];
    }


    return code;
};

exports.getPedidos = async (id_seller) => {
    const query = `
    SELECT 
    s.id_customer AS 'Id Vendedor',
    s.name AS 'Nombre Vendedor',
    o.id_order AS 'Id Pedido',
    o.reference AS 'Referencia Pedido',
    o.date_add AS 'Fecha Pedido',
    c.id_customer AS 'Id Cliente',
    CONCAT(c.firstname, ' ', c.lastname) AS 'Nombre Cliente',
    od.product_id AS 'Id Producto',
    od.product_name AS 'Nombre Producto',
    od.product_quantity AS 'Cantidad',
    o.total_paid AS 'Total Pagado',
    o.payment AS 'Método de Pago',
    o.current_state 
FROM 
    ps_orders o
LEFT JOIN 
    ps_order_detail od ON o.id_order = od.id_order
LEFT JOIN 
    ps_seller_product sp ON od.product_id = sp.id_product
LEFT JOIN 
    ps_seller s ON sp.id_seller = s.id_seller
LEFT JOIN 
    ps_customer c ON o.id_customer = c.id_customer
WHERE 
    o.current_state IN (22, 23, 24, 26, 27, 28, 29, 30 ) -- Cambia los estados según lo que consideres un pedido completado
And s.id_customer = ?
ORDER BY 
    o.date_add DESC 
 Limit 50
    `;

    return await connect(query, [id_seller]);
}

const createOrderCarrier = async (order, carrier) => {
    const query = `
        INSERT INTO ps_order_carrier
        (
            id_order, 
            id_carrier, 
            id_order_invoice, 
            weight, 
            shipping_cost_tax_excl, 
            shipping_cost_tax_incl, 
            tracking_number, 
            date_add
        ) VALUES ( 
            ?, 
            ?, 
            0, 
            0, 
            '', 
            '', 
            '', 
            NOW()
        );
    `;

    try {
        await connect("Start transaction");
        console.log("Transaction started");

        await connect(query, [order, carrier]);

        console.log("Order carrier created");
    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }
}


