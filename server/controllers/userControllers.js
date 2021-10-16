const mysql2 = require('mysql2/promise');
const { json } = require('express');
const { get } = require('../routes/users');

// Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
});


// View Users
exports.view = (req, res) => {
   // User the connection
   connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
      // When done with the connection, release it
      if (!err) {
         let removedUser = req.query.removed;
         res.render('home', { rows, removedUser });
      } else {
         console.log(err);
      }
      console.log('The data from user table: \n', rows);
   });
}

exports.viewLogin = (req, res) => {
   var title = "Login in to AppointCut"
   res.render('login', { layout: 'main', title });
}

//sample user data
const user = {
   username: 'Leila',
   password: 'sumPassword'
}

exports.login = async (req, res) => {
   const { username, password } = req.body;
   if (username == user.username && password == user.password) {
      res.redirect('/file-maintenance');
   }
   else {
      console.log('failed to log in')
   }
}

async function getAllFrom(table) {
   var query = 'SELECT * FROM ' + table
   var rows = await connection.query(query)
   return rows[0]
}
exports.viewFileMaintenance = (req, res) => {
   var title = 'File Maintenance';

   var rowBrgy, rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization;
   var pBarangay = getAllFrom("barangay")
   var pCategory = getAllFrom("category")
   var pCity = getAllFrom("city")
   var pFaceShape = getAllFrom("faceshape")
   var pHaircuts = getAllFrom("haircuts")
   var pServices = getAllFrom("services")
   var pSpecialization = getAllFrom("specialization")
   pBarangay
      .then((message) => {
         rowBrgy = message
         pCategory.then((message) => {
            rowCategory = message
            //console.log(rowCategory)
            pCity.then((message) => {
               rowCity = message
               //console.log(rowCity)
               pFaceShape.then((message) => {
                  rowFaceshape = message
                  //console.log(rowFaceshape)
                  pHaircuts.then((message) => {
                     rowHaircuts = message
                     //console.log(rowHaircuts)
                     pServices.then((message) => {
                        rowServices = message
                        //console.log(rowServices)
                        pSpecialization.then((message) => {
                           rowSpecialization = message
                           //console.log(rowSpecialization)
                           res.render('file-maintenance', { layout: 'home-admin', title, rowBrgy, rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization });
                        })
                     })
                  })
               })
            })
         })
      })
      .catch((message) => {
         console.log(message)
      })
}

exports.addBrgy = (req, res) => {
   var newBrgy = req.body.inputBrgy;
   connection.query('INSERT INTO barangay SET name = ?', [newBrgy], (err, rows) => {
      // When done with the connection, release it
      if (!err) {
         console.log('addedd successfully')

      } else {
         console.log(err);
      }
   });
   res.redirect('/file-maintenance');
   location.reload();
}

exports.delete = (req, res) => {

   // Delete a record

   // User the connection
   // connection.query('DELETE FROM user WHERE id = ?', [req.params.id], (err, rows) => {

   //   if(!err) {
   //     res.redirect('/');
   //   } else {
   //     console.log(err);
   //   }
   //   console.log('The data from user table: \n', rows);

   // });

   // Hide a record

   connection.query('UPDATE user SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
      if (!err) {
         let removedUser = encodeURIComponent('User successeflly removed.');
         res.redirect('/?removed=' + removedUser);
      } else {
         console.log(err);
      }
      console.log('The data from beer table are: \n', rows);
   });
}

exports.removeBrgy = (req, res) => {
   var id = req.params.id;
   console.log(id);
   connection.query('DELETE FROM barangay WHERE BarangayID = ?', [id], (err, rows) => {
      if (!err) {
         res.redirect('/file-maintenance');
      } else {
         console.log(err);
      }
   });
}