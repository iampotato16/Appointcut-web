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
const nodemailer = require('nodemailer')


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

//Path: /rest/register/mailtest
router.route('/mailtest')
.get(async (req,res) => {
    const transporter = nodemailer.createTransport({
        port: 25,
        host: 'localhost',
        tls: {
            rejectUnauthorized: false
        },
    })

    var message = {
        from: 'Fietryel@appointcut.online',
        to : 'enairu62@gmail.com',
        subject: 'Test Email',
        text: 'Please Believe me',
        html: '<p>I cant\'s stop loving you</p>'
    }

    transporter.sendMail(message, (error, info) => {
        if (error){
            return console.log(`Mail errror: ${error}`)
        }
        console.log('Message sent: %s', info.messageId)
    })


})

//Path: /rest/register/token/
router.route('/token/:token')
.get(async (req,res) => {
    res.send(`Token: ${req.params.token}`)
})

module.exports = router