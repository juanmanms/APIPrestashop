// Importar dependencias
const jwt = require('jsonwebtoken');


// Middleware para verificar el token
const verifyToken = (req, res, next) => {
    // Obtener el token del header de la solicitud
    const token = req.headers['authorization'];

    // Verificar si el token está presente
    if (!token) return res.status(403).send('Acceso denegado. No se proporcionó token.');

    try {
        // Verificar el token con la clave secreta
        const verified = jwt.verify(token, process.env.cookie_key);
        // Adjuntar el ID del cliente al objeto de solicitud
        req.user = verified.id;
        next(); // Pasar al siguiente middleware/controlador
    } catch (error) {
        // En caso de error en la verificación del token
        res.status(400).send('Token inválido.');
    }
};

module.exports = verifyToken;
