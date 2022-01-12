const acu = require("../../AppointCutUtils");
const ModalConstructor = acu.ModalConstructor;
const express = require("express");
const router = express.Router();

async function getShopName(shopID) {
   acu.startConnection();
   var rowsShop = await acu.getAllFromWhere("tblshop", "ShopID = " + shopID);

   return rowsShop[0].shopName;
}

//REPORTS
router.route("/:employeeID/:shopID").get(async (req, res) => {
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
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
      employeeID,
   });
});

//EMPLOYEES
router.route("/:employeeID/:shopID/employees").get(async (req, res) => {
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
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
      employeeID,
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
router.post("/:employeeID/:shopID/employees/addEmployee", async (req, res) => {
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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/employees"
   );
});

//EDIT EMPOLYEE INFORMATION
router.post("/:employeeID/:shopID/editEmployee:empID", async (req, res) => {
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
      console.log(eval("service" + i));
      console.log(eval("serviceName" + i));
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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/employees"
   );
});

//SET ACTIVE
router.get("/:employeeID/:shopID/setActiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 1",
      "EmployeeID = " + req.params.empID
   );
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/employees"
   );
});

router.get("/:employeeID/:shopID/setInactiveEmp:empID", async (req, res) => {
   acu.startConnection();
   await acu.updateSet(
      "tblemployee",
      "Status = 0",
      "EmployeeID = " + req.params.empID
   );
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/employees"
   );
});

//SERVICES
router.get("/:employeeID/:shopID/services", async (req, res) => {
   //// all the stuff needed for services
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
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
      employeeID,
      rowServ,
      rowsServCategory,
      shopName,
   });
});

router.post("/:employeeID/:shopID/addService", async (req, res) => {
   var { service16, price, duration } = req.body;
   acu.startConnection();
   var newService = await acu.insertInto(
      "tblshopservices (shopID, servicesID, price, duration)",
      "(" +
         req.params.shopID +
         ", " +
         service16 +
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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/services"
   );
});

//owner => barbershop views => edit service
router.post("/:employeeID/:shopID/editService:serviceID", async (req, res) => {
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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/services"
   );
});

router.get("/:employeeID/:shopID/setInactiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 0",
      "shopServicesID = " + id
   );
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/services"
   );
});

router.get("/:employeeID/:shopID/setActiveServ:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblshopservices",
      "status = 1",
      "shopServicesID = " + id
   );
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         +"/services"
   );
});

//SCHEDULE
router.get("/:employeeID/:shopID/schedule", async (req, res) => {
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
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
      employeeID,
      rowsDays,
      shopName,
   });
});

router.post(
   "/:employeeID/:shopID/editShopSchedule:schedID",
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
      res.redirect(
         "/deskAccount/" +
            req.params.employeeID +
            "/" +
            req.params.shopID +
            "/schedule"
      );
   }
);

//APPOINTMENT HISTORY
router.get("/:employeeID/:shopID/appointmentHistory", async (req, res) => {
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowsApptHistory = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + ' AND appointmentstatus != "Approved"'
   );
   res.render("deskAppointmentHistory", {
      layout: "home-desk",
      title: "Shop Name",
      employeeID,
      shopID,
      rowsApptHistory,
      shopName,
   });
});

//OWNER BARBERSHOP VIEWS => ADD APOINTMENT
router.post("/:employeeID/:shopID/addAppointment", async (req, res) => {
   var { name, contact, category, service, employee, date, time } = req.body;

   //Para kumuha ng values sa loob ng shop services
   acu.startConnection();
   var ss = await acu.getOneFromWhere(
      "tblshopservices",
      "shopServicesID = " + service + " AND shopID = " + req.params.shopID
   );
   var shopServiceID = ss.shopServicesID;
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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/appointments"
   );
});

//APPOINTMENTS
router.get("/:employeeID/:shopID/appointments", async (req, res) => {
   var shopID = req.params.shopID;
   var employeeID = req.params.employeeID;
   var shopName = await getShopName(shopID);
   acu.startConnection();
   const rowsApptApproved = await acu.getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + ' AND appointmentstatus = "Approved"'
   );
   var date = new Date();
   var unfinishedAppts = [];
   var finishedAppts = [];
   for (var i = 0; i < rowsApptApproved.length; i++) {
      //date from rowsApptApproved
      var x = rowsApptApproved[i].Date;
      var apptApprovedDate;
      var m = x.getMonth() + 1;
      var d = x.getDate();
      var y = x.getFullYear();
      apptApprovedDate = m + " " + d + " " + y;

      //time from rowsApptApprved
      var apptApprovedTime = rowsApptApproved[i].TimeOut;
      var apptApprovedDateTime = new Date(
         apptApprovedDate + " " + apptApprovedTime
      );
      console.log("CURRENT DATE: " + date);
      console.log("APPROVED DATE: " + apptApprovedDateTime);
      //console.log(date, apptApprovedDateTime);
      if (date > apptApprovedDateTime) {
         finishedAppts.push(rowsApptApproved[i]);
         //change appointment status to 0
      } else {
         unfinishedAppts.push(rowsApptApproved[i]);
      }
   }
   // pag isipian kung yung finished appts ba ay ilalagay ko pa sa notif
   //change status of all unfinished appts to NO SHOW
   for (var i = 0; i < finishedAppts.length; i++) {
      customerID = finishedAppts[i].CustomersID;
      //get redtag number
      if (customerID != null) {
         await acu.redTag(customerID);
      }
      await acu.updateSet(
         "tblappointment",
         "appStatusID = 0",
         "AppointmentID = " + finishedAppts[i].AppointmentID
      );
   }
   const rowsEmp = await acu.getAllFromWhere(
      "appointcutdb.employee",
      "ShopID = " + shopID
   );
   const rowsServCategory = await acu.getAllFrom("tblcategory");
   res.render("deskAppointments", {
      layout: "home-desk",
      title: "Shop Name",
      shopID,
      employeeID,
      rowsApptApproved,
      unfinishedAppts,
      rowsEmp,
      rowsServCategory,
      shopName,
   });
});

//RESCHEDULE APPOINTMENTS
router.get(
   "/:employeeID/:shopID/rescheduleAppointment:id",
   async (req, res) => {
      var id = req.params.id;
      acu.startConnection();
      await acu.updateSet(
         "tblappointment",
         "appStatusID = 3",
         "AppointmentID = " + id
      );

      var { name, service, employee, date, time } = req.body;
      //Para kumuha ng values sa loob ng shop services
      var ss = await acu.getOneFromWhere(
         "tblshopservices",
         "shopServicesID = " + service + " AND shopID = " + req.params.shopID
      );
      var shopServiceID = ss.shopServicesID;
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
      res.redirect(
         "/deskAccount/" +
            req.params.employeeID +
            "/" +
            req.params.shopID +
            +"/appointments"
      );
   }
);

//CANCEL APPOINTMENTS
router.get("/:employeeID/:shopID/cancelAppt:id", async (req, res) => {
   var id = req.params.id;
   acu.startConnection();
   await acu.updateSet(
      "tblappointment",
      "appStatusID = 3",
      "AppointmentID = " + id
   );
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/appointments"
   );
});

//COMPLETE APPOINTMENTS
router.post("/:employeeID/:shopID/completeAppt:id", async (req, res) => {
   var id = req.params.id;
   var appointmentStatus = req.body.appointmentStatus;
   acu.startConnection();
   var customer = await acu.getOneFromWhere(
      "tblappointment",
      "AppointmentID = " + req.params.id
   );
   var customerID = customer.CustomerID;
   if (appointmentStatus == 0) {
      await acu.redTag(customerID);
   }

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
         var newDate = new Date(dateHolder);

         function addZero(i) {
            if (i < 10) {
               i = "0" + i;
            }
            return i;
         }

         var mm = addZero(newDate.getMonth() + 1);
         var dd = addZero(newDate.getDate());
         var yy = newDate.getFullYear();
         var appointmentDate = yy + "-" + mm + "-" + dd;

         const d = new Date();
         let h = addZero(d.getHours());
         let m = addZero(d.getMinutes());
         let time = h + ":" + m;

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
   res.redirect(
      "/deskAccount/" +
         req.params.employeeID +
         "/" +
         req.params.shopID +
         "/appointments"
   );
});

router
   .route("/:employeeID/:shopID/appointments/generateCustomerVolumeReport")
   .post(async (req, res) => {
      const { daterangeCustomerVolume } = req.body;
      var shopID = req.params.shopID;
      var employeeID = req.params.employeeID;

      //get desk name
      acu.startConnection();
      var a = await acu.getOneFromWhere(
         "tblemployee",
         "EmployeeID = " + employeeID
      );
      var author = a.firstName + " " + a.lastName;
      //FOR PDF GENERATION
      const stream = res.writeHead(200, {
         "Content-Type": "application/pdf",
         "Content-Disposition": "attatchment;filename=reports.pdf",
      });
      acu.generateCustomerVolumePDF(
         author,
         shopID,
         daterangeCustomerVolume,
         (chunk) => stream.write(chunk),
         () => stream.end()
      );
   });

router
   .route("/:employeeID/:shopID/appointments/generateSalesReport")
   .post(async (req, res) => {
      const { daterangeSales } = req.body;
      var shopID = req.params.shopID;
      var employeeID = req.params.employeeID;

      //get desk name
      acu.startConnection();
      var a = await acu.getOneFromWhere(
         "tblemployee",
         "EmployeeID = " + employeeID
      );
      var author = a.firstName + " " + a.lastName;
      //FOR PDF GENERATION
      const stream = res.writeHead(200, {
         "Content-Type": "application/pdf",
         "Content-Disposition": "attatchment;filename=reports.pdf",
      });
      acu.generateSalesReportPDF(
         author,
         shopID,
         daterangeSales,
         (chunk) => stream.write(chunk),
         () => stream.end()
      );
   });

router
   .route("/:employeeID/:shopID/appointments/generateSalaryReport")
   .post(async (req, res) => {
      var { employee, salaryType, salaryTypeValue, amount, monthPicker } =
         req.body;
      var shopID = req.params.shopID;
      var employeeID = req.params.employeeID;

      //get desk name
      var a = await acu.getOneFromWhere(
         "tblemployee",
         "EmployeeID = " + employeeID
      );
      var author = a.firstName + " " + a.lastName;

      //FOR PDF GENERATION
      const stream = res.writeHead(200, {
         "Content-Type": "application/pdf",
         "Content-Disposition": "attatchment;filename=reports.pdf",
      });
      acu.generateSalaryReportPDF(
         author,
         shopID,
         monthPicker,
         employee,
         salaryType,
         salaryTypeValue,
         amount,
         (chunk) => stream.write(chunk),
         () => stream.end()
      );
   });

router
   .route("/:employeeID/:shopID/appointments/generateTransaction:transactionID")
   .get(async (req, res) => {
      shopID = req.params.shopID;
      transID = req.params.transactionID;
      var employeeID = req.params.employeeID;

      //get desk name
      acu.startConnection();
      var a = await acu.getOneFromWhere(
         "tblemployee",
         "EmployeeID = " + employeeID
      );
      var author = a.firstName + " " + a.lastName;

      //FOR PDF GENERATION
      const stream = res.writeHead(200, {
         "Content-Type": "application/pdf",
         "Content-Disposition": "attatchment;filename=reports.pdf",
      });
      console.log("this is shopID: " + shopID);
      acu.generateTransactionPDF(
         author,
         shopID,
         transID,
         (chunk) => stream.write(chunk),
         () => stream.end()
      );
   });
module.exports = router;
