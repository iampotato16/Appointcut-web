const express = require('express');
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

//LOGIN
exports.viewLogin = (req, res) => {
   var title = "Login in to AppointCut"
   res.render('login', { layout: 'main', title });
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

async function getAllFromServices() {
   var query = 'SELECT Services.ServicesID, Services.Name, Category.Name as Category FROM Services INNER JOIN Category ON Services.CategoryID = Category.CategoryID'
   var rows = await connection.query(query)
   return rows[0]
}

exports.viewFileMaintenance = async (req, res) => {
   var title = 'File Maintenance';
   var rowBrgy = await getAllFrom("barangay")
   var rowCategory = await getAllFrom("category")
   var rowCity = await getAllFrom("city")
   var rowFaceshape = await getAllFrom("faceshape")
   var rowHaircuts = await getAllFrom("haircuts")
   var rowServices = await getAllFromServices("services")
   var rowSpecialization = await getAllFrom("specialization")

   res.render('file-maintenance', {
      layout: 'home-admin', title, rowBrgy, rowCategory, rowCity, rowFaceshape, rowHaircuts, rowServices, rowSpecialization
   });
}

//BARANGAY
exports.addBrgy = (req, res) => {
   var newBrgy = req.body.inputAddBrgy;
   connection.query('INSERT INTO barangay SET name = ?', [newBrgy])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeBrgy = (req, res) => {
   connection.query('DELETE FROM barangay WHERE BarangayID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editBrgy = (req, res) => {
   var updatedBrgy = req.body.inputEditBrgy;
   connection.query('UPDATE barangay SET name = ? WHERE BarangayID = ?', [updatedBrgy, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}


//CATEGORY
exports.addCategory = (req, res) => {
   var newCategory = req.body.inputAddCategory;
   connection.query('INSERT INTO category SET Name = ?', [newCategory])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });

}

exports.removeCategory = (req, res) => {
   connection.query('DELETE FROM category WHERE CategoryID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editCategory = (req, res) => {
   var updatedCategory = req.body.inputEditCategory;
   connection.query('UPDATE category SET name = ? WHERE CategoryID = ?', [updatedCategory, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//SPECIALIZATION
exports.addSpec = (req, res) => {
   var newSpec = req.body.inputAddSpec;
   connection.query('INSERT INTO specialization SET name = ?', [newSpec])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeSpec = (req, res) => {
   connection.query('DELETE FROM specialization WHERE SpecializationID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editSpec = (req, res) => {
   var updatedSpec = req.body.inputEditSpec;
   connection.query('UPDATE specialization SET name = ? WHERE SpecializationID = ?', [updatedSpec, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//CITY
exports.addCity = (req, res) => {
   var newCity = req.body.inputAddCity;
   connection.query('INSERT INTO city SET name = ?', [newCity])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeCity = (req, res) => {
   connection.query('DELETE FROM city WHERE CityID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editCity = (req, res) => {
   var updatedCity = req.body.inputEditCity;
   connection.query('UPDATE city SET name = ? WHERE CityID = ?', [updatedCity, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//FACE SHAPE
exports.addFaceShape = (req, res) => {
   var newFaceShape = req.body.inputAddFaceShape;
   connection.query('INSERT INTO faceShape SET name = ?', [newFaceShape])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeFaceShape = (req, res) => {
   connection.query('DELETE FROM faceShape WHERE FaceShapeID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editFaceShape = (req, res) => {
   var updatedFaceShape = req.body.inputEditFaceShape;
   connection.query('UPDATE faceShape SET name = ? WHERE FaceShapeID = ?', [updatedFaceShape, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//HAIRCUT
exports.addHaircut = (req, res) => {
   var newHaircut = req.body.inputAddHaircut;
   connection.query('INSERT INTO haircut SET name = ?', [newHaircut])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeHaircut = (req, res) => {
   connection.query('DELETE FROM haircut WHERE HaircutsID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editHaircut = (req, res) => {
   var updatedHaircut = req.body.inputEditHaircut;
   connection.query('UPDATE haircut SET name = ? WHERE HaircutsID = ?', [updatedHaircut, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//USER TYPE
exports.addUserType = (req, res) => {
   var newUserType = req.body.inputAddUserType;
   connection.query('INSERT INTO userType SET name = ?', [newUserType])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.removeUserType = (req, res) => {
   connection.query('DELETE FROM userType WHERE userTypeID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editUserType = (req, res) => {
   var updatedUserType = req.body.inputEditUserType;
   connection.query('UPDATE userType SET name = ? WHERE userTypeID = ?', [updatedUserType, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

//SERVICES
exports.addServices = async (req, res) => {
   var newServices = req.body.inputAddServices;
   var newCategoryServ = req.body.inputAddCategory;
   connection.query('INSERT INTO services SET name = ?, categoryID = ?', [newServices, newCategoryServ])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });

}

exports.removeServices = (req, res) => {
   connection.query('DELETE FROM Services WHERE ServicesID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

exports.editServices = (req, res) => {
   var updatedServices = req.body.inputEditServices;
   var updatedCategoryServ = req.body.inputEditCategory;
   connection.query('UPDATE Services SET name = ?, categoryID = ? WHERE ServicesID = ?', [updatedServices, updatedCategoryServ, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/file-maintenance') });
}

