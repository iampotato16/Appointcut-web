const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const ModalConstructor = acu.ModalConstructor;
const multer = require("multer");
const path = require("path");

// Set The Storage Engine
const storage = multer.diskStorage({
   destination: "./permits/",
   filename: function (req, file, cb) {
      cb(
         null,
         file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
   },
});

// Init Upload
const upload = multer({
   storage: storage,
   limits: { fileSize: 1000000 },
   fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
   },
}).fields([
   {
      name: "birPermit",
      maxCount: 1,
   },
   {
      name: "busPermit",
      maxCount: 1,
   },
]);

// Check File Type
function checkFileType(file, cb) {
   // Allowed ext
   const filetypes = /jpeg|jpg|png|gif/;
   // Check ext
   const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
   );
   // Check mime
   const mimetype = filetypes.test(file.mimetype);

   if (mimetype && extname) {
      return cb(null, true);
   } else {
      cb("Error: Images Only!");
   }
}

//LOGIN
router
   .route("/")
   .get(async (req, res) => {
      acu.startConnection();
      var rowBrgy = await acu.getAllFromBarangay("tblbarangay");
      var rowCity = await acu.getAllFrom("tblcity");
      var title = "Create an Account";
      res.render("signup", { layout: "main", title, rowBrgy, rowCity });
   })
   .post(async (req, res) => {
      upload(req, res, async (err) => {
         //OWNER
         var { firstName, lastName, email, password, contact } = req.body;
         //SHOP
         var { shopName, shopEmail, shopContact, brgy, city, street } =
            req.body;
         //SHOP APPLICATION
         var { birPermit, busPermit } = req.files;
         console.log(birPermit[0].path, busPermit[0].path);
         acu.startConnection();
         //Insert owner details into owner
         var newOwner = await acu.insertInto(
            "tblowner (firstName, lastName, email, password, contact, status)",
            '( "' +
               firstName +
               '", "' +
               lastName +
               '","' +
               email +
               '","' +
               password +
               '","' +
               contact +
               '",1)'
         );
         //Insert shop details into shop table
         var newShop = await acu.insertInto(
            "tblshop (shopName, email, shopContact, cityID, barangayID, street, appStatus)",
            '( "' +
               shopName +
               '", "' +
               shopEmail +
               '","' +
               shopContact +
               '","' +
               city +
               '","' +
               brgy +
               '","' +
               street +
               '", 0)'
         );
         //Insert into shop application
         var newOwnerID = newOwner.insertId;
         var newShopID = newShop.insertId;

         await acu.insertInto(
            "tblshopownership (ownerID, shopID)",
            '( "' + newOwnerID + '","' + newShopID + '")'
         );

         await acu.insertInto(
            "tblshopapplication (bir_img, bir_fileName, bp_img, bp_fileName, shopID, ownerID)",
            '( "' +
               birPermit[0].path +
               '", "' +
               birPermit[0].filename +
               '","' +
               busPermit[0].path +
               '","' +
               busPermit[0].filename +
               '","' +
               newShopID +
               '","' +
               newOwnerID +
               '")'
         );
      });
      res.redirect("/");
   });

module.exports = router;
