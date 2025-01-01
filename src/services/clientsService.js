const { connect } = require('../controllers/prestashopConector');

const getClients = async () => {
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

const getClientsDuplicateMail = async () => {
    const query = `
    SELECT *
FROM ps_customer
WHERE email IN (
    SELECT email
    FROM ps_customer
    GROUP BY email
    HAVING COUNT(*) > 1
)
ORDER BY email
    `;
    return await connect(query);
}


//obtener direcciones de un cliente
const getAddresses = async (id) => {
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

const createCustomerAndAddress = async (customerData) => {
    const {
        firstname,
        lastname,
        email,
        passwd,
        gender,
        newsletter,
        optin,
        address1,
        postcode,
        city,
        id_country,
        id_state,
        alias,
        phone,
        phone_mobile
    } = customerData;

    const queryInsertCustomer = `
    INSERT INTO ps_customer (
        id_shop_group,
        id_shop,
        id_gender,
        id_default_group,
        id_lang,
        id_risk,
        company,
        siret,
        ape,
        firstname,
        lastname,
        email,
        passwd,
        last_passwd_gen,
        birthday,
        newsletter,
        ip_registration_newsletter,
        newsletter_date_add,
        optin,
        website,
        outstanding_allow_amount,
        show_public_prices,
        max_payment_days,
        secure_key,
        note,
        active,
        is_guest,
        deleted,
        date_add,
        date_upd,
        reset_password_token,
        reset_password_validity
    ) VALUES (
        1, 1, ?, 3, 2, 0, NULL, NULL, NULL, ?, ?, ?, ?, NOW(), NULL, ?, NULL, NULL, ?, NULL, 0.000000, 0, 0, '0', NULL, 1, 0, 0, NOW(), NOW(), NULL, NULL
    )`;

    const queryInsertAddress = `
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
        ?, 0, 0, 0, ?, ?, ?, NULL, ?, ?, ?, NULL, ?, ?, NULL, ?, ?, NULL, NULL, 0, NOW(), NOW()
    )`;


    try {
        await connect("START TRANSACTION");
        console.log("Transaction started");

        // Insert customer
        const customerResult = await connect(queryInsertCustomer, [
            Number(gender),
            firstname,
            lastname,
            email,
            passwd,
            newsletter ? 1 : 0,
            optin ? 1 : 0
        ]);
        const customerId = Number(customerResult.insertId);
        console.log("Customer created with ID:", customerId);

        // Insert address
        await connect(queryInsertAddress, [
            customerId,
            id_country,
            id_state,
            alias,
            lastname,
            firstname,
            address1,
            postcode,
            city,
            phone,
            phone_mobile
        ]);
        console.log("Address created for customer ID:", customerId);

        await connect("COMMIT");
        console.log("Transaction committed");

        return customerId;
    } catch (error) {
        // Rollback transaction on error
        await connect("ROLLBACK");
        console.error("Transaction rolled back due to error:", error);
        throw error;
    }
};

const updateCustomerAndAddress = async (customerData, Id) => {
    const {
        firstname,
        lastname,
        email,
        passwd,
        gender,
        newsletter,
        optin,
        address1,
        postcode,
        city,
        id_country,
        id_state,
        alias,
        phone,
        phone_mobile
    } = customerData;

    const id_customer = Id;

    const queryUpdateCustomer = `
    UPDATE ps_customer
    SET
        firstname = ?,
        lastname = ?,
        email = ?
    WHERE
        id_customer = ?
    `;
    const queryUpdateAddress = `
    UPDATE ps_address
    SET
        id_country = ?,
        id_state = ?,
        alias = ?,
        lastname = ?,
        firstname = ?,
        address1 = ?,
        postcode = ?,
        city = ?,
        phone = ?,
        phone_mobile = ?
    WHERE
        id_customer = ?
    `;

    try {
        await connect("START TRANSACTION");
        console.log("Transaction started");

        // Update customer
        await connect(queryUpdateCustomer, [
            firstname,
            lastname,
            email,
            id_customer
        ]);
        console.log("Customer updated with ID:", id_customer);

        // Update address
        await connect(queryUpdateAddress, [
            id_country,
            id_state,
            alias,
            lastname,
            firstname,
            address1,
            postcode,
            city,
            phone,
            phone_mobile,
            id_customer
        ]);
        console.log("Address updated for customer ID:", id_customer);

        await connect("COMMIT");
        console.log("Transaction committed");
    } catch (error) {
        // Rollback transaction on error
        await connect("ROLLBACK");
        console.error("Transaction rolled back due to error:", error);
        throw error;
    }
}


module.exports = {
    createCustomerAndAddress,
    getClients,
    getAddresses,
    getClientsDuplicateMail,
    updateCustomerAndAddress
};