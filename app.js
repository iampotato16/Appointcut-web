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
// app.use(express.static('scripts'));
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Templating Engine
app.engine('hbs', expressHbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');


//Customers Maintenance
const ucCustomers = require('./server/routes/routesCustomers');
app.use('/customers',ucCustomers);
//ROUTES
const routes = require('./server/routes/users');
app.use('/', routes);




app.listen(port, () => {
   console.log('Gumagana sa ikatatlong libong port')
})