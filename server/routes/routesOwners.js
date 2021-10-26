const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()
const ModalConstructor = acu.ModalConstructor;
const mysql2 = require('mysql2/promise')

let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
})

const title = "Owners"

router.route('/')
   .get(async (req, res) => {
      await acu.startConnection();
      const rows = await acu.getAllFrom('tblowner')
         .catch(err => {
            console.error("Error getting all from customer:" + err)
         });
      // const rows = [{
      //     ID:2,
      //     givenName:"Zeraora",
      //     familyName:"Nominos",
      //     email:"NZora@gmail.com",
      //     contact:"09992415",
      //     password:"we really shouldnt be showing this"
      // }]

      const mc = new ModalConstructor(title);
      mc.setAddAction("/owners");
      mc.setEditAction("/owners/edit");
      mc.addField("Owner ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly");
      mc.addField("given Name", ModalConstructor.TYPE_TEXT);
      mc.addField("family Name", ModalConstructor.TYPE_TEXT);
      mc.addField("e-mail", ModalConstructor.TYPE_EMAIL);
      mc.addField("contact", ModalConstructor.TYPE_TEXT);
      mc.addField("status", ModalConstructor.TYPE_TEXT);
      mc.addField("password", ModalConstructor.TYPE_PASSWORD);

      const ownerModal = mc.construct();
      // res.json(rows)
      res.render('owners', { layout: 'home-admin', title, rows, ownerModal })
   })
   .post((req, res) => {
      var addInput = req.body;
        connection.query(`INSERT INTO tblowner SET firstName = ?, lastName = ?, email = ?, contact = ?, appStatusID = ?, password = ?`,
         [addInput["given Name"], addInput["family Name"], addInput["e-mail"], addInput["contact"],addInput["status"] ,addInput["password"]])
         .then(mess => { console.log('New Owner Added') })
         .catch(err => { console.log(err) });
        res.redirect('/owners');
   })

router.post('/edit', (req, res) => {
   const request = req.body;
    connection.query(`UPDATE tblowner SET firstName = ?, lastName = ?, email = ?, password = ?, contact = ?, appStatusID = ? WHERE OwnerID = ?`,
      [request["given Name"], request["family Name"], request["e-mail"], request["password"], request["contact"], request["status"], request["Owner ID"]])
      .then(mess => { console.log("Data Updated!") })
      .catch(err => { console.log(err) })
      res.redirect('/owners');

})


module.exports = router;