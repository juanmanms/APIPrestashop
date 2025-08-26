const { connect } = require('../controllers/prestashopConector');

const getProductComandaBySeller = async (id) => {
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


const createPsCart = async (id_customer, id_carrier, id_address, product, price, date, payment) => {
    const insertQuery = `
        INSERT INTO ps_cart (
            id_shop_group, id_shop, id_carrier, delivery_option, id_lang, 
            id_address_delivery, id_address_invoice, id_currency, id_customer, id_guest, 
            secure_key, recyclable, gift, gift_message, mobile_theme, 
            allow_seperated_package, date_add, date_upd, checkout_session_data, 
            ddw_order_date, ddw_order_time
        ) VALUES (
            0, 1, ?, '', 2, 
            ?, ?, 1, ?, 0, 
            0, 1, 0, NULL, 0, 
            0, NOW(), NOW(), NULL, 
            DATE_ADD(NOW(), INTERVAL 1 DAY), ''
        )`;

    try {
        await connect("START TRANSACTION");
        console.log("Transaction started");

        // Insert cart
        const insertResult = await connect(insertQuery, [id_carrier, id_address, id_address, id_customer]);
        const cartId = Number(insertResult.insertId);
        console.log("Cart created with ID:", cartId);

        // Add product to cart
        await createPsCartProduct(cartId, product);
        console.log("Product added to cart:", product);

        // Create order
        const idOrder = await createPsOrder(price, id_carrier, id_customer, cartId, id_address, date, payment);
        console.log("Order created with ID:", idOrder);

        // Create order details
        await createPsOrderDetail(idOrder, product, price);
        console.log("Order details created for order ID:", idOrder);

        // Create order carrier
        await createOrderCarrier(idOrder, id_carrier);
        console.log("Order carrier added for order ID:", idOrder);

        // Update order history
        await createOrderHistory(idOrder, 22);
        console.log("Order history updated for order ID:", idOrder);

        // Commit transaction
        await connect("COMMIT");
        console.log("Transaction committed");

        return idOrder;
    } catch (error) {
        // Rollback transaction on error
        await connect("ROLLBACK");
        console.error("Transaction rolled back due to error:", error);
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
    if (process.env.Server === 'mercatserraperera.cat') {
        // En producción, el transportista 27 tiene un impuesto de 4€ si el precio es menor a 75€
        return transportista != 22 ? 0 : 4;
    } else if (process.env.Server === 'mercattorreblanca.cat') {
        // En entorno de test, el impuesto es 2€ si el precio es menor a 50€
        return transportista != 27 ? 0 : price < 50 ? 4 : 0;
    }
    return 0; // Por defecto, si no se cumple ninguna condición, no hay impuesto de envío

}

const calc_env = (transportista, price) => {
    if (process.env.Server === 'mercatserraperera.cat') {
        // En producción, el transportista 27 tiene un impuesto de 4€ si el precio es menor a 75€
        return transportista != 22 ? 0 : 3.31;
    } else if (process.env.Server === 'mercattorreblanca.cat') {

        return transportista != 27 ? 0 : price < 75 ? 3.31 : 0
    }
    return 0; // Por defecto, si no se cumple ninguna condición, no hay coste de envío

}

const createPsOrder = async (priced, id_carrier, id_customer, id_cart, id_address, date, payment) => {
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
    ddw_order_time,
    forma_pago
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
    NULL,
    ?
);

    `;

    try {
        await connect("Start transaction");
        console.log("Transaction started");

        const insertResult = await connect(insertQuery, [reference, id_carrier, id_customer, Number(id_cart), id_address, id_address, total_tax, total_tax, total, price, price, envio_tax, envio_tax, envio, date, payment]);

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

const getPedidos = async (id_seller) => {
    const query = `
    SELECT 
    s.id_customer AS 'Id Vendedor',
    s.name AS 'Nombre Vendedor',
    o.id_order AS 'Id Pedido',
    o.reference AS 'Referencia Pedido',
    o.date_add AS 'Fecha Pedido',
    o.ddw_order_date AS 'Fecha Entrega',
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
    o.current_state IN (22, 23, 24, 26, 27, 28, 29, 30, 6 ) -- Cambia los estados según lo que consideres un pedido completado
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

const createOrderHistory = async (order, state) => {
    query = `
    INSERT INTO ps_order_history (
        id_employee,
        id_order,
        id_order_state,
        date_add
    ) VALUES (
        2, 
        ?, 
        ?, 
        NOW()
    )`;

    try {
        connect("Start transaction");
        console.log("Transaction started");

        await connect(query, [order, state]);

    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }


}

const cancelOrder = async (order) => {
    query = `
    INSERT INTO ps_order_history (
        id_employee,
        id_order,
        id_order_state,
        date_add
    ) VALUES (
        2, 
        ?, 
        6, 
        NOW()
    )`;

    queryUpdate = `
    UPDATE ps_orders 
    SET current_state = 6 
    WHERE id_order = ?
    `

    try {
        connect("Start transaction");
        console.log("Transaction started");

        await connect(query, [order]);
        await connect(queryUpdate, [order]);

    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }

}

const getRepartos = async () => {
    const query = `
    SELECT 
    DATE_FORMAT(DATE(ord.ddw_order_date), '%d/%m/%Y') AS 'FechaEntrega',
    c.id_customer,
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', IF(d.address2 IS NOT NULL AND d.address2 != '', CONCAT(' ', d.address2), '')) AS 'Direccion',
    d.postcode AS 'CP', 
    d.city AS 'Poblacion', 
    d.phone AS 'Fijo',
    d.phone_mobile AS 'Movil',
    COUNT(ord.id_order) AS 'Pedidos',
    GROUP_CONCAT(ord.id_order ORDER BY ord.id_order ASC SEPARATOR ', ') AS 'IDsPedidos',
    ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) AS 'TotalCompra',
    IF(
        ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) >= 75.00, 
        "0.00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'CosteTransporte',
    ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) + 
    IF(
        ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) >= 75.00, 
        "0.00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'TotalPagarCliente',
    SUM(IFNULL(ord.total_shipping, 0) - IFNULL(ord.total_discounts, 0)) AS 'TransporteMenosDescuentos',
    -- Lógica para forma de pago
    CASE 
        WHEN COUNT(DISTINCT ord.forma_pago) = 1 THEN MAX(ord.forma_pago) -- Si solo hay una forma de pago
        ELSE 'Variado' -- Si hay más de una
    END AS 'FormaPago'
FROM 
    ps_orders ord 	        
LEFT JOIN 
    ps_customer c ON c.id_customer = ord.id_customer
LEFT JOIN 
    ps_address d ON d.id_address = ord.id_address_delivery
LEFT JOIN 
    ps_state st ON st.id_state = d.id_state
WHERE 
    ord.current_state = 24 -- Estados "pendiente de envío", "preparación en curso", etc.
    AND ord.payment <> 'Recollida en consigna' -- Excluir recogida en tienda si aplica
    AND ord.id_shop = 1
    AND ord.ddw_order_date BETWEEN DATE_SUB(NOW(), INTERVAL 31 DAY) AND NOW()
GROUP BY 
    ord.id_customer
ORDER BY 
    ord.id_customer ASC;
    `

    const results = await connect(query);

    // Convertir BigInt a String
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}

const getPedidosReparto = async (customer) => {
    const query = `
    SELECT 
    ord.id_order AS 'IDPedido',
    ord.current_state AS 'Estado',
    DATE_FORMAT(ord.ddw_order_date, '%d/%m/%Y') AS 'FechaPedido',
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', IF(d.address2 IS NOT NULL AND d.address2 != '', CONCAT(' ', d.address2), '')) AS 'Dirección',
    d.postcode AS 'CP',
    d.city AS 'Población',
    d.phone AS 'TeléfonoFijo',
    d.phone_mobile AS 'TeléfonoMóvil',
    ROUND(ord.total_products_wt, 2) AS 'TotalCompra',
    ROUND(ord.total_shipping_tax_incl, 2) AS 'CosteTransporte',
    ROUND(ord.total_paid_tax_incl, 2) AS 'TotalPagado',
    ROUND(ord.total_shipping_tax_incl - ord.total_discounts, 2) AS 'TotalTransporte',
    carr.name AS 'Transportista',
    ord.forma_pago AS 'FormaPago',
    od.product_name AS 'Producto'
FROM 
    ps_orders ord
LEFT JOIN 
    ps_customer c ON c.id_customer = ord.id_customer
LEFT JOIN 
    ps_address d ON d.id_address = ord.id_address_delivery
LEFT JOIN 
    ps_carrier carr ON carr.id_carrier = ord.id_carrier
LEFT JOIN 
    ps_order_detail od ON od.id_order = ord.id_order -- Línea de pedido
WHERE 
    ord.current_state = 24 -- Estados "pendiente de envío", "preparación en curso", etc.
    AND ord.payment <> 'Recollida en consigna' -- Excluir recogida en tienda si aplica
    AND ord.id_shop = 1
    AND ord.ddw_order_date BETWEEN DATE_SUB(NOW(), INTERVAL 5 DAY) AND NOW()
    AND c.id_customer = ?
ORDER BY 
    ord.ddw_order_date ASC, ord.id_order ASC;
    `;

    const results = await connect(query, [customer]);

    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;


}

const getCienPedidosHistoria = async () => {
    const query = `
    SELECT 
    ord.id_order AS 'IDPedido',
    ord.current_state AS 'Estado',
    ord.ddw_order_date AS 'Fecha Entrega',
    ord.date_add AS 'Fecha Pedido',
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', IF(d.address2 IS NOT NULL AND d.address2 != '', CONCAT(' ', d.address2), '')) AS 'Dirección',
    d.postcode AS 'CP',
    d.city AS 'Población',
    d.phone AS 'TeléfonoFijo',
    d.phone_mobile AS 'TeléfonoMóvil',
    ROUND(ord.total_products_wt, 2) AS 'TotalCompra',
    ROUND(ord.total_shipping_tax_incl, 2) AS 'CosteTransporte',
    ROUND(ord.total_paid_tax_incl, 2) AS 'TotalPagado',
    ROUND(ord.total_shipping_tax_incl - ord.total_discounts, 2) AS 'TotalTransporte',
    carr.name AS 'Transportista'
FROM
    ps_orders ord
LEFT JOIN
    ps_customer c ON c.id_customer = ord.id_customer
LEFT JOIN
    ps_address d ON d.id_address = ord.id_address_delivery
LEFT JOIN
    ps_carrier carr ON carr.id_carrier = ord.id_carrier
WHERE
    ord.current_state <> 6-- Estados "pendiente de envío", "preparación en curso", etc.
    AND ord.payment <> 'Recollida en consigna' -- Excluir recogida en tienda si aplica
    AND ord.id_shop = 1
    AND ord.ddw_order_date BETWEEN DATE_SUB(NOW(), INTERVAL 10 DAY) AND NOW()
ORDER BY
    ord.ddw_order_date DESC, ord.id_order DESC
limit 100;
    `;

    const results = await connect(query);

    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}

const getRepartosFuturo = async () => {
    const query = `
    SELECT 
    DATE_FORMAT(DATE(ord.ddw_order_date), '%d/%m/%Y') AS 'FechaEntrega',
    c.id_customer,
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', IF(d.address2 IS NOT NULL AND d.address2 != '', CONCAT(' ', d.address2), '')) AS 'Direccion',
    d.postcode AS 'CP', 
    d.city AS 'Poblacion', 
    d.phone AS 'Fijo',
    d.phone_mobile AS 'Movil',
    COUNT(ord.id_order) AS 'Pedidos',
    GROUP_CONCAT(ord.id_order ORDER BY ord.id_order ASC SEPARATOR ', ') AS 'IDsPedidos',
    ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) AS 'TotalCompra',
    IF(
        ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) > 75.00, 
        "0.00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'CosteTransporte',
    ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) + 
    IF(
        ROUND(SUM(IFNULL(ord.total_products_wt, 0)), 2) > 75.00, 
        "0.00",
        CASE 
            WHEN id_carrier IN (7, 11, 12, 13, 14, 17, 18) THEN "4.00"
            WHEN id_carrier IN (9, 15, 19) THEN "6.00"
            WHEN id_carrier IN (10, 16, 20, 21) THEN "4.00"
            ELSE "4.00"
        END
    ) AS 'TotalPagarCliente',
    SUM(IFNULL(ord.total_shipping, 0) - IFNULL(ord.total_discounts, 0)) AS 'TransporteMenosDescuentos',
    -- Lógica para forma de pago
    CASE 
        WHEN COUNT(DISTINCT ord.forma_pago) = 1 THEN MAX(ord.forma_pago) -- Si solo hay una forma de pago
        ELSE 'Variado' -- Si hay más de una
    END AS 'FormaPago'
FROM 
    ps_orders ord 	        
LEFT JOIN 
    ps_customer c ON c.id_customer = ord.id_customer
LEFT JOIN 
    ps_address d ON d.id_address = ord.id_address_delivery
LEFT JOIN 
    ps_state st ON st.id_state = d.id_state
WHERE 
    ord.current_state = 24 -- Estados "pendiente de envío", "preparación en curso", etc.
    AND ord.payment <> 'Recollida en consigna' -- Excluir recogida en tienda si aplica
    AND ord.id_shop = 1
    AND ord.ddw_order_date > NOW()
GROUP BY 
    ord.id_customer
ORDER BY 
    ord.id_customer ASC;
    `

    const results = await connect(query);

    // Convertir BigInt a String
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}

const getPedidosRepartoFuturo = async (customer) => {
    const query = `
    SELECT 
    ord.id_order AS 'IDPedido',
    ord.current_state AS 'Estado',
    DATE_FORMAT(ord.ddw_order_date, '%d/%m/%Y') AS 'FechaPedido',
    CONCAT(c.firstname, ' ', c.lastname) AS 'Cliente',
    CONCAT(d.address1, ' ', IF(d.address2 IS NOT NULL AND d.address2 != '', CONCAT(' ', d.address2), '')) AS 'Dirección',
    d.postcode AS 'CP',
    d.city AS 'Población',
    d.phone AS 'TeléfonoFijo',
    d.phone_mobile AS 'TeléfonoMóvil',
    ROUND(ord.total_products_wt, 2) AS 'TotalCompra',
    ROUND(ord.total_shipping_tax_incl, 2) AS 'CosteTransporte',
    ROUND(ord.total_paid_tax_incl, 2) AS 'TotalPagado',
    ROUND(ord.total_shipping_tax_incl - ord.total_discounts, 2) AS 'TotalTransporte',
    carr.name AS 'Transportista',
    ord.forma_pago AS 'FormaPago',
    od.product_name AS 'Producto'
FROM 
    ps_orders ord
LEFT JOIN 
    ps_customer c ON c.id_customer = ord.id_customer
LEFT JOIN 
    ps_address d ON d.id_address = ord.id_address_delivery
LEFT JOIN 
    ps_carrier carr ON carr.id_carrier = ord.id_carrier
LEFT JOIN 
    ps_order_detail od ON od.id_order = ord.id_order -- Línea de pedido
WHERE 
    ord.current_state = 24 -- Estados "pendiente de envío", "preparación en curso", etc.
    AND ord.payment <> 'Recollida en consigna' -- Excluir recogida en tienda si aplica
    AND ord.id_shop = 1
    AND ord.ddw_order_date > NOW()    
    AND c.id_customer = ?
ORDER BY 
    ord.ddw_order_date ASC, ord.id_order ASC;
    `;

    const results = await connect(query, [customer]);

    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;


}

const changeStateOrder = async (order, state) => {
    query = `
    INSERT INTO ps_order_history (
        id_employee,
        id_order,
        id_order_state,
        date_add
    ) VALUES (
        2, 
        ?, 
        ?, 
        NOW()
    )`;

    queryUpdate = `
    UPDATE ps_orders 
    SET current_state = ? 
    WHERE id_order = ?
    `

    try {
        connect("Start transaction");
        console.log("Transaction started");

        await connect(query, [order, state]);
        await connect(queryUpdate, [state, order]);

    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }

}

const changeFormaPago = async (order, forma_pago) => {
    query = `
    UPDATE ps_orders 
    SET forma_pago = ? 
    WHERE id_order = ?
    `

    try {
        connect("Start transaction");
        console.log("Transaction started");

        await connect(query, [forma_pago, order]);

    } catch (error) {
        await connect("rollback");
        console.log("Transaction rolled back");
        throw error;
    }

}

const getPedidosOnline = async () => {
    const query = `
    SELECT 
    so.id_seller_order AS "IDPedidoVendedor",
    o.id_order AS "IDPedido",
    o.reference AS "ReferenciaPedido",
    so.date_add AS "FechaPedido",
    c.id_customer AS "IDCliente",
    CONCAT(c.firstname, ' ', c.lastname) AS "Cliente",
    o.total_shipping_tax_incl AS "TotalEnvíoconIVA",
    o.total_products_wt AS "TotalSinIva",
    o.total_paid_tax_incl AS "TotalPagadoconIVA",
    o.current_state AS "EstadoPedido"
FROM ps_seller_order so
INNER JOIN ps_orders o ON so.id_order = o.id_order
INNER JOIN ps_seller s ON s.id_seller = so.id_seller
LEFT JOIN ps_customer c ON so.id_customer = c.id_customer
WHERE o.current_state IN (3, 10, 13)
  AND o.date_add >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) -- Últimos 7 días
ORDER BY so.id_seller_order DESC;
`

    return await connect(query);
}

const getPedidosOnlineVendedor = async (id_seller) => {
    const query = `
SELECT 
    so.id_seller_order AS "IDPedidoVendedor",
    o.id_order AS "IDPedido",
    o.reference AS "ReferenciaPedido",
    so.date_add AS "FechaPedido",
    c.id_customer AS "IDCliente",
    CONCAT(c.firstname, ' ', c.lastname) AS "Cliente",
    o.total_shipping_tax_incl AS "TotalEnvíoconIVA",
    o.total_paid_tax_excl AS "TotalSinIva",
    o.total_paid_tax_incl AS "TotalPagadoconIVA",
    o.current_state AS "EstadoPedido"
FROM ps_seller_order so
INNER JOIN ps_orders o ON so.id_order = o.id_order
INNER JOIN ps_seller s ON s.id_seller = so.id_seller
LEFT JOIN ps_customer c ON so.id_customer = c.id_customer
WHERE o.current_state IN (3, 10, 13)
  AND o.date_add >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) -- Últimos 7 días
  AND s.id_customer = ?
ORDER BY so.id_seller_order DESC;
    `

    return await connect(query, [id_seller]);
}

const getLineasPedido = async (id_order) => {
    const query = `
    SELECT 
    od.product_id AS "IDProducto",
    pl.name AS "NombreProducto",
    od.product_quantity AS "Cantidad",
    od.product_price AS "PrecioUnitario",
    od.total_price_tax_incl AS "PrecioTotal"
FROM ps_order_detail od
INNER JOIN ps_product_lang pl ON od.product_id = pl.id_product
WHERE od.id_order = ?
and pl.id_lang = 2
    `

    return await connect(query, [id_order]);
}

const getRepartosParada = async () => {
    const query = `
    SELECT 
    s.id_seller,
    CONCAT(vend.firstname, ' ', vend.lastname) AS nombre_vendedor,
    COUNT(DISTINCT o.id_order) AS total_pedidos,
    GROUP_CONCAT(DISTINCT CONCAT(cli.firstname, ' ', cli.lastname) SEPARATOR ', ') AS clientes
FROM ps_order_detail od
INNER JOIN ps_orders o ON o.id_order = od.id_order
INNER JOIN ps_seller_product sp ON sp.id_product = od.product_id
INNER JOIN ps_seller s ON s.id_seller = sp.id_seller
INNER JOIN ps_customer vend ON vend.id_customer = s.id_customer
INNER JOIN ps_customer cli ON cli.id_customer = o.id_customer
WHERE o.current_state IN (24) -- Estados activos
  AND o.id_shop = 1
GROUP BY s.id_seller, vend.firstname, vend.lastname
ORDER BY total_pedidos DESC;
    `

    const results = await connect(query);

    // Convertir BigInt a String
    const serializedResults = results.map(row => {
        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, typeof value === 'bigint' ? value.toString() : value])
        );
    });

    return serializedResults;
}






module.exports = {
    cancelOrder,
    getPedidos,
    createPsCart,
    getProductComandaBySeller,
    getRepartos,
    getPedidosReparto,
    getCienPedidosHistoria,
    getRepartosFuturo,
    getPedidosRepartoFuturo,
    changeStateOrder,
    changeFormaPago,
    getPedidosOnlineVendedor,
    getPedidosOnline,
    getLineasPedido,
    getRepartosParada
}
