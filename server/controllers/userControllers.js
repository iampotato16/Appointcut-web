const mysql2 = require('mysql2');

// Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
});

// View Users
// exports.view = (req, res) => {
//    // User the connection
//    connection.query('SELECT * FROM user WHERE status = "active"', (err, rows) => {
//       // When done with the connection, release it
//       if (!err) {
//          let removedUser = req.query.removed;
//          res.render('home', { rows, removedUser });
//       } else {
//          console.log(err);
//       }
//       console.log('The data from user table: \n', rows);
//    });
// }

exports.viewLogin = (req, res) => {
   var title = "Login in to AppointCut"
   res.render('login', { layout: 'main', title });
}

//sample user data
const user = {
   username: 'Leila',
   password: 'sumPassword'
}

exports.login = (req, res) => {
   const { username, password } = req.body;
   if (username == user.username && password == user.password) {
      res.redirect('/file-maintenance');
   }
   else {
      console.log('failed to log in')
   }
}

// var rowBrgy = [
//    { 'BarangayID': '1', 'Name': 'West Triangle' },
//    { 'BarangayID': '2', 'Name': 'San Bartolome' },
//    { 'BarangayID': '3', 'Name': 'Batasan' },
//    { 'BarangayID': '4', 'Name': 'Tandang Sora' }
// ];

exports.viewFileMaintenance = async (req, res) => {
   var title = 'File Maintenance';
   var rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization;


   // res.render('file-maintenance',
   //    { layout: 'home-admin', title, usersMockDB, rowDataBrgy, rowDataCategory, rowDataCity, rowDataFaceShape, rowDataHaircuts, rowDataSpecialization, rowDataServices });


   // connection.query('SELECT * FROM barangay', (err, rows) => {
   //    // rowBrgy = JSON.parse(JSON.stringify(rows));
   //    var rowBrgy = rows;
   //    var title = 'file maintenance'
   //    if (!err) {
   //       res.render('file-maintenance', { layout: 'home-admin', rowBrgy, title });
   //    } else {
   //       console.log(err);
   //    }
   // })

   // function callback(rows) {
   //    rowBrgy = rows;
   // }



   connection.query('SELECT * FROM category', (err, rows) => {
      rowCategory = rows;
      console.log(rowCategory);
   });
   connection.query('SELECT * FROM city', (err, rows) => {
      rowCity = rows;
      console.log(rowCity);
   });
   connection.query('SELECT * FROM faceshape', (err, rows) => {
      rowFaceshape = rows;
      console.log(rowFaceshape);
   });
   // connection.query('SELECT * FROM haircuts', (err, rows) => {
   //    rowHaircuts = rows;
   //    console.log(rowHaircuts);
   // });
   // connection.query('SELECT * FROM services', (err, rows) => {
   //    rowServices = JSON.stringify(rows);
   //    // rowServices = rows;
   //    console.log(rowServices);
   // });
   // connection.query('SELECT * FROM specialization', (err, rows) => {
   //    if (err) {
   //       console.log(err);
   //    }
   //    else {
   //       console.log(rows);
   //    }
   //    // console.log(rows);
   //    // rowSpecialization = rows;
   //    // console.log(JSON.stringify(rowSpecialization));
   // });
   // res.render('file-maintenance', { layout: 'home-admin', title, rowBrgy });

}

   // , rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization
// 'barangay'
// 'category'
// 'city'
// 'faceshape'
// 'haircuts'
// 'services'
// 'specialization'


