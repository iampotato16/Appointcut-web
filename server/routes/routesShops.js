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

router.route("/").get(async (req, res) => {
   let title = "Shops";
   acu.startConnection();
   const rows = await acu.getAllFromWhere("appointcutdb.shop", "appStatus = 1");
   const rowsCity = await acu.getAllFrom("tblcity");
   const rowsBrgy = await acu.getAllFrom("tblbarangay");
   const rowsShopSchedule = await acu.getAllFrom("tblshopschedules");
   const rowsShopOwner = await acu.getAllFrom("tblowner");
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
      rowsShopOwner,
      days,
   });
   //ADD BARBERSHOP INFORMATION
   //OWNER ACCOUNT => ADD SHOP
});

router.post("/addBarbershop", async (req, res) => {
   upload(req, res, async (err) => {
      //SHOP
      var {
         shopName,
         shopEmail,
         shopContact,
         barangay,
         city,
         street,
         shopOwner,
      } = req.body;
      console.log(shopName, shopEmail, shopContact, barangay, city, street);
      //SHOP APPLICATION
      var { birPermit, busPermit } = req.files;
      console.log(birPermit, busPermit);
      console.log(birPermit[0].path, busPermit[0].path);
      acu.startConnection();

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
            barangay +
            '","' +
            street +
            '", 0)'
      );
      //Insert into shop application
      var newOwnerID = shopOwner;
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
   res.redirect("/shops");
});

//EDIT BARBERSHOP INFORMATION
router.post("/edit:shopId", async (req, res) => {
   var {
      shopName,
      email,
      contact,
      city,
      cityHolder,
      barangay,
      barangayHolder,
      street,
   } = req.body;
   if (city == undefined) {
      city = cityHolder;
   }
   if (barangay == undefined) {
      barangay = barangayHolder;
   }
   acu.startConnection();
   await acu.updateSet(
      "tblshop",
      'shopName = "' +
         shopName +
         '", email = "' +
         email +
         '", shopContact = "' +
         contact +
         '", cityID = "' +
         city +
         '", barangayID = "' +
         barangay +
         '", street = "' +
         street +
         '"',
      "shopID = " + req.params.shopId
   );
   //add schedule
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
            "tblshopschedules",
            "timeIn = null, timeOut = null, status = 0",
            'Day = "' +
               dayName[i] +
               '" AND shopID = "' +
               req.params.shopId +
               '"'
         );
      } else {
         await acu.updateSet(
            "tblshopschedules",
            'timeIn = "' +
               timeIn[i] +
               '", timeOut = "' +
               timeOut[i] +
               '", status = 1',
            'Day = "' +
               dayName[i] +
               '" AND shopID = "' +
               req.params.shopId +
               '"'
         );
      }
   }
   res.redirect("/shops");
});

//SET BARBERSHOP AS INACTIVE
router.get("/setInactiveShop:ShopID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblshop",
      "status = 0",
      "ShopID = " + req.params.ShopID
   );
   res.redirect("/shops");
});

//SET BARBERSHOP AS ACTIVE
router.get("/setActiveShop:shopID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblshop",
      "status = 1",
      "ShopID = " + req.params.shopID
   );
   res.redirect("/shops");
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
      "appointcutdb.shopservices",
      "ShopID = " + req.params.id
   );
   /* const rowsApptPending = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + req.params.id + ' AND appointmentstatus = "Pending"'
   ); */
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
   const transactions = await acu.getAllFromWhere(
      "appointcutdb.transactions",
      "ShopID = " + req.params.id
   );
   var title = rows.ShopName;
   res.render("shopsView", {
      layout: "home-admin",
      title: title,
      rows,
      transactions,
      rowOwners,
      rowEmp,
      rowServ,
      //rowsApptPending,
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
      employeeTypeHolder,
      salaryType,
      salaryTypeHolder,
      salaryValue,
   } = req.body;
   if (employeeType == undefined) {
      employeeType = employeeTypeHolder;
   }
   if (salaryType == undefined) {
      salaryType = salaryTypeHolder;
   }
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
      "appointcutdb.employeespecialization",
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
   var { service90, price, duration } = req.body;
   var newService = await acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      "(" +
         req.params.shopID +
         ", " +
         service90 +
         ", " +
         price +
         ", " +
         duration +
         ")"
   );
   var shopServicesID = newService.insertId;
   var employeeList = await acu.getAllFromWhere(
      "tblemployee",
      "shopID = " + req.params.shopID
   );
   //EmployeeID
   for (var i = 0; i < employeeList.length; i++) {
      await acu.insertInto(
         "tblemployeespecialization (shopServicesID, employeeID, Status)",
         '( "' + shopServicesID + '", "' + employeeList[i].EmployeeID + '", 0 )'
      );
   }
   res.redirect("/shops/view" + req.params.shopID);
});

//owner => barbershop views => edit service
router.post("/view:shopID/editService:serviceID", async (req, res) => {
   var { editService, editServiceHolder, editPrice, editDuration } = req.body;
   if (editService == undefined) {
      editService = editServiceHolder;
   }
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
   res.redirect("/shops/view" + req.params.shopID);
});

router.get("/view:shopId/setInactiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 0",
      "shopServicesID = " + id
   );
   res.redirect("/shops/view" + req.params.shopId);
});

router.get("/view:shopId/setActiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 1",
      "shopServicesID = " + id
   );
   res.redirect("/shops/view" + req.params.shopId);
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

//ADD APPOINTMENT
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
router.post("/view:shopID/completeAppt:id", async (req, res) => {
   var id = req.params.id;
   var appointmentStatus = req.body.appointmentStatus;
   acu.startConnection();
   //update appointment first
   await acu.updateSet(
      "tblappointment",
      "appStatusID = " + appointmentStatus,
      "AppointmentID = " + id
   );
   if (appointmentStatus == 2) {
      var transaction = await acu.getOneFromWhere(
         "tbltransactions",
         "AppointmentID = " + id
      );
      if (transaction == null) {
         var appointment = await acu.getOneFromWhere(
            "tblappointment",
            "AppointmentID = " + id
         );

         var dateHolder = appointment.Date;
         var appointmentDate = dateHolder.toISOString().split("T")[0];

         function addZero(i) {
            if (i < 10) {
               i = "0" + i;
            }
            return i;
         }

         const d = new Date();
         let h = addZero(d.getHours());
         let m = addZero(d.getMinutes());
         let s = addZero(d.getSeconds());
         let time = h + ":" + m + ":" + s;

         await acu.insertInto(
            "tbltransactions (TransactionID, AppointmentID, ShopID, Amount, Date, Time)",
            '( "' +
               "W" +
               appointment.AppointmentID +
               "-" +
               req.params.shopID +
               "-" +
               appointmentDate +
               "-" +
               time +
               '", "' +
               req.params.id +
               '", "' +
               req.params.shopID +
               '", "' +
               appointment.amountDue +
               '", "' +
               appointmentDate +
               '", "' +
               time +
               '" )'
         );
      }
   }
   res.redirect("/shops/view" + req.params.shopID);
});
module.exports = router;
