const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const ModalConstructor = acu.ModalConstructor;
const mysql2 = require("mysql2/promise");

const title = "Owners";

router
   .route("/")
   .get(async (req, res) => {
      acu.startConnection();
      const rows = await acu.getAllFrom("appointcutdb.owner");
      const rowShop = await acu.getAllFrom("appointcutdb.shop");
      res.render("owners", { layout: "home-admin", title, rows, rowShop });
   })
   .post(async (req, res) => {
      acu.startConnection();
      var { lastName, firstName, email, contact, status, shop } = req.body;
      if (status == null) {
         status = 0;
      }
      var newOwner = await acu.insertInto(
         "tblowner (firstName, lastName, email, contact, status)",
         '( "' +
            firstName +
            '", "' +
            lastName +
            '", "' +
            email +
            '", "' +
            contact +
            '", "' +
            status +
            '" )'
      );
      await acu.insertInto(
         "tblshopownership (shopID, ownerID)",
         '( "' + shop + '", "' + newOwner.insertId + '" )'
      );
      res.redirect("/owners");
   });

router.post("/edit:id", async (req, res) => {
   var { lastName, firstName, email, contact, status } = req.body;
   if (status == null) {
      status = 0;
   }
   acu.startConnection();
   await acu.updateSet(
      "tblowner",
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
      "OwnerID = " + req.params.id
   );
   res.redirect("/owners");
});

router.get("/setInactive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblowner", "status = 0", "OwnerID = " + id);
   res.redirect("/owners");
});

router.get("/setActive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblowner", "status = 1", "OwnerID = " + id);
   res.redirect("/owners");
});

//owner views
router
   .route("/view:ownerId")
   .get(async (req, res) => {
      acu.startConnection();
      const rows = await acu.getOneFromWhere(
         "appointcutdb.owner",
         "OwnerID = " + req.params.ownerId
      );
      var shopId = rows.OwnerID;
      const rowsBS = await acu.getAllFromWhere(
         "appointcutdb.shop",
         "OwnerID = " + shopId
      );
      var title = rows.firstName + " " + rows.lastName;
      res.render("ownersView", {
         layout: "home-admin",
         title: title,
         rows,
         rowsBS,
      });
   })
   .post(async (req, res) => {});

router.get("/view:ownerId/setInactive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblshop", "status = 0", "ShopID = " + id);
   res.redirect("/owners/view" + req.params.ownerId);
});

router.get("/view:ownerId/setActive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblshop", "status = 1", "ShopID = " + id);
   res.redirect("/owners/view" + req.params.ownerId);
});

//edit owner in owner views
router.post("/view:id/edit:id", async (req, res) => {
   var { lastName, firstName, email, contact, status } = req.body;
   if (status == null) {
      status = 0;
   }
   acu.startConnection();
   await acu.updateSet(
      "tblowner",
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
      "OwnerID = " + req.params.id
   );
   res.redirect("/owners/view" + req.params.id);
});

//owner => barbershop views
router
   .route("/view:ownerId/viewShop:shopId")
   .get(async (req, res) => {
      var ownerID = req.params.ownerId;
      var shopID = req.params.shopId;
      acu.startConnection();
      var rowShop = await acu.getAllFromWhere(
         "appointcutdb.shop",
         "ShopID = " + req.params.shopId
      );
      var title = rowShop[0].ShopName;
      const days = [
         { name: "Monday" },
         { name: "Tuesday" },
         { name: "Wednesday" },
         { name: "Thursday" },
         { name: "Friday" },
         { name: "Saturday" },
         { name: "Sunday" },
      ];
      const rowSched = await acu.getAllFrom("tblschedule");
      const rowServices = await acu.getAllFrom("tblservices");
      const rowsServCategory = await acu.getAllFrom("tblcategory");
      const rowsEmpType = await acu.getAllFrom("tblemployeetype");
      const rowsSalaryType = await acu.getAllFrom("tblsalarytype");
      const rowsEmp = await acu.getAllFromWhere(
         "appointcutdb.employee",
         "ShopID = " + req.params.shopId
      );
      const rowsServ = await acu.getAllFromWhere(
         "appointcutdb.services",
         "shopID = " + req.params.shopId
      );
      const rowsApptApproved = await acu.getAllFromWhere(
         "appointcutdb.appointment",
         "shopID = " + req.params.shopId + ' AND appointmentstatus = "Approved"'
      );
      const rowsApptHistory = await acu.getAllFromWhere(
         "appointcutdb.appointment",
         "shopID = " +
            req.params.shopId +
            ' AND appointmentstatus != "Approved"'
      );
      res.render("ownersBarbershopsView", {
         layout: "home-admin",
         title: title,
         days,
         ownerID,
         shopID,
         rowSched,
         rowServices,
         rowsServCategory,
         rowsEmp,
         rowsServ,
         rowsApptApproved,
         rowsApptHistory,
         rowsEmpType,
         rowsSalaryType,
      });
   })
   .post(async (req, res) => {
      acu.startConnection();
      //add employee
      var {
         lastName,
         firstName,
         email,
         contact,
         employeeType,
         salaryType,
         salaryValue,
      } = req.body;
      var newEmp = await acu.insertInto(
         "tblemployee (firstname, lastname, email, contact, employeeTypeID,  salaryTypeID, salaryTypeValue, status, balance, shopID)",
         '( "' +
            firstName +
            '", "' +
            lastName +
            '", "' +
            email +
            '", "' +
            contact +
            '", "' +
            employeeType +
            '", "' +
            salaryType +
            '", "' +
            salaryValue +
            '", 1, 0, "' +
            req.params.shopId +
            '" )'
      );

      //add schedule
      var { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday } =
         req.body;
      var { timeIn, timeOut } = req.body;
      var days = [
         Monday,
         Tuesday,
         Wednesday,
         Thursday,
         Friday,
         Saturday,
         Sunday,
      ];
      var dayName = [
         "Monday",
         "Tuesday",
         "Wednesday",
         "Thursday",
         "Friday",
         "Saturday",
         "Sunday",
      ];
      for (var i = 0; i < days.length; i++) {
         if (days[i] == undefined) {
            await acu.insertInto(
               "tblschedule (employeeID, date, timeIn, timeOut)",
               '( "' +
                  newEmp.insertId +
                  '", "' +
                  dayName[i] +
                  '", null , null )'
            );
         } else {
            await acu.insertInto(
               "tblschedule (employeeID, date, timeIn, timeOut)",
               '( "' +
                  newEmp.insertId +
                  '", "' +
                  dayName[i] +
                  '", "' +
                  timeIn[i] +
                  '", "' +
                  timeOut[i] +
                  '" )'
            );
         }
      }

      //redirect to page
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   });

router.get(
   "/view:ownerId/viewShop:shopId/setInactiveEmp:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet("tblemployee", "status = 0", "EmployeeID = " + id);
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   }
);

router.get(
   "/view:ownerId/viewShop:shopId/setActiveEmp:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet("tblemployee", "status = 1", "EmployeeID = " + id);
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   }
);

router.get(
   "/view:ownerId/viewShop:shopId/setInactiveServ:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet("tblservices", "status = 0", "ServicesID = " + id);
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   }
);

router.get(
   "/view:ownerId/viewShop:shopId/setActiveServ:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet("tblservices", "status = 1", "ServicesID = " + id);
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   }
);

//CANCEL APPOINTMENTS
router.get("/view:ownerId/viewShop:shopId/cancelAppt:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = 3",
      "AppointmentID = " + id
   );
   res.redirect(
      "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
   );
});

//COMPLETE APPOINTMENTS
router.post(
   "/view:ownerId/viewShop:shopId/completeAppt:id",
   async (req, res) => {
      var id = req.params.id;
      var appointmentStatus = req.body.appointmentStatus;
      acu.startConnection();
      await acu.updateSet(
         "tblappointment",
         "appStatusID = " + appointmentStatus,
         "AppointmentID = " + id
      );
      res.redirect(
         "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
      );
   }
);

//owner => barbershop views => edit employee
router.post("/view:ownerId/viewShop:shopId/editEmp:empId", async (req, res) => {
   acu.startConnection();

   //update employee info
   var {
      lastName,
      firstName,
      email,
      contact,
      employeeType,
      salaryType,
      salaryValue,
      status,
   } = req.body;
   await acu.updateSet(
      "tblemployee",
      'firstName = "' +
         firstName +
         '", lastName = "' +
         lastName +
         '", email = "' +
         email +
         '", contact = "' +
         contact +
         '", employeeTypeID = "' +
         employeeType +
         '", salaryTypeID = "' +
         salaryType +
         '", salaryTypeValue = "' +
         salaryValue +
         '", shopID = "' +
         req.params.shopId +
         '"',
      "employeeID = " + req.params.empId
   );

   //update employee schedule
   var { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday } =
      req.body;
   var { timeIn, timeOut } = req.body;
   var days = [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday];
   var dayName = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
   ];
   for (var i = 0; i < days.length; i++) {
      if (days[i] == undefined) {
         await acu.updateSet(
            "tblschedule",
            "timeIn = null, timeOut = null",
            'Date = "' +
               dayName[i] +
               '" AND EmployeeID = "' +
               req.params.empId +
               '"'
         );
      } else {
         await acu.updateSet(
            "tblschedule",
            'timeIn = "' + timeIn[i] + '", timeOut = "' + timeOut[i] + '"',
            'Date = "' +
               dayName[i] +
               '" AND EmployeeID = "' +
               req.params.empId +
               '"'
         );
      }
   }

   res.redirect(
      "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
   );
});

//owner => barbershop views => add service
router.post("/view:ownerId/viewShop:shopId/addService", async (req, res) => {
   var { service, price, duration } = req.body;
   acu.startConnection();
   acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      '( "' +
         req.params.shopId +
         '", "' +
         service +
         '", "' +
         price +
         '", "' +
         duration +
         '" )'
   );
   res.redirect(
      "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
   );
});

//owner => barbershop views => edit service
router.post("/view:ownerId/viewShop:shopId/edit:servId", async (req, res) => {
   var { editService, editPrice, editDuration } = req.body;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      'shopID = "' +
         req.params.shopId +
         '", servicesID = "' +
         editService +
         '", price = "' +
         editPrice +
         '", duration = "' +
         editDuration +
         '"',
      "ShopServicesID = " + req.params.servId
   );
   res.redirect(
      "/owners/view" + req.params.ownerId + "/viewShop" + req.params.shopId
   );
});
module.exports = router;
