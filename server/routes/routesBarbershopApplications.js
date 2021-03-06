const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const ModalConstructor = acu.ModalConstructor;

const title = "Barbershop Applications";

router.route("/").get(async (req, res) => {
   acu.startConnection();
   var rowsShopApplication = await acu.getAllFromWhere(
      "appointcutdb.shopapplication",
      "appStatus = 0"
   );
   console.log(rowsShopApplication);
   res.render("barbershopApplications", {
      layout: "home-admin",
      rowsShopApplication,
   });
});

router.route("/acceptApplication:shopID").get(async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblshop",
      "appStatus = 1",
      "shopID = " + req.params.shopID
   );
   //Add new barbershop schedule
   var dayName = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
   ];
   for (var i = 0; i < dayName.length; i++) {
      await acu.insertInto(
         "tblshopschedules (shopID, day, timeIn, timeOut, status)",
         '( "' +
            req.params.shopID +
            '", "' +
            dayName[i] +
            '", "08:00:00" , "17:00:00" , 1 )'
      );
   }
   res.redirect("/barberApps");
});

router.route("/rejectApplication:shopID").get(async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblshop",
      "appStatus = 2",
      "shopID = " + req.params.shopID
   );
   res.redirect("/barberApps");
});
module.exports = router;
