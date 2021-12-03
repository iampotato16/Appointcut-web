const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Static Files
app.use(express.static("public"));

// Templating Engine
app.engine("hbs", expressHbs({ extname: ".hbs" }));
app.set("view engine", "hbs");

// HANDLEBAR HELPER
var hbs = expressHbs.create({});
hbs.handlebars.registerHelper(
   "withinShop",
   function (employeeID, employeeIDSched) {
      if (employeeID == employeeIDSched) {
         return true;
      }
   }
);

hbs.handlebars.registerHelper("isBarber", function (employeeTypeID) {
   if (employeeTypeID == 1) {
      return true;
   }
});

hbs.handlebars.registerHelper(
   "isCategory",
   function (categoryID, serviceCategoryID) {
      if (categoryID == serviceCategoryID) {
         return true;
      }
   }
);

//Login
const routesLogin = require("./server/routes/routesLogin");
app.use("/", routesLogin);

//Sign Up
const routesSignup = require("./server/routes/routesSignup");
app.use("/signup", routesSignup);

//Owner Account
const routesOwnerAccount = require("./server/routes/routesOwnerAccount");
app.use("/ownerAccount", routesOwnerAccount);

//Desk Account
const routesDeskAccount = require("./server/routes/routesDeskAccount");
app.use("/deskAccount", routesDeskAccount);

//Employee Maintenance
const routesEmployees = require("./server/routes/routesEmployees");
app.use("/employees", routesEmployees);

//Owners Maintenance
const routesOwners = require("./server/routes/routesOwners");
app.use("/owners", routesOwners);

//Customers Maintenance
const routesCustomers = require("./server/routes/routesCustomers");
app.use("/customers", routesCustomers);

//Shops Maintenance
const routesShops = require("./server/routes/routesShops");
app.use("/shops", routesShops);

//File Maintenance
const routesFileMaintenance = require("./server/routes/routesFileMaintenance");
app.use("/fileMaintenance", routesFileMaintenance);

//Barber Apps Maintenance
const routesBarberApps = require("./server/routes/routesBarberApps");
app.use("/barberApps", routesBarberApps);

//GET INFO FOR FETCH
//Barber Schedule
const getInfo = require("./server/routes/getInfo");
app.use("/getInfo", getInfo);

//REST
//Tokens
const routesRestToken = require('./server/routes/Rest/routesToken')
app.use('/rest/token', routesRestToken)
//shops
const routesRestShop = require('./server/routes/Rest/routesShop.js')
app.use('/rest/shops', routesRestShop)
//barbers
const routesRestBarbers = require('./server/routes/Rest/routesBarbers.js')
app.use('/rest/barbers', routesRestBarbers)
//appointments
const routesAppointments = require('./server/routes/Rest/routesAppointments')
app.use('/rest/appointments', routesAppointments)

app.listen(port, () => {
   console.log("Gumagana sa ikatatlong libong daungan");
});
