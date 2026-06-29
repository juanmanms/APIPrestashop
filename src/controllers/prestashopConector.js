const mariadb = require("mariadb");

function buildDbConfig() {
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
    return dbConfig;
}

async function getConnection() {
    const conn = await mariadb.createConnection(buildDbConfig());
    return conn;
}

async function connectWithConn(conn, query, params) {
    const result = params == null ? await conn.query(query) : await conn.query(query, params);
    return result;
}

async function connect(query, params) {
    let conn;
    try {
        conn = await mariadb.createConnection(buildDbConfig());
        // si params es null, se ejecuta la query sin parametros
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
    connect,
    getConnection,
    connectWithConn,
};