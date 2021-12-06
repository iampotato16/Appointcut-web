const acu = require("../../AppointCutUtils");
const ModalConstructor = acu.ModalConstructor;
const express = require("express");
const router = express.Router();

async function getShopName(shopID) {
   acu.startConnection();
   var rowsShop = await acu.getAllFromWhere("tblshop", "ShopID = " + shopID);
   return rowsShop[0].shopName;
}

router.route("/:shopID").get(async (req, res) => {
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   const transactions = await acu.getAllFromWhere(
      "appointcutdb.transactions",
      "ShopID = " + shopID
   );
   res.render("deskReports", {
      layout: "home-desk",
      title: shopName,
      transactions,
      shopName,
      shopID,
   });
});

//EMPLOYEES
router.route("/:shopID/employees").get(async (req, res) => {
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowEmp = await acu.getAllFromWhere(
      "appointcutdb.employee",
      "ShopID = " + shopID
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
      "shopID = " + shopID
   );

   var rowsServArray = rowsServ;
   for (var i = 0; i < rowsServArray.length; i++) {
      rowsServArray[i]["Index"] = i;
   }

   const rowsDays = await acu.getAllFromWhere(
      "tblshopschedules",
      "ShopID = " + shopID
   );
   const rowsEmpType = await acu.getAllFrom("tblemployeetype");
   const rowsSalaryType = await acu.getAllFrom("tblsalarytype");

   res.render("deskEmployees", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      rowEmp,
      rowsEmpType,
      rowsSalaryType,
      rowsEmpSchedule,
      rowsEmpSpecArray,
      rowsDays,
      rowsServArray,
      shopName,
   });
});

//OWNER BARBERSHOP VIEWS => ADD EMPLOYEE
router.post("/:shopID/employees/addEmployee", async (req, res) => {
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
   if (employeeType == 1) {
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
   }
   res.redirect("/deskAccount/" + req.params.shopID + "/employees");
});

//EDIT EMPOLYEE INFORMATION
router.post("/:shopID/editEmployee:empID", async (req, res) => {
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
   res.redirect("/deskAccount/" + req.params.shopID + "/employees");
});

//SET ACTIVE
router.get("/:shopID/setActiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 1",
      "EmployeeID = " + req.params.empID
   );
   res.redirect("/deskAccount/" + req.params.shopID + "/employees");
});

router.get("/:shopID/setInactiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 0",
      "EmployeeID = " + req.params.empID
   );
   res.redirect("/deskAccount/" + req.params.shopID + "/employees");
});

//SERVICES
router.get("/:shopID/services", async (req, res) => {
   //// all the stuff needed for services
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowServ = await acu.getAllFromWhere(
      "appointcutdb.shopservices",
      "ShopID = " + req.params.shopID
   );
   const rowsServCategory = await acu.getAllFrom("tblcategory");
   /*  alert(rowsServCategory); */
   res.render("deskServices", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      rowServ,
      rowsServCategory,
      shopName,
   });
});

router.post("/:shopID/addService", async (req, res) => {
   var { service13, price, duration } = req.body;
   acu.startConnection();
   var newService = await acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      "(" +
         req.params.shopID +
         ", " +
         service13 +
         ", " +
         price +
         ", " +
         duration +
         ")"
   );
   var shopServicesID = newService.insertId;
   var employeeList = await acu.getAllFromWhere(
      "tblemployee",
      "shopID = " + req.params.shopID + " AND EmployeeTypeID = 1"
   );
   //EmployeeID
   for (var i = 0; i < employeeList.length; i++) {
      await acu.insertInto(
         "tblemployeespecialization (shopServicesID, employeeID, Status)",
         '( "' + shopServicesID + '", "' + employeeList[i].EmployeeID + '", 0 )'
      );
   }
   res.redirect("/deskAccount/" + req.params.shopID + "/services");
});

//owner => barbershop views => edit service
router.post("/:shopID/editService:serviceID", async (req, res) => {
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
   res.redirect("/deskAccount/" + req.params.shopID + "/services");
});

router.get("/:shopID/setInactiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 0",
      "shopServicesID = " + id
   );
   res.redirect("/deskAccount/" + req.params.shopID + "/services");
});

router.get("/:shopID/setActiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 1",
      "shopServicesID = " + id
   );
   res.redirect("/deskAccount/" + req.params.shopID + "/services");
});

//SCHEDULE
router.get("/:shopID/schedule", async (req, res) => {
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowsDays = await acu.getAllFromWhere(
      "tblshopschedules",
      "ShopID = " + shopID
   );
   res.render("deskSchedule", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      rowsDays,
      shopName,
   });
});

router.post("/:shopID/editShopSchedule:schedID", async (req, res) => {
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
         "shopSchedulesID = '" + req.params.schedID + "'"
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
         "shopSchedulesID = '" + req.params.schedID + "'"
      );
   }
   res.redirect("/deskAccount/" + req.params.shopID + "/schedule");
});

//APPOINTMENT HISTORY
router.get("/:shopID/appointmentHistory", async (req, res) => {
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowsApptHistory = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + ' AND appointmentstatus != "Approved"'
   );
   res.render("deskAppointmentHistory", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      rowsApptHistory,
      shopName,
   });
});

//OWNER BARBERSHOP VIEWS => ADD APOINTMENT
router.post("/:shopID/addAppointment", async (req, res) => {
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

   var shopID = req.params.shopID;
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
   res.redirect("/deskAccount/" + req.params.shopID + "/appointments");
});

//APPOINTMENTS
router.get("/:shopID/appointments", async (req, res) => {
   var shopID = req.params.shopID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowsApptApproved = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + ' AND appointmentstatus = "Approved"'
   );
   console.log(rowsApptApproved);
   const rowsEmp = await acu.getAllFromWhere(
      "appointcutdb.employee",
      "ShopID = " + shopID
   );
   const rowsServCategory = await acu.getAllFrom("tblcategory");
   res.render("deskAppointments", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      rowsApptApproved,
      rowsEmp,
      rowsServCategory,
      shopName,
   });
});

//CANCEL APPOINTMENTS
router.get("/:shopID/cancelAppt:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = 3",
      "AppointmentID = " + id
   );
   res.redirect("/deskAccount/" + req.params.shopID + "/appointments");
});

//COMPLETE APPOINTMENTS
router.post("/:shopID/completeAppt:id", async (req, res) => {
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
            '( W"' +
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
   res.redirect("/deskAccount/" + req.params.shopID + "/appointments");
});

module.exports = router;
