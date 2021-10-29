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


router.route('/')

   .get(async (req, res) => {
      let title = "Shops"
      await acu.startConnection();
      const rows = await acu.getAllFrom('tblshop')
         .catch(err => {
            console.error("Error getting all from shop:" + err)
         });
      // const rows = [{
      //     "ID":1,
      //     "ownerID":12,
      //     "shopName":"Ang Bohok",
      //     "longitude":12.42,
      //     "latitude":135.63,
      //     "address":"Your moms house",
      //     "contact":"099912412",
      //     "email":"mamamo@gmail.com",
      //     "barangayID":2,
      //     "cityID":3
      // }]

      const mc = new ModalConstructor(title);
      mc.setAddAction('/shops');
      mc.setEditAction('/shops/edit');
      mc.addField("Shop ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly")
      mc.addField("Shop Name", ModalConstructor.TYPE_TEXT);
      mc.addField("Owner ID", ModalConstructor.TYPE_TEXT);
      mc.addField("Longtitude", ModalConstructor.TYPE_TEXT);
      mc.addField("Latitude", ModalConstructor.TYPE_TEXT);
      mc.addField("Address", ModalConstructor.TYPE_TEXT);
      mc.addField("Contact", ModalConstructor.TYPE_TEXT);
      mc.addField("E-mail", ModalConstructor.TYPE_EMAIL);
      mc.addField("Barangay ID", ModalConstructor.TYPE_TEXT);
      mc.addField("City ID", ModalConstructor.TYPE_TEXT);

      let shopsModal = mc.construct();
      // res.json(rows);
      res.render('shops', { layout: 'home-admin', title, rows, shopsModal });
   })
   .post((req, res) => {
      var addInput = req.body;
        connection.query(`INSERT INTO tblshop SET shopName = ?, OwnerID = ?, longtitude = ?, latitude = ?, address = ?, contact = ?, email = ?, BarangayID = ?, CityID = ?`,
         [addInput["Shop Name"], addInput["Owner ID"], addInput["Longtitude"], addInput["Latitude"],addInput["Address"] ,addInput["Contact"], addInput["E-mail"], addInput["Barangay ID"], addInput["City ID"]])
         .then(mess => { res.redirect('/shops')})
         .catch(err => { console.log(err) });
        
   })

router.post("/edit", (req, res) => {
   var request = req.body;
        connection.query(`UPDATE tblshop SET shopName = ?, OwnerID = ?, longtitude = ?, latitude = ?, address = ?, contact = ?, email = ?, BarangayID = ?, CityID = ? WHERE ShopID = ?`,
         [request["Shop Name"], request["Owner ID"], request["Longtitude"], request["Latitude"],request["Address"] ,request["Contact"], request["E-mail"], request["Barangay ID"], request["City ID"], request["Shop ID"]])
         .then(mess => { res.redirect('/shops')})
         .catch(err => { console.log(err) });
        
})

//OwnerShip
router.route('/ownerShip')
   .get(async (req, res) => {
      let title = "Ownership"
      await acu.startConnection();
      const rows = await acu.getAllFrom('tblshopownership')
         .catch(err => {
            console.error("Error getting all from shopownership:" + err)
         });

      // const rows = [{
      //    "id": 1,
      //    "ownerID": 12,
      //    "shopID": 16,
      // }]

      const mc = new ModalConstructor(title);
      mc.setAddAction('/shops/ownerShip');
      mc.setEditAction('/shops/ownerShip/edit');
      mc.addField("ID", ModalConstructor.TYPE_TEXT, "", ModalConstructor.VISIBILITY_EDIT, "readonly");
      mc.addField("Owner ID", ModalConstructor.TYPE_TEXT);
      mc.addField("Shop ID", ModalConstructor.TYPE_TEXT);
      let ownershipModal = mc.construct();

      res.render('ownerships', { layout: 'home-admin', title, rows, ownershipModal });
   })
   .post((req, res) => {
      var addInput = req.body;
        connection.query(`INSERT INTO tblshopownership SET OwnerID = ?, ShopID = ?`,
         [addInput["Owner ID"], addInput["Shop ID"]])
         .then(mess => { res.redirect('/shops/ownerShip')})
         .catch(err => { console.log(err) });
        
   })

router.post("/ownerShip/edit", (req, res) => {
   var request = req.body;
   connection.query(`UPDATE tblshopownership SET OwnerID = ?, ShopID = ? WHERE ShopOwnerID = ?`,
         [request["Owner ID"], request["Shop ID"],request["ID"]])
         .then(mess => { res.redirect('/shops/ownerShip')})
         .catch(err => { console.log(err) });
})

module.exports = router;