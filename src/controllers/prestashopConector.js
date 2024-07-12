const mariadb = require("mariadb");
async function connect(query, params) {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: process.env.Server,
            user: process.env.UsuarioDB,
            password: process.env.PasswordDB,
            database: process.env.DB,
        });

        // Use Connection to execute the query
        //si params es null, se ejecuta la query sin parametros
        if (params == null) {
            var result = await conn.query(query);
        } else {
            var result = await conn.query(query, params);
        }

        return result;
    } catch (err) {
        // Manage Errors
        console.log(err);
    } finally {
        // Close Connection
        if (conn) conn.close();
    }
}

module.exports = {
    connect
};