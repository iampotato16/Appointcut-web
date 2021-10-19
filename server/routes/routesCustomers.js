const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()



router.get('/', async (req,res)=>{
        await acu.startConnection();
        const rows = await acu.getAllFrom('tblCustomers')
        .catch(err=>{
            console.error("Error getting all from customer:" + err)
        });
        res.render('customers', { layout: 'home-admin',title});

})

module.exports = router;


const title = "Customers"
// exports.customers = async (req,res) =>{
//     await acu.startConnection();
//     const rows = await acu.getAllFrom('tblCustomers')
//     .catch(err=>{
//         console.error("Error getting all from customer:" + err)
//     });
//     res.render('customers', { layout: 'home-admin',title});
// }
// exports.customersPost = (req,res) =>{
//     var addInput = req.body.inputAddCustomer;
//     console.log("Received post request at customerPost with request: ",[addInput]);
//     res.render('customers', { layout: 'home-admin'});
// }