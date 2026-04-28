const mariadb = require("mariadb");
async function connect(query, params) {
    let conn;
    try {
        const dbConfig = {
            host: process.env.Server,
            user: process.env.UsuarioDB,
            password: process.env.PasswordDB,
            database: process.env.DB,
        };

        if (process.env.DB_PORT) {
            dbConfig.port = Number(process.env.DB_PORT);
        }
        if (process.env.DB_CONNECT_TIMEOUT_MS) {
            dbConfig.connectTimeout = Number(process.env.DB_CONNECT_TIMEOUT_MS);
        }
        if (process.env.DB_SOCKET_TIMEOUT_MS) {
            dbConfig.socketTimeout = Number(process.env.DB_SOCKET_TIMEOUT_MS);
        }

        conn = await mariadb.createConnection(dbConfig);

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