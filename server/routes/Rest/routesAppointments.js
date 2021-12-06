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

const Payment = require('../../../classes/Payment')

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

    const appointmentID = await apm.setAppointment(apt)
    if(appointmentID > 0){
        console.log("Appointment made by customer")
        res.status(200).send(appointmentID+"")
        return
    }

    console.log("Appointment request invalid")
    res.sendStatus(400)
})

//Path : /rest/appointments/recordpayment
router.route('/recordpayment/:token-:aptid-:shopid-:amt')
.get(async (req,res) =>{
    //get the request
    const request = req.params
    console.log(JSON.stringify(request))

    //verify token
    var verification = await tm.verifyToken(request.token)
    if(verification == UserFetch.UserAuthStatus.TOKEN){
        res.sendStatus(401)//unauthorized
    }

    console.log(JSON.stringify(verification))
    //save to db
    //store payment details
    const payment = new Payment(request.aptid, request.shopid, verification.userID, request.amt)
    await apm.payAppointment(payment)
})

//Path : /rest/appointments/conflicts
router.route('/conflicts/:barberId-:year-:month-:date-:in-:out')
.get(async (req, res) => {
    const request = req.params
    const outTime = request.out
    var outHour = outTime.split(':')[0]
    const outMinute = outTime.split(':')[1]
    var outMinuteReduced = parseInt(outMinute)-1

    //correction for -1 minute
    if(outMinuteReduced == -1){
        outHour = parseInt(outHour) - 1
        outMinuteReduced = 59
    }

    const outTimeStitched = `${outHour}:${outMinuteReduced}`

    const conflicts = await apm.checkConflict(
        request.barberId, request.year, request.month, request.date, request.in, outTimeStitched
    )
    res.send(`${conflicts}`)
})

//Path: /rest/appointments/customer/completed
router.route('/customer/completed/:token')
.get(async (req,res) => {
    //verify the token
    const tokenInfo = await tm.verifyToken(req.params.token)
    //check if token is valid
    if(tokenInfo.userType != UserFetch.UserAuthStatus.CUSTOMER){
        res.sendStatus(401)
        return
    }

    //get user appointments
    const list = await apm.getCustomerAppointments(tokenInfo.userID, 'Completed')
    //respond with appointments
    res.json(list)
})

//Path: /rest/appointments/customer/approved
router.route('/customer/approved/:token')
.get(async (req,res) => {
    //verify the token
    const tokenInfo = await tm.verifyToken(req.params.token)
    //check if token is valid
    if(tokenInfo.userType != UserFetch.UserAuthStatus.CUSTOMER){
        res.sendStatus(401)
        return
    }

    //get user appointments
    const list = await apm.getCustomerAppointments(tokenInfo.userID, 'Approved')
    //respond with appointments
    res.json(list)
})

//Path: /rest/appointments/cancel
router.route('/cancel/:token-:id')
.get(async (req, res) => {
    const tokenInfo = await tm.verifyToken(req.params.token)
    //invalid token
    if(tokenInfo == UserFetch.UserAuthStatus.TOKEN){
        console.log("D/CancelAppt: Unauthorized user")
        res.sendStatus(401)
        return
    }

    const customerId = tokenInfo.userID
    console.log(`cancelAppt(${customerId}, ${req.params.id})`)
    const response = await apm.cancelAppointment(customerId, req.params.id)
    res.json(response)
})

module.exports = router