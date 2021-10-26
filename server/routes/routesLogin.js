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
      var title = "Login in to AppointCut"
      res.render('login', { layout: 'main', title });
   })
   .post(async (req, res) => {
      const { email, password } = req.body;
      let ems = await connection.query('SELECT * FROM tblowner WHERE Email = ?', [email])
      if (ems[0].length > 0) {
         let pass = await connection.query('SELECT * FROM tblowner WHERE password = ?', [password])
         if (pass[0].length > 0) {
            res.redirect('/fileMaintenance')
         }
         else {
            res.redirect('/login')
            console.log('Mali password mo beech')
         }
      } else {
         res.redirect('/login')
         console.log('Mali email mo beets')

      }

   })


module.exports = router;

