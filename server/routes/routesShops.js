const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const ModalConstructor = acu.ModalConstructor;
const mysql2 = require("mysql2/promise");

let connection = mysql2.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   port: process.env.DB_PORT,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME,
});

router
   .route("/")
   .get(async (req, res) => {
      let title = "Shops";
      acu.startConnection();
      const rows = await acu.getAllFrom("appointcutdb.shop");
      const rowsCity = await acu.getAllFrom("tblcity");
      const rowsBrgy = await acu.getAllFrom("tblbarangay");
      const rowsShopSchedule = await acu.getAllFrom("tblshopschedules");
      const days = [
         { name: "Monday" },
         { name: "Tuesday" },
         { name: "Wednesday" },
         { name: "Thursday" },
         { name: "Friday" },
         { name: "Saturday" },
         { name: "Sunday" },
      ];
      res.render("shops", {
         layout: "home-admin",
         title,
         rows,
         rowsCity,
         rowsBrgy,
         rowsShopSchedule,
         days,
      });
   })
   .post((req, res) => {
      var addInput = req.body;
      connection
         .query(
            `INSERT INTO tblshop SET shopName = ?, OwnerID = ?, longtitude = ?, latitude = ?, address = ?, contact = ?, email = ?, BarangayID = ?, CityID = ?`,
            [
               addInput["Shop Name"],
               addInput["Owner ID"],
               addInput["Longtitude"],
               addInput["Latitude"],
               addInput["Address"],
               addInput["Contact"],
               addInput["E-mail"],
               addInput["Barangay ID"],
               addInput["City ID"],
            ]
         )
         .then((mess) => {
            res.redirect("/shops");
         })
         .catch((err) => {
            console.log(err);
         });
   });

router.post("/edit", (req, res) => {
   var request = req.body;
   connection
      .query(
         `UPDATE tblshop SET shopName = ?, OwnerID = ?, longtitude = ?, latitude = ?, address = ?, contact = ?, email = ?, BarangayID = ?, CityID = ? WHERE ShopID = ?`,
         [
            request["Shop Name"],
            request["Owner ID"],
            request["Longtitude"],
            request["Latitude"],
            request["Address"],
            request["Contact"],
            request["E-mail"],
            request["Barangay ID"],
            request["City ID"],
            request["Shop ID"],
         ]
      )
      .then((mess) => {
         res.redirect("/shops");
      })
      .catch((err) => {
         console.log(err);
      });
});

//views
router.get("/view:id", async (req, res) => {
   acu.startConnection();
   const rowsApptApproved = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + req.params.id + ' AND appointmentstatus = "Approved"'
   );
   const rowsApptHistory = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + req.params.id + ' AND appointmentstatus != "Approved"'
   );
   const rows = await acu.getOneFromWhere(
      "appointcutdb.shop",
      "ShopID = " + req.params.id
   );
   const rowOwners = await acu.getAllFromWhere(
      "appointcutdb.shopownership",
      "ShopID = " + req.params.id
   );
   const rowEmp = await acu.getAllFromWhere(
      "appointcutdb.employee",
      "ShopID = " + req.params.id
   );
   const rowServ = await acu.getAllFromWhere(
      "appointcutdb.services",
      "ShopID = " + req.params.id
   );
   const rowsApptPending = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + req.params.id + ' AND appointmentstatus = "Pending"'
   );
   const rowsAppt = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + req.params.id + ' AND appointmentstatus != "Pending"'
   );
   const rowsEmpSpec = await acu.getAllFrom(
      "appointcutdb.employeespecialization"
   );

   const rowsEmpSchedule = await acu.getAllFrom("tblschedule");
   var rowsEmpSpecArray = rowsEmpSpec;
   var id = rowsEmpSpec[0].EmployeeID;
   var counter = 0;

   for (var i = 0; i < rowsEmpSpec.length; i++) {
      //get initial EmpID, if EmpID changes, reset array
      if (rowsEmpSpec[i].EmployeeID == id) {
         rowsEmpSpecArray[i]["Index"] = counter;
         counter++;
      } else {
         counter = 0;
         rowsEmpSpecArray[i]["Index"] = counter;
         counter++;
      }
      id = rowsEmpSpec[i].EmployeeID;
   }

   const rowsServ = await acu.getAllFromWhere(
      "appointcutdb.services",
      "shopID = " + req.params.id
   );

   var rowsServArray = rowsServ;
   for (var i = 0; i < rowsServArray.length; i++) {
      rowsServArray[i]["Index"] = i;
   }

   const rowsDays = await acu.getAllFromWhere(
      "tblshopschedules",
      "ShopID = " + req.params.id
   );

   const days = [
      { name: "Monday" },
      { name: "Tuesday" },
      { name: "Wednesday" },
      { name: "Thursday" },
      { name: "Friday" },
      { name: "Saturday" },
      { name: "Sunday" },
   ];

   const rowsEmpType = await acu.getAllFrom("tblemployeetype");
   const rowsSalaryType = await acu.getAllFrom("tblsalarytype");
   const rowsServCategory = await acu.getAllFrom("tblcategory");
   var title = rows.ShopName;
   res.render("shopsView", {
      layout: "home-admin",
      title: title,
      rows,
      rowOwners,
      rowEmp,
      rowServ,
      rowsApptPending,
      rowsAppt,
      days,
      rowsDays,
      rowsEmpSpecArray,
      rowsServArray,
      rowsEmpSchedule,
      rowsApptApproved,
      rowsApptHistory,
      rowsEmpType,
      rowsSalaryType,
      rowsServCategory,
   });
});

//CUSTOMER VIEWS => ADD OWNER
router.post("/view:shopID/addOwner", async (req, res) => {
   acu.startConnection();
   var { lastName, firstName, email, password, contact } = req.body;
   var shop = req.params.shopID;
   var newOwner = await acu.insertInto(
      "tblowner (firstName, lastName, email, password, contact, status)",
      '( "' +
         firstName +
         '", "' +
         lastName +
         '", "' +
         email +
         '", "' +
         password +
         '", "' +
         contact +
         '", 1 )'
   );
   await acu.insertInto(
      "tblshopownership (shopID, ownerID)",
      '( "' + shop + '", "' + newOwner.insertId + '" )'
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//CUSTOMER VIEWS => EDIT OWNER INFORMATION
router.post("/view:shopID/editOwner:ownerID", async (req, res) => {
   var { lastName, firstName, email, contact } = req.body;
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
         '"',
      "OwnerID = " + req.params.ownerID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//CUSTOMER VIEWS => SET OWNER AS INACTIVE
router.get("/view:shopID/setInactiveOwner:ownerID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblowner",
      "status = 0",
      "OwnerID = " + req.params.ownerID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//CUSTOMER VIEWS => SET OWNER AS ACTIVE
router.get("/view:shopID/setActiveOwner:ownerID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblowner",
      "status = 1",
      "OwnerID = " + req.params.ownerID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//OWNER BARBERSHOP VIEWS => ADD EMPLOYEE
router.post("/view:shopID/addEmployee", async (req, res) => {
   acu.startConnection();
   var {
      lastName,
      firstName,
      email,
      password,
      contact,
      employeeType,
      salaryType,
      salaryValue,
   } = req.body;
   var newEmp = await acu.insertInto(
      "tblemployee (firstname, lastname, email, password, contact, employeeTypeID,  salaryTypeID, salaryTypeValue, status, balance, shopID)",
      '( "' +
         firstName +
         '", "' +
         lastName +
         '", "' +
         email +
         '", "' +
         password +
         '", "' +
         contact +
         '", "' +
         employeeType +
         '", "' +
         salaryType +
         '", "' +
         salaryValue +
         '", 1, 0, "' +
         req.params.shopID +
         '" )'
   );
   //add schedule for the new employee
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
         await acu.insertInto(
            "tblschedule (employeeID, date, timeIn, timeOut)",
            '( "' + newEmp.insertId + '", "' + dayName[i] + '", null , null )'
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

   //EMPLOYEE SPECIALIZATION
   //hanapin lahat nung services -- variable creation
   const rowsServ = await acu.getAllFromWhere(
      "appointcutdb.services",
      "shopID = " + req.params.shopID
   );
   for (var i = 0; i < rowsServ.length; i++) {
      eval("var serviceName" + i + " = req.body.serviceName" + i);
      eval("var service" + i + " = req.body.service" + i);
   }
   //check if nacheckan ba yung checkbox
   for (var i = 0; i < rowsServ.length; i++) {
      var status = 1;
      if (eval("service" + i) != undefined) {
         status = 1;
      } else {
         status = 0;
      }
      await acu.insertInto(
         "tblemployeespecialization (shopServicesID, employeeID, status)",
         '( "' +
            eval("serviceName" + i) +
            '", "' +
            newEmp.insertId +
            '", "' +
            status +
            '")'
      );
   }
   res.redirect("/shops/view" + req.params.shopID);
});

//CUSIOMER VIEWS => EDIT EMPOLYEE INFORMATION
router.post("/view:shopID/editEmployee:empID", async (req, res) => {
   acu.startConnection();
   var {
      lastName,
      firstName,
      email,
      contact,
      employeeType,
      salaryType,
      salaryValue,
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
         req.params.shopID +
         '"',
      "employeeID = " + req.params.empID
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
               req.params.empID +
               '"'
         );
      } else {
         await acu.updateSet(
            "tblschedule",
            'timeIn = "' + timeIn[i] + '", timeOut = "' + timeOut[i] + '"',
            'Date = "' +
               dayName[i] +
               '" AND EmployeeID = "' +
               req.params.empID +
               '"'
         );
      }
   }

   //EMPLOYEE SPECIALIZATION
   //hanapin lahat nung services
   const rowsEmpSpec = await acu.getAllFromWhere(
      "appointcutdb.employeeSpecialization",
      "employeeID = " + req.params.empID
   );
   //variable creation
   for (var i = 0; i < rowsEmpSpec.length; i++) {
      eval("var service" + i + " = req.body.service" + i);
      eval("var serviceName" + i + " = req.body.serviceName" + i);
   }
   //check if nacheckan ba yung checkbox
   for (var i = 0; i < rowsEmpSpec.length; i++) {
      if (eval("service" + i) != undefined) {
         await acu.updateSet(
            "tblemployeespecialization",
            "shopServicesID = '" + eval("serviceName" + i) + "', status = 1",
            'EmployeeID = "' +
               req.params.empID +
               '" AND EmployeeSpecializationID = "' +
               rowsEmpSpec[i].EmployeeSpecializationID +
               '"'
         );
      } else {
         await acu.updateSet(
            "tblemployeespecialization",
            "shopServicesID = " + eval("serviceName" + i) + ", status = 0",
            'EmployeeID = "' +
               req.params.empID +
               '" AND EmployeeSpecializationID = "' +
               rowsEmpSpec[i].EmployeeSpecializationID +
               '"'
         );
      }
   }
   res.redirect("/shops/view" + req.params.shopID);
});

router.get("/view:shopID/setActiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 1",
      "EmployeeID = " + req.params.empID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

router.get("/view:shopID/setInactiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 0",
      "EmployeeID = " + req.params.empID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//SHOP VIEWS => ADD SERVICE
router.post("/view:shopID/addService", async (req, res) => {
   var { service1, price, duration } = req.body;
   acu.startConnection();
   await acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      '( "' +
         req.params.shopID +
         '", "' +
         service1 +
         '", "' +
         price +
         '", "' +
         duration +
         '" )'
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//owner => barbershop views => edit service
router.post("/view:shopID/editService:serviceID", async (req, res) => {
   var { editService, editPrice, editDuration } = req.body;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      'shopID = "' +
         req.params.shopID +
         '", servicesID = "' +
         editService +
         '", price = "' +
         editPrice +
         '", duration = "' +
         editDuration +
         '"',
      " ShopServicesID = " + req.params.serviceID
   );
   res.redirect(res.redirect("/shops/view" + req.params.shopID));
});

//OWNERS BARBERSHOP VIEWS => EDIT BARBERSHOP SCHEDULE
router.post(
   "/view:shopID/editShopSchedule:shopScheduleID",
   async (req, res) => {
      var { timeIn, timeOut, status } = req.body;
      acu.startConnection();
      if (status == undefined) {
         status = 0;
         timeIn = null;
         timeOut = null;
         await acu.updateSet(
            "tblshopschedules",
            "shopID = '" +
               req.params.shopID +
               "', TimeIn = " +
               timeIn +
               ", TimeOut = " +
               timeOut +
               ", Status = " +
               status,
            "shopSchedulesID = '" + req.params.shopScheduleID + "'"
         );
      } else {
         await acu.updateSet(
            "tblshopschedules",
            "shopID = '" +
               req.params.shopID +
               "', TimeIn = '" +
               timeIn +
               "', TimeOut = '" +
               timeOut +
               "', Status = " +
               status,
            "shopSchedulesID = '" + req.params.shopScheduleID + "'"
         );
      }
      res.redirect("/shops/view" + req.params.shopID);
   }
);

router.post("/view:shopID/addAppointment", async (req, res) => {
   var { name, contact, category, service, employee, date, time } = req.body;

   //Para kumuha ng values sa loob ng shop services
   acu.startConnection();
   var ss = await acu.getOneFromWhere(
      "tblshopservices",
      "servicesID = " + service + " AND shopID = " + req.params.shopID
   );
   var shopServiceID = ss.shopID;
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

   var shopID = req.params.shopId;
   console.log(ss, shopServiceID, amountDue, timeIn, timeOut, shopID);
   await acu.insertInto(
      "tblappointment (Name, ShopID, EmployeeID, ShopServicesID, TimeIn, TimeOut, Date, AmountDue, AppStatusID, appointmentType )",
      '( "' +
         name +
         '", "' +
         req.params.shopID +
         '", "' +
         employee +
         '", "' +
         shopServiceID +
         '", "' +
         timeIn +
         '", "' +
         timeOut +
         '", "' +
         date +
         '", "' +
         amountDue +
         '", 1, 0)'
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//CANCEL APPOINTMENTS
router.get("/view:shopID/cancelAppt:apptID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = 3",
      "AppointmentID = " + req.params.apptID
   );
   res.redirect("/shops/view" + req.params.shopID);
});

//COMPLETE APPOINTMENTS
router.post("/view:shopID/completeAppt:apptID", async (req, res) => {
   var appointmentStatus = req.body.appointmentStatus;
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = " + appointmentStatus,
      "AppointmentID = " + req.params.apptID
   );
   res.redirect("/shops/view" + req.params.shopID);
});
module.exports = router;
