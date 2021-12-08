const express = require("express");
const router = express.Router();
const acu = require("../../AppointCutUtils");

router
   .route("/")
   .get(async (req, res) => {
      var title = "AppointCut";

      acu.startConnection();
      var shops = await acu.getAllFromWhere(
         "appointcutdb.shop",
         "appStatus = 1"
      );

      var rowsCategory = await acu.getAllFrom("tblcategory");
      console.log(rowsCategory);

      res.render("customerOnline", {
         layout: "customerOnline",
         title: title,
         shops,
         rowsCategory,
      });
   })
   .post(async (req, res) => {
      var { shop, service, employee, date, time, name } = req.body;

      //Para kumuha ng values sa loob ng shop services
      acu.startConnection();
      var ss = await acu.getOneFromWhere(
         "tblshopservices",
         "shopServicesID =" + service
      );
      var amountDue = ss.Price;
      var timeIn = time;
      var timeHolder = new Date("1970-01-01 " + timeIn);
      //FOR TIMEOUT
      timeHolder.setTime(timeHolder.getTime() + 8 * 60 * 60 * 1000);
      timeHolder.setTime(timeHolder.getTime() + ss.Duration * 60000);
      var timeOut =
         Math.floor(timeHolder.getTime() / (1000 * 60 * 60)) +
         ":" +
         (Math.floor(timeHolder.getTime() / (1000 * 60)) % 60) +
         ":" +
         (Math.floor(timeHolder.getTime() / 1000) % 60);
      await acu.insertInto(
         "tblappointment (name, ShopID, EmployeeID, ShopServicesID, TimeIn, TimeOut, Date, AmountDue, AppStatusID, AppointmentType )",
         '( "' +
            name +
            '", "' +
            shop +
            '", "' +
            employee +
            '", "' +
            service +
            '", "' +
            timeIn +
            '", "' +
            timeOut +
            '", "' +
            date +
            '", "' +
            amountDue +
            '", 1, 1)'
      );
      res.redirect("/customerOnline");
   });

module.exports = router;
