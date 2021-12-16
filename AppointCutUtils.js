const mysql2 = require("mysql2/promise");
PDFDocument = require("pdfkit-table");
// Connection Pool
let connection;

function startConnection() {
   if (!connection) {
      connection = mysql2.createPool({
         host: process.env.DB_HOST,
         user: process.env.DB_USER,
         port: process.env.DB_PORT,
         password: process.env.DB_PASS,
         database: process.env.DB_NAME,
      });
   }
}

async function getAllFrom(table) {
   let query = "SELECT * FROM " + table;
   var rows = await connection.query(query);
   return rows[0];
}

async function getAllFromWhere(table, where) {
   let query = "SELECT * FROM " + table + " WHERE " + where;
   console.log(query);
   var rows = await connection.query(query);
   return rows[0];
}

async function getOneFromWhere(table, where) {
   let query = "SELECT * FROM " + table + " WHERE " + where;
   console.log(query);
   var rows = await connection.query(query);
   return rows[0][0];
}

async function getAllFromServices() {
   var query =
      "SELECT tblservices.ServicesID, tblservices.Name, tblcategory.Name as Category FROM tblservices INNER JOIN tblcategory ON tblservices.CategoryID = tblcategory.CategoryID";
   var rows = await connection.query(query);
   return rows[0];
}

async function getAllFromBarangay() {
   var query =
      "SELECT tblbarangay.BarangayID, tblbarangay.Name, tblcity.Name as City FROM tblcity INNER JOIN tblbarangay ON tblbarangay.CityID = tblcity.CityID";
   var rows = await connection.query(query);
   return rows[0];
}

async function insertInto(table, values) {
   let query = "INSERT INTO " + table + " VALUES " + values;
   var id = await connection.query(query).then(async (mess) => {
      return await mess[0];
   });
   console.log(query);
   return await id;
}

async function updateSet(table, values, where) {
   let query = "UPDATE " + table + " SET " + values + " WHERE " + where;
   console.log(query);
   var rows = await connection.query(query);
}

async function generateCustomerVolumePDF(
   shopID,
   daterangeCustomerVolume,
   startCallback,
   endCallback
) {
   var dateStart = daterangeCustomerVolume.substring(0, 10);
   var dateEnd = daterangeCustomerVolume.substring(
      13,
      daterangeCustomerVolume.length
   );
   var completedAppts = [];
   var ds = new Date(dateStart);
   var de = new Date(dateEnd);

   startConnection();
   var shop = await getOneFromWhere("tblshop", "shopID = " + shopID);
   var shopName = shop.shopName;
   const appointments = await getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID
   );

   //get all the appointments within the date range
   for (var i = 0; i < appointments.length; i++) {
      var tempDate = new Date(appointments[i].Date);
      if (tempDate >= ds && tempDate <= de) {
         completedAppts.push(appointments[i]);
      }
   }

   //create document
   const doc = new PDFDocument();
   doc.on("data", startCallback);
   doc.on("end", endCallback);

   doc.font("Times-Bold").text(shopName, {
      align: "center",
   });
   doc.font("Times-Bold").text("Customer Volume Report", {
      align: "center",
   });
   doc.font("Times-Bold")
      .text(daterangeCustomerVolume, {
         align: "center",
      })
      .moveDown();

   //get all appointments within the day
   while (ds <= de) {
      var noShow = 0,
         completed = 0,
         canceled = 0;
      doc.font("Times-Bold")
         .fontSize(12)
         .text("Date: " + ds.toLocaleDateString());
      for (var i = 0; i < completedAppts.length; i++) {
         var tempDate = new Date(completedAppts[i].Date);
         if (tempDate + "" == ds + "") {
            var name = "";
            completedAppts[i].CustomerName == null
               ? (name = completedAppts[i].WalkInName)
               : (name = completedAppts[i].CustomerName);
            doc.font("Times-Roman")
               .fontSize(12)
               .text(name + " (" + completedAppts[i].AppointmentStatus + ") ");
            if (completedAppts[i].AppointmentStatus == "Completed") {
               completed++;
            } else if (completedAppts[i].AppointmentStatus == "No Show") {
               noShow++;
            } else if (completedAppts[i].AppointmentStatus == "Cancelled") {
               canceled++;
            }
         }
      }

      doc.font("Times-Bold")
         .fontSize(12)
         .text("Total Completed Appointments: " + completed);
      doc.font("Times-Bold")
         .fontSize(12)
         .text("Total No Show Appointments: " + noShow);
      doc.font("Times-Bold")
         .fontSize(12)
         .text("Total Cancelled Appointments: " + canceled);
      var m = ds.getMonth() + 1;
      var d = ds.getDate() + 1;
      var y = ds.getFullYear();
      ds = new Date(m + " " + d + " " + y);

      doc.moveDown();
   }
   doc.end();
}

async function generateSalesReportPDF(
   shopID,
   daterangeSales,
   startCallback,
   endCallback
) {
   var dateStart = daterangeSales.substring(0, 10);
   var dateEnd = daterangeSales.substring(13, daterangeSales.length);
   var completedAppts = [];
   var ds = new Date(dateStart);
   var de = new Date(dateEnd);

   startConnection();
   var shop = await getOneFromWhere("tblshop", "shopID = " + shopID);
   var shopName = shop.shopName;
   const appointments = await getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + " AND AppointmentStatus = 'Completed'"
   );

   //get all the appointments within the date range
   for (var i = 0; i < appointments.length; i++) {
      var tempDate = new Date(appointments[i].Date);
      if (tempDate >= ds && tempDate <= de) {
         completedAppts.push(appointments[i]);
      }
   }

   //create document
   const doc = new PDFDocument();
   doc.on("data", startCallback);
   doc.on("end", endCallback);

   doc.font("Times-Bold").text(shopName, {
      align: "center",
   });
   doc.font("Times-Bold").text("Sales Report", {
      align: "center",
   });
   doc.font("Times-Bold")
      .text(daterangeSales, {
         align: "center",
      })
      .moveDown();

   //get all appointments within the day
   while (ds <= de) {
      var table = {
         headers: ["Customer Name", "Service", "Amount"],
         rows: [],
      };

      var sales = 0;
      doc.font("Times-Bold")
         .fontSize(12)
         .text("Date: " + ds.toLocaleDateString());
      for (var i = 0; i < completedAppts.length; i++) {
         var tempDate = new Date(completedAppts[i].Date);
         if (tempDate + "" == ds + "") {
            var name = "";
            completedAppts[i].CustomerName == null
               ? (name = completedAppts[i].WalkInName)
               : (name = completedAppts[i].CustomerName);
            table.rows.push([
               name,
               completedAppts[i].Service,
               completedAppts[i].Amount,
            ]);
            sales += completedAppts[i].Amount;
         }
      }
      if (sales != 0) {
         doc.table(table);
      }

      doc.font("Times-Bold")
         .fontSize(12)
         .text("Total Sales: " + sales);

      var m = ds.getMonth() + 1;
      var d = ds.getDate() + 1;
      var y = ds.getFullYear();
      ds = new Date(m + " " + d + " " + y);

      doc.moveDown();
   }
   doc.end();
}

async function generateSalaryReportPDF(
   shopID,
   month,
   employee,
   salaryType,
   salaryValue,
   amount,
   startCallback,
   endCallback
) {
   startConnection();
   var shop = await getOneFromWhere("tblshop", "shopID = " + shopID);
   var shopName = shop.shopName;
   const appointments = await getAllFromWhere(
      "appointcutdb.appointment",
      "shopID = " + shopID + " AND AppointmentStatus = 'Completed'"
   );
   //create document
   const doc = new PDFDocument();
   doc.on("data", startCallback);
   doc.on("end", endCallback);

   doc.font("Times-Bold").text(shopName, {
      align: "center",
   });
   doc.font("Times-Bold").text("Salary Report", {
      align: "center",
   });
   doc.font("Times-Bold")
      .text(month, {
         align: "center",
      })
      .moveDown();

   var table = {
      headers: ["Employee Name", "Salary Type", "Salary Value", "Amount"],
      rows: [],
   };

   for (var i = 0; i < employee.length; i++) {
      table.rows.push([employee[i], salaryType[i], salaryValue[i], amount[i]]);
   }
   doc.table(table);
   doc.moveDown();
   doc.end();
}

async function generateTransactionPDF(
   shopID,
   transID,
   startCallback,
   endCallback
) {
   startConnection();
   var shop = await getOneFromWhere("tblshop", "shopID = " + shopID);
   var shopName = shop.shopName;
   var transaction = await getOneFromWhere(
      "appointcutdb.transactions",
      `transactionID = "${transID}"`
   );

   function addZero(i) {
      if (i < 10) {
         return "0" + i;
      }
   }
   /* var tempDate = new Date(transaction.Date);
   var m = addZero(tempDate.getMonth() + 1);
   var d = addZero(tempDate.getDate());
   var y = tempDate.getFullYear(); */

   var name = "";
   transaction.customerName != null
      ? (name = transaction.customerName)
      : (name = transaction.WalkIn);

   const doc = new PDFDocument();
   doc.on("data", startCallback);
   doc.on("end", endCallback);

   doc.font("Helvetica-Bold").text(shopName, {
      align: "center",
   });
   doc.text(transaction.Street + " " + transaction.Barangay + ",", {
      align: "center",
   });
   doc.text(transaction.City, {
      align: "center",
   });
   doc.text(transaction.Contact, {
      align: "center",
   }).moveDown();

   doc.text(`Customer Name: ${name}`);
   doc.text(transaction.Date.toLocaleDateString() + " " + transaction.Time);
   var table = {
      headers: ["Employee", "Service", "Amount"],
      rows: [[transaction.Service, transaction.Employee, transaction.Amount]],
   };

   const options = {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12), // {Function}
      prepareRow: (row, indexColumn, indexRow, rectRow) =>
         doc.font("Helvetica").fontSize(12), // {Function}
   };
   doc.table(table, options);
   doc.text("Amount Due: " + transaction.Amount, { align: "right" });

   doc.end();
}

module.exports = {
   getAllFrom,
   getAllFromWhere,
   getOneFromWhere,
   getAllFromServices,
   getAllFromBarangay,
   insertInto,
   updateSet,
   startConnection,
   generateCustomerVolumePDF,
   generateSalesReportPDF,
   generateSalaryReportPDF,
   generateTransactionPDF,
};
