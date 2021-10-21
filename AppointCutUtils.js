const mysql2 = require('mysql2/promise');

// Connection Pool
let connection

function startConnection() {
    if (!connection) {
        connection = mysql2.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
    }
}

async function  getAllFrom(table) {
    let query = 'SELECT * FROM ' + table
    var rows = await connection.query(query)
    return rows[0]
}

module.exports = {getAllFrom , startConnection}