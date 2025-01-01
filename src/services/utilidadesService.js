const { connect } = require("../controllers/prestashopConector");

const getPaymentMethods = async () => {
    const query = `
        SELECT *
        FROM payment_methods 
    `
    const result = await connect(query);
    return result;

}

const updatePaymentMethod = async (id, active) => {
    active = active ? 1 : 0;
    const query = `
        UPDATE payment_methods
        SET is_active = ?
        WHERE id_payment_method = ?
    `
    const result = await connect(query, [active, id]);
    return result;
}


module.exports = {
    getPaymentMethods,
    updatePaymentMethod
}