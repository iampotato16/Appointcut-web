const acu = require("../../AppointCutUtils");
const express = require("express");
const router = express.Router();
const mysql2 = require("mysql2/promise");

router.route("/schedule").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("tblschedule");
   res.send(rows);
});

router.route("/services").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("tblservices");
   res.send(rows);
});

router.route("/barangay").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("tblbarangay");
   res.send(rows);
});

router.route("/shopservices").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("tblshopservices");
   res.send(rows);
});

router.route("/shopservicesview").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("appointcutdb.shopservices");
   res.send(rows);
});

router.route("/employeeSpecialization").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("appointcutdb.employeespecialization");
   res.send(rows);
});

router.route("/appointments").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("tblappointment");
   res.send(rows);
});

router.route("/appointmentviews").get(async (req, res) => {
   acu.startConnection();
   const rows = await acu.getAllFrom("appointcutdb.appointment");
   res.send(rows);
});

module.exports = router;
