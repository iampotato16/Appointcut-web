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
const days = [
   { name: "Monday" },
   { name: "Tuesday" },
   { name: "Wednesday" },
   { name: "Thursday" },
   { name: "Friday" },
   { name: "Saturday" },
   { name: "Sunday" },
];

async function getOwnerName(ownerID) {
   acu.startConnection();
   var ownerData = await acu.getOneFromWhere(
      "tblowner",
      "OwnerID = " + ownerID
   );
   console.log(ownerData);
   return ownerData.firstName + " " + ownerData.lastName;
}

router
   .route("/view:ownerID")
   //GET LIST OF BARBERSHOPS THE OWNER OWNS
   .get(async (req, res) => {
      var ownerID = req.params.ownerID;
      var ownerName = await getOwnerName(ownerID);
      acu.startConnection();
      const rows = await acu.getOneFromWhere(
         "appointcutdb.owner",
         "OwnerID = " + ownerID
      );
      const rowsBS = await acu.getAllFromWhere(
         "appointcutdb.shopownership",
         "OwnerID = " + ownerID + " AND appStatus = 1"
      );
      const rowsBSApplications = await acu.getAllFromWhere(
         "appointcutdb.shopownership",
         "OwnerID = " + ownerID + " AND appStatus != 1"
      );
      const rowsCity = await acu.getAllFrom("tblcity");
      const rowsShopSchedule = await acu.getAllFrom("tblshopschedules");
      const rowsBrgy = await acu.getAllFrom("tblbarangay");
      var title = rows.firstName + " " + rows.lastName;
      res.render("ownersView", {
         layout: "home-owner",
         title: title,
         rows,
         rowsBS,
         rowsBSApplications,
         rowsCity,
         rowsBrgy,
         rowsShopSchedule,
         ownerID,
         ownerName,
         days,
      });
   })
   //OWNER ACCOUNT => ADD SHOP
   .post(async (req, res) => {
      upload(req, res, async (err) => {
         //SHOP
         var { shopName, shopEmail, shopContact, barangay, city, street } =
            req.body;
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
         var newOwnerID = req.params.ownerID;
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
      res.redirect("/ownerAccount/view" + req.params.ownerID);
   });

//OWNER ACCOUNT => SET BARBERSHOP AS INACTIVE
router.get("/view:ownerId/setInactive:id", async (req, res) => {
   var id = req.params.id;
   var ownerName = await getOwnerName(req.params.ownerId);
   acu.startConnection();
   await acu.updateSet("tblshop", "status = 0", "ShopID = " + id);
   res.redirect("/ownerAccount/view" + req.params.ownerId);
});

//OWNER ACCOUNT => SET BARBERSHOP AS ACTIVE
router.get("/view:ownerId/setActive:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet("tblshop", "status = 1", "ShopID = " + id);
   res.redirect("/ownerAccount/view" + req.params.ownerId);
});

//OWNER ACCOUNT => EDIT BARBERSHOP
router.post("/view:ownerId/editShopInfo:shopId", async (req, res) => {
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
   res.redirect("/ownerAccount/view" + req.params.ownerId);
});

//OWNER BARBERSHOP VIEWS
router
   .route("/view:ownerID/viewShop:shopID")
   //OWNER BARBERSHOP VIEWS
   .get(async (req, res) => {
      var ownerID = req.params.ownerID;
      var shopID = req.params.shopID;
      var account = "ownerAccount";
      var ownerName = await getOwnerName(ownerID);
      acu.startConnection();
      var ownerData = await acu.getAllFromWhere(
         "tblowner",
         "OwnerID =" + ownerID
      );
      var ownerName = ownerData[0].firstName + " " + ownerData[0].lastName;
      var rowShop = await acu.getAllFromWhere(
         "appointcutdb.shop",
         "ShopID = " + shopID
      );
      var title = rowShop[0].ShopName;
      const rowsEmpSpec = await acu.getAllFrom(
         "appointcutdb.employeespecialization"
      );
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

      const rowServices = await acu.getAllFrom("tblservices");
      const rowsEmpSchedule = await acu.getAllFrom("tblschedule");
      const rowsServCategory = await acu.getAllFrom("tblcategory");
      const rowsEmpType = await acu.getAllFrom("tblemployeetype");
      const rowsSalaryType = await acu.getAllFrom("tblsalarytype");
      const rowsEmp = await acu.getAllFromWhere(
         "appointcutdb.employee",
         "ShopID = " + shopID
      );
      const rowsServ = await acu.getAllFromWhere(
         "appointcutdb.services",
         "shopID = " + shopID
      );
      var rowsServArray = rowsServ;
      for (var i = 0; i < rowsServArray.length; i++) {
         rowsServArray[i]["Index"] = i;
      }
      const rowsShopServ = await acu.getAllFromWhere(
         "appointcutdb.shopservices",
         "shopID = " + shopID
      );
      const rowsApptApproved = await acu.getAllFromWhere(
         "appointcutdb.appointment",
         "shopID = " + shopID + ' AND appointmentstatus = "Approved"'
      );
      const rowsApptHistory = await acu.getAllFromWhere(
         "appointcutdb.appointment",
         "shopID = " + shopID + ' AND appointmentstatus != "Approved"'
      );
      const rowsDays = await acu.getAllFromWhere(
         "tblshopschedules",
         "ShopID = " + shopID
      );
      const transactions = await acu.getAllFromWhere(
         "appointcutdb.transactions",
         "ShopID = " + req.params.shopID
      );
      res.render("ownersBarbershopsView", {
         layout: "home-owner",
         title: title,
         transactions,
         days,
         ownerID,
         shopID,
         rowServices,
         rowsServCategory,
         rowsEmp,
         rowsEmpSpec,
         rowsEmpSpecArray,
         rowsServ,
         rowsServArray,
         rowsShopServ,
         rowsApptApproved,
         rowsApptHistory,
         rowsEmpType,
         rowsSalaryType,
         rowsEmpSchedule,
         rowsDays,
         account,
         ownerName,
      });
   })
   //OWNER BARBERSHOP VIEWS => ADD EMPLOYEE
   .post(async (req, res) => {
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
      var ownerID = req.params.ownerID;
      var shopID = req.params.shopID;
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
            shopID +
            '" )'
      );
      //add schedule for the new employee
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

      //EMPLOYEE SPECIALIZATION
      //hanapin lahat nung services -- variable creation
      const rowsServ = await acu.getAllFromWhere(
         "appointcutdb.services",
         "shopID = " + shopID
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
      res.redirect("/ownerAccount/view" + ownerID + "/viewShop" + shopID);
   });

//owner => barbershop views => edit employee
router.post("/view:ownerId/viewShop:shopId/editEmp:empId", async (req, res) => {
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

   //EMPLOYEE SPECIALIZATION
   //hanapin lahat nung services
   const rowsEmpSpec = await acu.getAllFromWhere(
      "appointcutdb.employeeSpecialization",
      "employeeID = " + req.params.empId
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
               req.params.empId +
               '" AND EmployeeSpecializationID = "' +
               rowsEmpSpec[i].EmployeeSpecializationID +
               '"'
         );
      } else {
         await acu.updateSet(
            "tblemployeespecialization",
            "shopServicesID = " + eval("serviceName" + i) + ", status = 0",
            'EmployeeID = "' +
               req.params.empId +
               '" AND EmployeeSpecializationID = "' +
               rowsEmpSpec[i].EmployeeSpecializationID +
               '"'
         );
      }
   }
   res.redirect(
      "/ownerAccount/view" +
         req.params.ownerId +
         "/viewShop" +
         req.params.shopId
   );
});

router.get(
   "/view:ownerId/viewShop:shopId/setInactiveEmp:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet("tblemployee", "status = 0", "EmployeeID = " + id);
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
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
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
      );
   }
);

//owner => barbershop views => add service
router.post("/view:ownerId/viewShop:shopId/addService", async (req, res) => {
   var { service1, price, duration } = req.body;
   acu.startConnection();
   var newService = await acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      "(" +
         req.params.shopId +
         ", " +
         service1 +
         ", " +
         price +
         ", " +
         duration +
         ")"
   );
   var shopServicesID = newService.insertId;
   var employeeList = await acu.getAllFromWhere(
      "tblemployee",
      "shopID = " + req.params.shopId
   );
   //EmployeeID
   for (var i = 0; i < employeeList.length; i++) {
      await acu.insertInto(
         "tblemployeespecialization (shopServicesID, employeeID, Status)",
         '( "' + shopServicesID + '", "' + employeeList[i].EmployeeID + '", 0 )'
      );
   }
   res.redirect(
      "/ownerAccount/view" +
         req.params.ownerId +
         "/viewShop" +
         req.params.shopId
   );
});

//owner => barbershop views => edit service
router.post(
   "/view:ownerId/viewShop:shopId/editService:servId",
   async (req, res) => {
      var { editService, editServiceHolder, editPrice, editDuration } =
         req.body;
      if (editService == undefined) {
         editService = editServiceHolder;
      }
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
         " ShopServicesID = " + req.params.servId
      );
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
      );
   }
);

router.get("/view:ownerId/view:shopId/setInactiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 0",
      "shopServicesID = " + id
   );
   res.redirect(
      "/ownerAccount/view" +
         req.params.ownerId +
         "/viewShop" +
         req.params.shopId
   );
});

router.get(
   "/view:ownerId/viewShop:shopId/setActiveServ:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet(
         "tblshopservices",
         "status = 1",
         "shopServicesID = " + id
      );
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
      );
   }
);

//OWNERS BARBERSHOP VIEWS => EDIT BARBERSHOP SCHEDULE
router.post(
   "/view:ownerID/viewShop:shopID/editShopSchedule:shopSchedulesID",
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
            "shopSchedulesID = '" + req.params.shopSchedulesID + "'"
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
            "shopSchedulesID = '" + req.params.shopSchedulesID + "'"
         );
      }
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerID +
            "/viewShop" +
            req.params.shopID
      );
   }
);

//OWNER BARBERSHOP VIEWS => ADD APOINTMENT
router.post(
   "/view:ownerId/viewShop:shopId/addAppointment",
   async (req, res) => {
      var { name, contact, category, service, employee, date, time } = req.body;

      //Para kumuha ng values sa loob ng shop services
      acu.startConnection();
      var ss = await acu.getOneFromWhere(
         "tblshopservices",
         "servicesID = " + service + " AND shopID = " + req.params.shopId
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
            req.params.shopId +
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
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
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
      "/ownerAccount/view" +
         req.params.ownerId +
         "/viewShop" +
         req.params.shopId
   );
});

//COMPLETE APPOINTMENTS
router.post(
   "/view:ownerId/viewShop:shopId/completeAppt:id",
   async (req, res) => {
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
                  req.params.shopId +
                  "-" +
                  appointmentDate +
                  "-" +
                  time +
                  '", "' +
                  req.params.id +
                  '", "' +
                  req.params.shopId +
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
      res.redirect(
         "/ownerAccount/view" +
            req.params.ownerId +
            "/viewShop" +
            req.params.shopId
      );
   }
);

module.exports = router;
