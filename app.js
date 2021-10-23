const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// Static Files
app.use(express.static('public'));

// Templating Engine
app.engine('hbs', expressHbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');

//Owners Maintenance
const  routesOwners = require('./server/routes/routesOwners')
app.use('/owners', routesOwners);
//Customers Maintenance
const routesCustomers = require('./server/routes/routesCustomers');
app.use('/customers',routesCustomers);
//Shops Maintenance
const routesShops = require('./server/routes/routesShops');
app.use('/shops',routesShops);
//ROUTES
const routes = require('./server/routes/users');
app.use('/', routes);

app.listen(port, () => {
   console.log('Gumagana sa ikatatlong libong daungan')
})