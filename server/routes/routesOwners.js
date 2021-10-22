const acu = require('../../AppointCutUtils')
const express = require('express')
const router = express.Router()
const ModalConstructor = acu.ModalConstructor;

const title = "Owners"

router.route('/')
.get((req,res) => {
    const rows = [{
        ID:2,
        givenName:"Zeraora",
        familyName:"Nominos",
        email:"NZora@gmail.com",
        contact:"09992415",
        password:"we really shouldnt be showing this"
    }]

    const mc = new ModalConstructor(title);
    mc.setAddAction("/owners");
    mc.setEditAction("/owners/edit");
    mc.addField("ID",ModalConstructor.TYPE_TEXT,"",ModalConstructor.VISIBILITY_EDIT,"readonly");
    mc.addField("Given Name",ModalConstructor.TYPE_TEXT);
    mc.addField("Family Name",ModalConstructor.TYPE_TEXT);
    mc.addField("E-Mail",ModalConstructor.TYPE_EMAIL);
    mc.addField("Contact"),ModalConstructor.TYPE_TEXT;
    mc.addField("Password",ModalConstructor.TYPE_PASSWORD);

    const ownerModal = mc.construct();
    res.render('owners',{layout:'home-admin',rows, ownerModal})
})
.post((req,res) => {
    res.json(req.body)
})

router.post('/edit', (req,res) => {
    res.json(req.body)

})


module.exports = router;