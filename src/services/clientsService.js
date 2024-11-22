const { connect } = require('../controllers/prestashopConector');

exports.getClients = async () => {
    const query = `
    SELECT 
    c.id_customer as id,
    c.firstname as name,
    c.lastname as apellidos,
    c.email,
    c.active,
    c.date_add
FROM
    ps_customer c
WHERE
    c.active = 1
    `;
    return await connect(query);
}

//obtener direcciones de un cliente
exports.getAddresses = async (id) => {
    const query = `
    SELECT 
    a.id_address,
    a.alias,
    a.address1,
    a.address2,
    a.postcode,
    a.city,
    a.phone,
    a.phone_mobile,
    a.other,
    a.date_add
FROM
    ps_address a
WHERE
    a.id_customer = ?
    `;
    return await connect(query, [id]);
}

exports.createCustomerAndAddress = async (customerData) => {
    const { firstName, lastName, email, phone, address, city, postalCode, country } = customerData;

    const insertCustomerQuery = `
    INSERT INTO ps_customer (
        firstname,
        lastname,
        email,
        passwd,
        id_gender,
        birthday,
        newsletter,
        ip_registration_newsletter,
        newsletter_date_add,
        optin,
        website,
        company,
        siret,
        ape,
        outstanding_allow_amount,
        show_public_prices,
        id_risk,
        max_payment_days,
        active,
        note,
        is_guest,
        id_shop,
        id_shop_group,
        date_add,
        date_upd
    ) VALUES (
        ?, ?, ?, '', 1, '0000-00-00', 0, '', NULL, 0, '', '', '', '', 0.00, 0, 0, 0, 0, '', 0, 1, 1, NOW(), NOW()
    )`;

    const insertAddressQuery = `
    INSERT INTO ps_address (
        id_customer,
        id_manufacturer,
        id_supplier,
        id_warehouse,
        id_country,
        id_state,
        alias,
        company,
        lastname,
        firstname,
        address1,
        address2,
        postcode,
        city,
        other,
        phone,
        phone_mobile,
        vat_number,
        dni,
        deleted,
        date_add,
        date_upd
    ) VALUES (
        ?, 0, 0, 0, (SELECT id_country FROM ps_country WHERE iso_code = ?), 0, 'My Address', '', ?, ?, ?, '', ?, ?, '', ?, ?, '', '', 0, NOW(), NOW()
    )`;

    let connection;

    try {
        connection = await connect();
        await connection.beginTransaction();
        console.log("Transaction started");

        // Insert customer
        const [customerResult] = await connection.query(insertCustomerQuery, [firstName, lastName, email]);
        const customerId = customerResult.insertId;
        console.log("Customer created with ID:", customerId);

        // Insert address
        await connection.query(insertAddressQuery, [customerId, country, lastName, firstName, address, postalCode, city, phone]);
        console.log("Address created for customer ID:", customerId);

        await connection.commit();
        console.log("Transaction committed");

        return customerId;
    } catch (error) {
        if (connection) {
            await connection.rollback();
            console.log("Transaction rolled back");
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};