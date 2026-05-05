const fs = require('fs');
const mysql2 = require('mysql2/promise');

async function run() {
    console.log("Connecting to database...");
    const connection = await mysql2.createConnection({
        host: '127.0.0.1',
        user: 'admin',
        port: 3306,
        password: 'admin',
        multipleStatements: true
    });

    console.log("Reading SQL files...");
    const initSql = fs.readFileSync('init.sql', 'utf8');
    const initViewsSql = fs.readFileSync('init_views.sql', 'utf8');
    const seedSql = fs.readFileSync('seed.sql', 'utf8');

    console.log("Executing SQL...");
    await connection.query(initSql);
    await connection.query(initViewsSql);
    await connection.query(seedSql);

    console.log("Done.");
    await connection.end();
}

run().catch(console.error);
