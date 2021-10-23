const express = require('express');
const router = express.Router();
const mysql2 = require('mysql2/promise');
const { json, application } = require('express');
const acu = require('../../AppointCutUtils')

//Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

//SIMPLE TABLE FUNCTIONS
function addData(dataName, input, res) {
   connection.query('INSERT INTO tbl' + dataName + ' SET name = ?', [input])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

function deleteData(dataName, req, res) {
   connection.query('DELETE FROM tbl' + dataName + ' WHERE ' + dataName + 'ID = ?', [req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

function editData(dataName, input, req, res) {
   connection.query('UPDATE ' + dataName + ' SET name = ? WHERE ' + dataName + 'ID = ?', [input, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

//SERVICES TABLE FUNCTIONS
function servAddData(dataName, inputService, inputCategory, res) {
   connection.query('INSERT INTO tblservices SET name = ?, categoryID = ?', [inputService, inputCategory])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

function servEditData(dataName, inputService, inputCategory, req, res) {
   connection.query('UPDATE tblservices SET name = ?, categoryID = ? WHERE ServicesID = ?', [inputService, inputCategory, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

//VIEW FILE MAINTENANCE
router.get('/', async (req, res) => {
   //GET DATA IN FM TABLES
   acu.startConnection()
   var title = 'File Maintenance';
   var rowBrgy = await acu.getAllFrom("tblbarangay")
   var rowCategory = await acu.getAllFrom("tblcategory")
   var rowCity = await acu.getAllFrom("tblcity")
   var rowHaircuts = await acu.getAllFrom("tblhaircuts")
   var rowServices = await acu.getAllFromServices("tblservices")
   var rowSpecialization = await acu.getAllFrom("tblemployeespecialization")

   res.render('file-maintenance', {
      layout: 'home-admin', title, rowBrgy, rowCategory, rowCity, rowHaircuts, rowServices, rowSpecialization
   });
});

//BRGY
router.post('/addBrgy', (req, res) => {
   var newBrgy = req.body.inputAddBrgy;
   addData('barangay', newBrgy, res);
});

router.get('/removeBrgy:id', (req, res) => {
   deleteData('barangay', req, res);
});

router.post('/editBrgy:id', (req, res) => {
   var updatedBrgy = req.body.inputEditBrgy;
   editData('barangay', updatedBrgy, req, res);
});

//CATEGORY
router.post('/addCategory', (req, res) => {
   var newBrgy = req.body.inputAddBrgy;
   addData('category', newBrgy, res);
});

router.get('/removeCategory:id', (req, res) => {
   deleteData('category', req, res);
});

router.post('/editCategory:id', (req, res) => {
   var updatedBrgy = req.body.inputEditBrgy;
   editData('category', updatedBrgy, req, res);
});

//CITY
router.post('/addCity', (req, res) => {
   var newCity = req.body.inputAddCity;
   addData('city', newCity, res);
});

router.get('/removeCity:id', (req, res) => {
   deleteData('city', req, res);
});

router.post('/editCity:id', (req, res) => {
   var updatedCity = req.body.inputEditCity;
   editData('city', updatedCity, req, res);
});

//HAIRCUT
router.post('/addHaircut', (req, res) => {
   var newHaircut = req.body.inputAddHaircut;
   addData('haircuts', newHaircut, res);
});

router.get('/removeHaircut:id', (req, res) => {
   deleteData('haircut', req, res);
});

router.post('/editHaircut:id', (req, res) => {
   var updatedHaircut = req.body.inputEditHaircut;
   editData('haircut', updatedHaircut, req, res);
});

//SERVICES
router.post('/addServices', async (req, res) => {
   var newServices = req.body.inputAddServices;
   var newCategoryServ = req.body.inputAddCategory;
   servAddData('services', newServices, newCategoryServ, res)

});
router.get('/removeServices:id', (req, res) => {
   deleteData('services', req, res);

});
router.post('/editServices:id', (req, res) => {
   var updatedServices = req.body.inputEditServices;
   var updatedCategoryServ = req.body.inputEditCategory;
   servEditData('services', updatedServices, updatedCategoryServ, req, res)
});

module.exports = router;