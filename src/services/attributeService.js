const { connect } = require('../controllers/prestashopConector');


exports.getAttributes = async () => {
    const query = `
    SELECT 
    a.id_attribute,
    al.name,
    a.position
FROM
    ps_attribute a
INNER JOIN  
    ps_attribute_lang al ON a.id_attribute = al.id_attribute
WHERE
    al.id_lang = 2
    and a.id_attribute > 136
    `;
    return await connect(query, null);
};
