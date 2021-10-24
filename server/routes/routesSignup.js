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

//LOGIN
router.route('/')
   .get((req, res) => {
      var title = "Create an Account"
      res.render('signup', { layout: 'main', title });
   })
   .post(async (req, res) => {
      const { username, firstName, lastName, email, password, contactNum, city, brgy } = req.body;
      connection.query('INSERT INTO tblowners SET username = ?, firstName = ?, lastName - ?, email = ?, password = ?, contactNum = ?, city = ?, brgy = ?', [username, firstName, lastName, email, password, contactNum, city, brgy])
         .then(mess => { console.log('new owner added') })
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
