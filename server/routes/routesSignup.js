const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise')
const acu = require('../../AppointCutUtils')

//Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

//LOGIN
router.route('/')
   .get(async (req, res) => {
      acu.startConnection()
      var rowBrgy = await acu.getAllFromBarangay("tblbarangay")
      var rowCity = await acu.getAllFrom("tblcity")
      console.log(rowBrgy);
      var title = "Create an Account"
      res.render('signup', { layout: 'main', title, rowBrgy, rowCity });
   })
   .post(async (req, res) => {
      const { username, firstName, lastName, email, password, contactNum, city, brgy } = req.body;
      await connection.query('INSERT INTO tblshopapplication SET username = ?, firstName = ?, lastName = ?, email = ?, password = ?, contact = ?, city = ?, brgy = ?, appstatusID = 0', [username, firstName, lastName, email, password, contactNum, city, brgy])
         .then(mess => {
            console.log('new owner added')
            res.redirect('/login')
         })
         .catch(err => { console.log(err) });
   })

module.exports = router;

// < !-- =============
// Input: Name and ID
// Username: username 
// First Name: firstName
// Last Name: lastName
// Email: email
// Password: password
// Contact: contactNum
// City: city
// Baranggay: brgy
// ============== -->
