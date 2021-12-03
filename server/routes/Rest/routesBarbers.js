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
const BarberFetch = require("../../../classes/BarberFetch")
const bf = new BarberFetch(connection)
const TokenManager = require("../../../classes/TokenManager")
const tm = new TokenManager(connection)
const UserFetch = require("../../../classes/UserFetch")
const uf = new UserFetch.UserFetch(connection)

//path : /rest/barbers
router.route('/fromshop/:id')
.get(async (req, res) =>{
    const id = req.params.id
    const barbers = await bf.getBarbersFromShop(id)
    res.json(barbers)
})

//path : /rest/barbers
router.route('/:id')
.get(async (req, res) =>{
    const id = req.params.id
    const barber = await bf.getBarber(id)
    res.json(barber)
})

//path: /rest/barbers
router.route('/withshopservice/:id')
.get(async(req,res) =>{
    const id = req.params.id
    console.log(`D/routesBarbers: specialization id: ${id}`);
    const barbers = await bf.getBarbersWithSpecialization(id)
    res.json(barbers)
})

//path: /rest/barbers
router.route('/appointments/:barberId-:month-:year')
.get(async(req,res) => {
    const barberId = req.params.barberId
    const month = req.params.month
    const year = req.params.year
    console.log(`D/routesBarbers: schedule id: ${barberId}, month ${month}, year ${year}`)
    const appointments = await bf.getBarberAppointmentForMonthYear(barberId,month,year)

    res.json(appointments)
})

//path: /rest/barbers
router.route('/appointmentsview/:token-:day-:month-:year')
.get(async (req,res) => {
    

    const token = req.params.token
    console.log(token)
    const month = req.params.month
    const year = req.params.year
    const day = req.params.day
    console.log(`D/RoutesBarber: AppointmentsFull ${token}-${day}-${month}-${year}`)

    const auth = await tm.verifyToken(token)
    console.log(JSON.stringify(auth))
    if(auth.userType != UserFetch.UserAuthStatus.BARBER){
        res.sendStatus(401)
        return
    }

    const barberName = await uf.getEmployeeDetailsFromId(auth.userID)
    const appointments = await bf.getBarberAppointmentView(`"${barberName.firstName} ${barberName.lastName}"`, day, month, year)
    res.json(appointments[0])
})

//path: /rest/barbers
router.route('/schedule/:barberId')
.get(async (req, res) => {
    const barberId = req.params.barberId
    sched = await bf.getBarberSched(barberId)

    res.json(sched)
})

module.exports = router