const { connect } = require('../controllers/prestashopConector');

// Obtener todos los registros
const getAllZipCodeZones = async () => {
    const query = 'SELECT * FROM ps_zip_code_zone';
    return await connect(query);
};

// Obtener uno por id
const getZipCodeZoneById = async (id) => {
    const query = 'SELECT * FROM ps_zip_code_zone WHERE id = ?';
    const results = await connect(query, [id]);
    return results[0];
};

// Crear uno nuevo
const createZipCodeZone = async (cp) => {
    const query = `
        INSERT INTO ps_zip_code_zone (id_country, id_zone, min, max, list)
        VALUES (?, ?, ?, ?, ?)
    `;
    try {
        const result = await connect(query, [6, parseInt(process.env.id_zone, 10), cp, cp, ""]);
        return result;
    } catch (error) {
        console.error('Error creating zip code zone:', error);
        throw new Error('Error creating zip code zone');
    }
};

// Actualizar uno existente
// const updateZipCodeZone = async (id, data) => {
//     const query = `
//         UPDATE ps_zip_code_zone
//         SET id_country = ?, id_zone = ?, min = ?, max = ?, list = ?
//         WHERE id = ?
//     `;
//     await connect(query, [
//         data.id_country,
//         data.id_zone,
//         data.min,
//         data.max,
//         data.list,
//         id
//     ]);
//     return { id, ...data };
// };

// Eliminar uno
const deleteZipCodeZone = async (id) => {
    const query = 'DELETE FROM ps_zip_code_zone WHERE id = ?';
    await connect(query, [id]);
    return { id };
};

module.exports = {
    getAllZipCodeZones,
    getZipCodeZoneById,
    createZipCodeZone,
    // updateZipCodeZone,
    deleteZipCodeZone
};