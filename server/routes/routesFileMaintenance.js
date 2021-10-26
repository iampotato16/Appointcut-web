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
   connection.query('UPDATE tbl' + dataName + ' SET name = ? WHERE ' + dataName + 'ID = ?', [input, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

//SERVICES TABLE FUNCTIONS
function addData2(dataName, que, input1, input2, res) {
   connection.query('INSERT INTO tbl' + dataName + ' ' + que, [input1, input2])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

function editData2(dataName, que, input1, input2, req, res) {
   connection.query('UPDATE tbl' + dataName + ' ' + que, [input1, input2, req.params.id])
      .catch(err => { console.log(err) })
      .then(mess => { res.redirect('/fileMaintenance') });
}

//VIEW FILE MAINTENANCE
router.get('/', async (req, res) => {
   //GET DATA IN FM TABLES
   acu.startConnection()
   var title = 'File Maintenance';
   var rowBrgy = await acu.getAllFromBarangay("tblbarangay")
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
   var updatedBrgyCity = req.body.inputEditBrgyCity;
   editData2('barangay', 'SET name = ?, cityID = ? WHERE barangayID = ?', updatedBrgy, updatedBrgyCity, req, res);
});

//CATEGORY
router.post('/addCategory', (req, res) => {
   var newBrgy = req.body.inputAddBrgy;
   addData2('category', newBrgy, res);
});

router.get('/removeCategory:id', (req, res) => {
   deleteData('category', req, res);
});

router.post('/editCategory:id', (req, res) => {
   var updatedBrgy = req.body.inputEditBrgy;
   var updatedBrgyCity = req.body.inputEditBrgyCity;
   editData2('category', updatedBrgy, req, res);
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
   addData2('services', 'SET name = ?, categoryID = ?', newServices, newCategoryServ, res)

});
router.get('/removeServices:id', (req, res) => {
   deleteData('services', req, res);

});
router.post('/editServices:id', (req, res) => {
   var updatedServices = req.body.inputEditServices;
   var updatedCategoryServ = req.body.inputEditCategory;
   editData2('services', 'SET name = ?, categoryID = ? WHERE ServicesID = ?', updatedServices, updatedCategoryServ, req, res)
});

module.exports = router;