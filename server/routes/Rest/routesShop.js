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
const ShopFetch = require('../../../classes/ShopFetch');
const sf = new ShopFetch(connection)

//Path: /rest/shops
router.route("/")
.get(async (req,res) => {
    console.log("D/routesShop: Get request on shop")
    shops = await sf.getShops()
    res.json(shops)
})

//Path: /rest/shops/services
router.route("/services/:id")
.get(async (req,res)=>{
    const id = req.params.id
    console.log("D/routesShop: Get request on shop/services")
    const services = await sf.getShopServices(id)
    res.json(services[0])
})

module.exports = router
