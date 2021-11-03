const acu = require('../../AppointCutUtils')
const ModalConstructor = acu.ModalConstructor
const express = require('express')
const router = express.Router()
const mysql2 = require('mysql2/promise')

//Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

const title = "Customers"

router.route('/')
    .get(async (req, res) => {
        await acu.startConnection();
        const rows = await acu.getAllFrom('tblCustomers')
            .catch(err => {
                console.error("Error getting all from customer:" + err)
            });
        
        let mc = new ModalConstructor(title);
        mc.setAddAction("/customers");
        mc.setEditAction("/customers/edit")
        mc.addField("ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly")
        mc.addField("Given Name",ModalConstructor.TYPE_TEXT);
        mc.addField("Family Name",ModalConstructor.TYPE_TEXT);
        mc.addField("E-Mail",ModalConstructor.TYPE_EMAIL);
        mc.addField("Contact",ModalConstructor.TYPE_TEXT);
        mc.addField("Password",ModalConstructor.TYPE_PASSWORD);
        mc.addField("Guest",ModalConstructor.TYPE_CHECKBOX,"1");
        mc.addField("Disabled",ModalConstructor.TYPE_CHECKBOX,"1");
        let customerModal = mc.construct();
            
        res.render('customers', { layout: 'home-admin', title , rows, customerModal});
    })
    .post((req, res) => {
        var addInput = req.body;
        connection.query(`INSERT INTO tblcustomers SET firstName = ?, lastName = ?, Email = ?, PasswordHash = ?, Contact = ?, IsGuest = ?, IsDisabled = ?`,
         [addInput["Given Name"], addInput["Family Name"], addInput["E-Mail"], addInput["Password"], addInput["Contact"], addInput["Guest"], addInput["Disabled"]])
         .then(mess => { console.log('New Customer Added') })
         .catch(err => { console.log(err) });
        res.redirect('/customers');
    })
router.post('/edit',(req,res)=>{
    const request = req.body;
    connection.query(`UPDATE tblcustomers SET firstName = ?, lastName = ?, Email = ?, PasswordHash = ?, Contact = ?, IsGuest = ?, IsDisabled = ? WHERE CustomersID = ?`,
      [request["Given Name"], request["Family Name"], request["E-Mail"], request["Password"], request["Contact"], request["Guest"], request["Disabled"], request["ID"]])
      .then(mess => { console.log("Data Updated!") })
      .catch(err => { console.log(err) })
      res.redirect('/customers');
})

//views
router.get('/view:id', async (req, res) => {
    const row1 = await connection.query('SELECT * FROM appointcutdb.customer WHERE CustomersID = ' + req.params.id);
    const row2 = await connection.query('SELECT * FROM appointcutdb.appointment WHERE CustomersID = ' + req.params.id); 
    const rowCust = row1[0][0]
    const rowAppt = row2[0]
    var title = rowCust.FullName    
    res.render('customersView', {layout: 'home-admin', title: title, rowCust, rowAppt})
})

router.post('/view:id/editCustomerInfo', (req, res) => {
    const {firstName, lastName, contact} = req.body
    console.log(firstName, lastName, contact)
}) 

module.exports = router;


