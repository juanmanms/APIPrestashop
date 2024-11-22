// Importar dependencias
const jwt = require('jsonwebtoken');
const { connect } = require('../controllers/prestashopConector');


// Middleware para verificar el token
const verifyToken = async (req, res, next) => {
    // Obtener el token del header de la solicitud
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Acceso denegado. No se proporcionó token.');


    if (token.startsWith('eyJ')) {
        try {
            // Verificar el token con la clave secreta
            const verified = jwt.verify(token, process.env.cookie_key);
            // Adjuntar el ID del cliente al objeto de solicitud
            console.log(verified);
            req.user = verified.id;
            next(); // Pasar al siguiente middleware/controlador
        } catch (error) {
            // En caso de error en la verificación del token
            res.status(400).send('Token inválido.');
        }
    } else {
        // const result = await validateToken(token);
        // console.log('result', result[0].id_employee);
        try {
            const result = await validateToken(token);
            if (result) {
                req.user = result[0].id_employee;
                next();
            } else {
                res.status(400).send('Token inválido.');
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Token inválido.');
        }
    }
};

const validateToken = async (token) => {
    const query = `
        SELECT
            *
        FROM
            ps_authentication_token a
        WHERE
            a.token = ?;
    `
    const result = await connect(query, token);
    if (result.length > 0) {
        const expiryDate = new Date(result[0].expiry_date);
        if (expiryDate > new Date()) {
            return result;
        } else {
            return false;
        }

    }

}

module.exports = verifyToken;
