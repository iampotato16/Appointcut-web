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
const UserFetch = require("../../../classes/UserFetch")
const uf = new UserFetch.UserFetch(connection)


//Path: /rest/register
router.route('/')
.post(async (req,res) => {
    console.log(JSON.stringify(req.body))
    request = req.body

    try {
        await uf.registerUser(request.firstName, request.lastName,request.email, request.password,request.contact)
        res.json(0)
    } catch (error) {
        console.log(JSON.stringify(error))
        res.json(2)
    }
})



module.exports = router