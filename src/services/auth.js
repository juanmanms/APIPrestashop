//servicio de autenticacion de clientes usando el webserver de prestashop
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

const { connect } = require('../controllers/prestashopConector');
const { head } = require('../routes/products');

//comprobar si un cliente esta registrado
const isSeller = async (email) => {
    const query = `
    SELECT 
    c.id_customer
FROM
    ps_seller c
WHERE
    c.email = ?;
    `;
    return await connect(query, email);
}


//hacer login de un cliente con su email y contraseña usando cookie_key y md5
const login = async (email, password) => {
    //console.log(email, password);
    const query = `
    SELECT 
    c.id_customer,
    c.name
FROM
    ps_seller c
WHERE
    c.email = ?
AND
    c.password = ?
    `;
    //si devuelve un resultado, se crea un token con la id del cliente y se devuelve el token y se guarda en la cookie
    const result = await connect(query, [email, password]);
    if (result.length > 0) {
        //en caso de que el email y la contraseña sean correctos, se crea un token y añadir a headers
        const token = jwt.sign({ id: result[0].id_customer }, process.env.cookie_key);
        return token;
    } else {
        return 'Usuario o contraseña incorrectos';
    }
}






module.exports = {
    isSeller,
    login,
}
