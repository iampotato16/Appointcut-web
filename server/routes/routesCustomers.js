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
        res.render('customers', { layout: 'home-admin', title , rows});
    })
    .post((req, res) => {
        var addInput = req.body;
        console.log("Received post request at customerPost with request: ", [addInput]);
        res.redirect('/customers');
    })
router.post('/edit',(req,res)=>{
    const reqString = JSON.stringify(req.body);
    res.send(`Edit post receieved with request ${reqString}`)
})

module.exports = router;


