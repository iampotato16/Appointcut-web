const acu = require('../../AppointCutUtils')
const ModalConstructor = acu.ModalConstructor
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
        
        let mc = new ModalConstructor(title);
        mc.setAddAction("/customers");
        mc.setEditAction("/customers/edit")
        mc.addField("ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly")
        mc.addField("Given Name",ModalConstructor.TYPE_TEXT);
        mc.addField("Family Name",ModalConstructor.TYPE_TEXT);
        mc.addField("E-Mail",ModalConstructor.TYPE_EMAIL);
        mc.addField("Contact",ModalConstructor.TYPE_TEXT);
        mc.addField("Password",ModalConstructor.TYPE_PASSWORD);
        mc.addField("Guest",ModalConstructor.TYPE_CHECKBOX,"","true");
        mc.addField("Disabled",ModalConstructor.TYPE_CHECKBOX,);
        let customerModal = mc.construct();
            
        res.render('customers', { layout: 'home-admin', title , rows, customerModal});
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


