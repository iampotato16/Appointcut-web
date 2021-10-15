const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const mysql2 = require('mysql2');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
// Parse application/json
// app.use(bodyParser.json());
app.use(express.json()); // New

// Static Files
app.use(express.static('public'));

// Templating Engine
app.engine('hbs', expressHbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//ROUTES
const routes = require('./server/routes/users');
app.use('/', routes);




//sample users database 
// const usersMockDB = [
//    { 'id': '001', 'username': 'Barber', 'email': 'miguel@asd.com', 'status': 'alive' },
//    { 'id': '002', 'username': 'Owner', 'email': 'arthur@asd.com', 'status': 'dead-inside' },
//    { 'id': '003', 'username': 'Front Desk', 'email': 'jansen@asd.com', 'status': 'alive' }
// ];

// const rowDataFaceShape = [
//    { 'id': "0001", 'name': "Square" },
//    { 'id': "0002", 'name': "Circle" },
//    { 'id': "0003", 'name': "Oval" },
//    { 'id': "0004", 'name': "Oblong" },
//    { 'id': "0005", 'name': "Diamond" },
//    { 'id': "0006", 'name': "Square" }
// ];

// const rowDataCategory = [
//    { 'id': "0001", 'name': "Hair" },
//    { 'id': "0002", 'name': "Nails" },
//    { 'id': "0003", 'name': "Shave" },
//    { 'id': "0004", 'name': "Waxing Services" },
//    { 'id': "0005", 'name': "Others" }
// ];

// const rowDataSpecialization = [
//    { 'id': "0001", 'name': "Hair Stylist" },
//    { 'id': "0002", 'name': "Nail Technician" },
//    { 'id': "0003", 'name': "Ethestician" },
//    { 'id': "0004", 'name': "Masseuse" }
// ];

// const rowDataHaircuts = [
//    { 'id': "0001", 'name': "Buzz Cut" },
//    { 'id': "0002", 'name': "Semi Kalbo" },
//    { 'id': "0003", 'name': "Kalbo" }
// ];

// const rowDataCity = [
//    { 'id': "0001", 'name': "Quezon City" },
//    { 'id': "0002", 'name': "Manila" },
//    { 'id': "0003", 'name': "Makati" },
//    { 'id': "0002", 'name': "Caloocan" }
// ];

// const rowDataBrgy = [
//    { 'id': "0001", 'name': "Brgy 1" },
//    { 'id': "0002", 'name': "Brgy 2" },
//    { 'id': "0003", 'name': "Brgy 3" },
//    { 'id': "0002", 'name': "Brgy 4" },
//    { 'id': "0001", 'name': "Brgy 1" },
//    { 'id': "0002", 'name': "Brgy 2" },
//    { 'id': "0003", 'name': "Brgy 3" },
//    { 'id': "0002", 'name': "Brgy 4" }
// ];

// const rowDataServices = [
//    { 'id': "0001", 'category': "Hair", 'name': "Haircut" },
//    { 'id': "0001", 'category': "Nails", 'name': "Manicure" },
//    { 'id': "0001", 'category': "Nails", 'name': "Pedicure" },
//    { 'id': "0001", 'category': "Hair", 'name': "Hair Color" },
//    { 'id': "0001", 'category': "Hair", 'name': "Perm" },
//    { 'id': "0001", 'category': "Massage", 'name': "Backstroke" }
// ];

// var hbs = expressHbs.create({});

// hbs.handlebars.registerHelper('isCalled', function (value) {
//    return value = true;
// });

//functionssssssss

// function renderFormUsertype() {
//    console.log('samting ')
// }


app.listen(port, () => {
   console.log('Gumagana sa ikatatlong libong port')
})