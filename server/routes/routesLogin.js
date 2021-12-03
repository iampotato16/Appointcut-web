const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");

//Connection Pool
let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME,
});

//LOGIN
router
   .route("/")
   .get((req, res) => {
      var title = "Login in to AppointCut";
      res.render("login", { layout: "main", title });
   })
   .post(async (req, res) => {
      const { email, password } = req.body;
      acu.startConnection();

      //check admins table
      const rowsAdmin = await acu.getAllFrom("tbladmin");
      for (var i = 0; i < rowsAdmin.length; i++) {
         if (rowsAdmin[i].email == email && rowsAdmin[i].password == password) {
            res.redirect("/fileMaintenance");
         }
         true;
      }

      //check owners table
      const rowsOwner = await acu.getAllFrom("tblowner");
      for (var i = 0; i < rowsOwner.length; i++) {
         if (rowsOwner[i].email == email && rowsOwner[i].password == password) {
            res.redirect("/ownerAccount/view" + rowsOwner[i].OwnerID);
         }
         true;
      }

      //check desks table
      const rowsDesk = await acu.getAllFrom("appointcutdb.employee");
      for (var i = 0; i < rowsDesk.length; i++) {
         if (rowsDesk[i].Email == email && rowsDesk[i].Password == password) {
            res.redirect("/deskAccount/" + rowsDesk[i].ShopID);
         }
      }
   });

module.exports = router;
