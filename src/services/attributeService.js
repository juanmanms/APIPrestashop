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

exports.getAttributesGrouop = async () => {
    const query = `
    SELECT 
    ag.id_attribute_group,
    agl.name AS attribute_group_name,
    a.id_attribute,
    al.name AS attribute_name
FROM 
    ps_attribute_group ag
INNER JOIN 
    ps_attribute_group_lang agl ON ag.id_attribute_group = agl.id_attribute_group
INNER JOIN 
    ps_attribute a ON ag.id_attribute_group = a.id_attribute_group
INNER JOIN 
    ps_attribute_lang al ON a.id_attribute = al.id_attribute
WHERE 
    agl.id_lang = 2
    AND al.id_lang = 2
    And ag.id_attribute_group > ?
ORDER BY 
    ag.id_attribute_group ASC,
    a.id_attribute ASC`;
    return await connect(query, process.env.group_atributos);
}

