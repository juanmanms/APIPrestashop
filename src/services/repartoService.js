const { connect } = require('../controllers/prestashopConector');

//consulta de repartos
const getRepartos = async () => {
    const query = `SELECT * FROM ps_delivery_days`;
    return await connect(query);
};

const updateActiveDay = async (id) => {
    const query = `
    UPDATE ps_delivery_days
    SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
    WHERE id_delivery_day = ?
    `;
    return await connect(query, id);
}

const getCarrier = async () => {
    const query = `SELECT * FROM ps_carrier where active = 1 and deleted = 0`;
    return await connect(query);
};

const updateEndTime = async (id, endTime) => {
    const query = `
    UPDATE ps_delivery_days
    SET end_time = ?
    WHERE id_delivery_day = ?
    `;
    return await connect(query, [endTime, id]);
}

const updateStartTime = async (id, startTime) => {
    const query = `
    UPDATE ps_delivery_days
    SET start_time = ?
    WHERE id_delivery_day = ?
    `;
    return await connect(query, [startTime, id]);
}




module.exports = {
    getRepartos,
    updateActiveDay,
    getCarrier,
    updateEndTime,
    updateStartTime
};