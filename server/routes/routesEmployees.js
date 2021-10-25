const acu = require('../../AppointCutUtils')
const ModalConstructor = acu.ModalConstructor
const express = require('express')
const router = express.Router()
const mysql2 = require('mysql2/promise')

let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

router.route('/')
   .get(async (req, res) => {
      const title = "Employee"
      await acu.startConnection();
      const rows = await acu.getAllFrom('tblEmployee')
         .catch(err => {
            console.error("Error getting all from customer:" + err)
         });

      //   const rows = [{
      //       ID:1,
      //       username:"SomeCut",
      //       givenName:"Cinder",
      //       familyName:"Carter",
      //       EmployeeTypeID:1,
      //       shopID:14,
      //       salaryTypeValue:5000,
      //       salaryTypeID:1,
      //       balance:10000,
      //       password:"ewan"
      //   }]

      let mc = new ModalConstructor(title);
      mc.setAddAction("/employees");
      mc.setEditAction("/employees/edit")
      mc.addField("ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly")
      mc.addField("Username", ModalConstructor.TYPE_TEXT);
      mc.addField("Password", ModalConstructor.TYPE_PASSWORD);
      mc.addField("Given Name", ModalConstructor.TYPE_TEXT);
      mc.addField("Family Name", ModalConstructor.TYPE_TEXT);
      mc.addField("Employee Type", ModalConstructor.TYPE_TEXT);
      mc.addField("Shop", ModalConstructor.TYPE_TEXT);
      mc.addField("Salary Value", ModalConstructor.TYPE_TEXT);
      mc.addField("Salary Type", ModalConstructor.TYPE_TEXT, "", "true");
      mc.addField("Balance", ModalConstructor.TYPE_TEXT);
      let employeeModal = mc.construct();

      res.render('employees', { layout: 'home-admin', title, rows, employeeModal });
   })
   .post((req, res) => {
      var addInput = req.body;
      connection.query(`INSERT INTO tblemployee SET username = ?, password = ?, firstName = ?, lastName = ?, employeeTypeID = ?, ShopID = ?, salaryTypeValue = ?, salaryTypeID = ?, balance = ?`, 
      [addInput["Username"], addInput["Password"], addInput["Given Name"], addInput["Family Name"], addInput["Employee Type"], addInput["Shop"], addInput["Salary Value"], addInput["Salary Type"], addInput["balanace"]])
         .then(mess => { console.log('new owner added') })
         .catch(err => { console.log(err) });
      console.log("Received post request at customerPost with request: ", [addInput]);
      res.redirect('/employees');
   })

router.post('/edit', async (req, res) => {
   const request = req.body;

   // connection.query(`UPDATE appointcutdb.tblemployee SET username = ?, password = ?, firstName = ?, lastName = ?, employeeTypeID = ?, ShopID = ?, salaryTypeValue = ?, salaryTypeID = ?`, 
   // [Username, password, GivenName, FamilyName, EmployeeType ,Shop, SalaryValue, SalaryType])
   // .then(es => { console.log('Data Added!') })
   // .catch("MALING MALI KA!")
      connection.query(`UPDATE tblemployee SET username = ?, password = ?, firstName = ?, lastName = ?, employeeTypeID = ?, ShopID = ?, salaryTypeValue = ?, salaryTypeID = ?, balance = ? WHERE EmployeeID = ?`,
      [request["Username"], request["Password"], request["Given Name"], request["Family Name"],request["Employee Type"] , request["Shop"], request["Salary Value"], request["Salary Type"], request["Balance"],request["ID"]])
      .then(mess => { console.log("Data Updated!")})
      .catch(err => { console.log(err) })
      res.redirect('/employees')
   })


router.route('/specializations')
   .get(async (req, res) => {
      const title = "Specializations"
      await acu.startConnection();
      // const rows = await acu.getAllFrom('tblEmployees')
      //     .catch(err => {
      //         console.error("Error getting all from customer:" + err)
      //     });

      const rows = [{
         ID: 1,
         shopServiceID: "14",
         employeeID: "2"
      }]

      let mc = new ModalConstructor(title);
      mc.setAddAction("/employees");
      mc.setEditAction("/employees/edit")
      mc.addField("ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly")
      mc.addField("Shop Service", ModalConstructor.TYPE_TEXT);
      mc.addField("Employee", ModalConstructor.TYPE_TEXT);
      let specializationModal = mc.construct();

      res.render('specializations', { layout: 'home-admin', title, rows, specializationModal });
   })
   .post((req, res) => {
      var addInput = req.body;
      console.log("Received post request at customerPost with request: ", [addInput]);
      res.redirect('/employees/specializations');
   })

module.exports = router;


