const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')
//Connection Pool
let connection = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})
const ShopServiceFetch  = require('../../../classes/ShopServiceFetch')
const ssf = new ShopServiceFetch(connection)

//Path: /rest/shopservices
router.route('/:id')
.get(async(req, res) => {
    const id = req.params.id
    console.log(`routseServices: Get service with ID: ${id}`)
    const service = await ssf.getService(id)
    res.json(service[0][0])
})

router.route('/appointment/:id')
.get(async(req, res) => {
    const id = req.params.id
    console.log(`routseServices: Get service of appointment with ID: ${id}`)
    const serviceId = await ssf.getAppointmentShopServiceID(id)
    res.json(serviceId[0][0].ShopServicesID)
})


module.exports = router;