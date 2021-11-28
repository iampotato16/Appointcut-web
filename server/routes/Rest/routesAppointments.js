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
const apm = new AppointmentsManager(connection)

const UserFetch = require('../../../classes/UserFetch')

const TokenManager = require('../../../classes/TokenManager')
const tm = new TokenManager(connection)

//Path : /rest/appointments
router.route('/')
.post(async (req, res) => {
    console.log("D/routesAppt: " + JSON.stringify(req.body))
    const apt = req.body
    const auth = await tm.verifyToken(apt.userToken)

    //only customers can set appointments
    if(auth.userType != UserFetch.UserAuthStatus.CUSTOMER){
        console.log("Appointment made by not a customer")
        res.sendStatus(401)
        return
    }

    if(await apm.setAppointment(apt)){
        console.log("Appointment made by customer")
        res.sendStatus(200)
        return
    }

    console.log("Appointment request invalid")
    res.sendStatus(400)
})

module.exports = router