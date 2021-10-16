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

// var trowBrgy = [
//    { 'BarangayID': '1', 'Name': 'West Triangle' },
//    { 'BarangayID': '2', 'Name': 'San Bartolome' },
//    { 'BarangayID': '3', 'Name': 'Batasan' },
//    { 'BarangayID': '4', 'Name': 'Tandang Sora' }
// ];



// function getBarangay(){
//    getAllFrom("barangay",rowBrgy)
//    if (!rowBrgy){
//       console.log("Barangay undefined, retrying")
//       setTimeout(function(){
//          getBarangay()
//       },2000);
//       console.log("Barangay after timeout: " + rowBrgy)
//    }
//    console.log("Continuing from getb")
// }




async function getAllFrom(table){
   var query = 'SELECT * FROM ' +table
   var rows =  await connection.query(query)
   return rows[0]
}
exports.viewFileMaintenance = async (req, res) => {
   var title = 'File Maintenance';
   
   var rowBrgy, rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization;
   var rowBrgy = await getAllFrom("barangay")
   var rowCategory = await getAllFrom("category")
   var rowCity = await getAllFrom("city")
   var rowFaceshape = await getAllFrom("faceshape")
   var rowHaircuts = await getAllFrom("haircuts")
   var rowServices = await getAllFrom("services")
   var rowSpecialization = await getAllFrom("specialization")

   res.render('file-maintenance', { layout: 'home-admin', title, rowBrgy, rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization });
}


