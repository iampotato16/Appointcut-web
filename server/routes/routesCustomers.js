const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()

const title = "Customers"

router.route('/')
    .get(async (req, res) => {
        await acu.startConnection();
        const rows = await acu.getAllFrom('tblCustomers')
            .catch(err => {
                console.error("Error getting all from customer:" + err)
            });
        console.log(rows)
        res.render('customers', { layout: 'home-admin', title , rows});
    })
    .post((req, res) => {
        var addInput = req.body;
        console.log("Received post request at customerPost with request: ", [addInput]);
        res.redirect('/customers');
    })

module.exports = router;


