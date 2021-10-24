const acu = require('../../AppointCutUtils')
const ModalConstructor = acu.ModalConstructor
const express = require('express')
const router = express.Router()



router.route('/')
    .get(async (req, res) => {
        const title = "Employee"
        await acu.startConnection();
        // const rows = await acu.getAllFrom('tblEmployees')
        //     .catch(err => {
        //         console.error("Error getting all from customer:" + err)
        //     });

        const rows = [{
            ID:1,
            username:"SomeCut",
            givenName:"Cinder",
            familyName:"Carter",
            EmployeeTypeID:1,
            shopID:14,
            salaryTypeValue:5000,
            salaryTypeID:1,
            balance:10000,
            password:"ewan"
        }]
        
        let mc = new ModalConstructor(title);
        mc.setAddAction("/employees");
        mc.setEditAction("/employees/edit")
        mc.addField("ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly")
        mc.addField("Username",ModalConstructor.TYPE_TEXT);
        mc.addField("Password",ModalConstructor.TYPE_PASSWORD);
        mc.addField("Given Name",ModalConstructor.TYPE_TEXT);
        mc.addField("Family Name",ModalConstructor.TYPE_TEXT);
        mc.addField("Employee Type",ModalConstructor.TYPE_TEXT);
        mc.addField("Shop",ModalConstructor.TYPE_TEXT);
        mc.addField("Salary Value",ModalConstructor.TYPE_TEXT);
        mc.addField("Salary Type",ModalConstructor.TYPE_TEXT,"","true");
        mc.addField("Balance",ModalConstructor.TYPE_TEXT);
        let employeeModal = mc.construct();
            
        res.render('employees', { layout: 'home-admin', title , rows, employeeModal});
    })
    .post((req, res) => {
        var addInput = req.body;
        console.log("Received post request at customerPost with request: ", [addInput]);
        res.redirect('/employees');
    })
router.post('/edit',(req,res)=>{
    const reqString = JSON.stringify(req.body);
    res.send(`Edit post receieved with request ${reqString}`)
})

module.exports = router;


