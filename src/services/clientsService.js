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


