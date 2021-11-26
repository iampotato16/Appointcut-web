const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise');
//Connection Pool
let connection = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
const AppointmentsManager = require('../../../classes/AppointmentsManager')
const apt = new AppointmentsManager(connection)

//Path : /rest/appointments
router.route('/')
.post(async (req, res) => {
    console.log("D/routesAppt: " + JSON.stringify(req.body))
    res.sendStatus(200)
})

module.exports = router