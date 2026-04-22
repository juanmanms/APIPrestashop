const mariadb = require("mariadb");
async function connect(query, params) {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.Server,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.UsuarioDB,
            password: process.env.PasswordDB,
            database: process.env.DB,
            connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS || 10000),
            socketTimeout: Number(process.env.DB_SOCKET_TIMEOUT_MS || 10000),
        });

        // Use Connection to execute the query
        //si params es null, se ejecuta la query sin parametros
        const result = params == null ? await conn.query(query) : await conn.query(query, params);

        return result;
    } catch (err) {
        // Propaga el error para que el caller pueda responder apropiadamente.
        console.log(err);
        throw err;
    } finally {
        // Close Connection
        if (conn) await conn.end();
    }
}

module.exports = {
    connect
};