const acu = require("../../AppointCutUtils");
const ModalConstructor = acu.ModalConstructor;
const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");

const title = "Customers";

//CUSTOMER
router
   .route("/")
   .get(async (req, res) => {
      acu.startConnection();
      const rows = await acu.getAllFrom("appointcutdb.customer");
      res.render("customers", {
         layout: "home-admin",
         title,
         rows,
      });
   })
   //ADD CUSTOMER
   .post(async (req, res) => {
      var { lastName, firstName, email, contact, guest, status } = req.body;
      if (guest == null) {
         guest = 0;
      }
      if (status == null) {
         status = 0;
      }
      acu.startConnection();
      console.log(lastName, firstName, email, contact);
      await acu.insertInto(
         "tblcustomers (firstName, lastName, email, contact, status)",
         '( "' +
            firstName +
            '", "' +
            lastName +
            '", "' +
            email +
            '", "' +
            contact +
            '", 1 )'
      );
      res.redirect("/customers");
   });

//CUTSOMER => SET CUSTOMER AS INACTIVE
router.get("/setInactive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblcustomers", "status = 0", "CustomersID = " + id);
   res.redirect("/customers");
});

//CUSTOMER =? SET CUSTOMER AS ACTIVE
router.get("/setActive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblcustomers", "status = 1", "CustomersID = " + id);
   res.redirect("/customers");
});

//CUSTOMER => EDIT CUSTOMER
router.post("/edit:id", async (req, res) => {
   var { lastName, firstName, email, contact } = req.body;
   acu.startConnection();
   await acu.updateSet(
      "tblcustomers",
      'firstName = "' +
         firstName +
         '", lastName = "' +
         lastName +
         '", email = "' +
         email +
         '", contact = "' +
         contact +
         '"',
      "CustomersID = " + req.params.id
   );
   res.redirect("/customers");
});

//CUSTOMER VIEW
router.get("/view:id", async (req, res) => {
   acu.startConnection();
   const row1 = await acu.getAllFromWhere(
      "appointcutdb.customer",
      "CustomersID = " + req.params.id
   );
   const rowCust = row1[0];
   const rowApptApproved = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "CustomersID = " + req.params.id + ' AND appointmentstatus = "Approved"'
   );
   const rowApptNot = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "CustomersID = " + req.params.id + ' AND appointmentstatus != "Approved"'
   );
   const rowsShops = await acu.getAllFrom("tblshop");
   const rowsCategory = await acu.getAllFrom("tblcategory");
   const rowsEmployee = await acu.getAllFrom("tblemployee");
   var title = rowCust.FullName;
   res.render("customersView", {
      layout: "home-admin",
      title: title,
      rowCust,
      rowApptApproved,
      rowApptNot,
      rowsShops,
      rowsCategory,
      rowsEmployee,
   });
});

router.post("/view:id/editCustomerInfo", async (req, res) => {
   var { lastName, firstName, email, contact, status } = req.body;
   if (status == undefined) {
      status = 0;
   }
   acu.startConnection();
   await acu.updateSet(
      "tblcustomers",
      'firstName = "' +
         firstName +
         '", lastName = "' +
         lastName +
         '", email = "' +
         email +
         '", contact = "' +
         contact +
         '", status = "' +
         status +
         '"',
      "CustomersID = " + req.params.id
   );
   res.redirect("/customers/view" + req.params.id);
});

//CUSTOMER VIEWS => ADD APOINTMENT
router.post("/view:id/addCustomerAppointment", async (req, res) => {
   var { shop, service, employee, date, time } = req.body;
   var customerID = req.params.id;
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
      "tblappointment (CustomerID, ShopID, EmployeeID, ShopServicesID, TimeIn, TimeOut, Date, AmountDue, AppStatusID, AppointmentType )",
      '( "' +
         customerID +
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
   res.redirect("/customers/view" + req.params.id);
});

//CANCEL APPOINTMENTS
router.get("/view:customerID/cancelAppt:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = 3",
      "AppointmentID = " + id
   );
   res.redirect("/customers/view" + req.params.customerID);
});
module.exports = router;
